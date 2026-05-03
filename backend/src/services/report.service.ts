import mongoose from "mongoose";
import { format } from "date-fns";
import ReportSettingModel, { ReportFrequencyEnum } from "../models/report-setting.model";
import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model";
import { NotFoundException } from "../utils/app-error";
import { calculateNextReportDate } from "../utils/helper";
import { UpdateReportSettingDTO } from "../validators/report_validator";
import { createUserContent, GenerateImagesResponse } from "@google/genai";
import { genAI } from "../config/google-ai-config";
import { reportInsightsPrompt, spendingSuggestionsPrompt } from "../utils/prompt";

export const getAllReportsService = async (
    userId: String,
    pagination:{
        pageSize: number;
        pageNumber: number;
    }
) => {
    const query: Record<string, any> = {};
    const { pageNumber, pageSize} = pagination;
    const skip = (pageNumber - 1) * pageSize;
    
    // Return sample reports since there's no report history model
    const sampleReports = [
        {
            _id: "1",
            userId: userId.toString(),
            period: "April 2026",
            sentDate: new Date().toISOString(),
            status: "SENT",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
        },
        {
            _id: "2", 
            userId: userId.toString(),
            period: "March 2026",
            sentDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
            status: "SENT",
            createdAt: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
            updatedAt: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
            __v: 0,
        },
    ];
    
    const totalCount = sampleReports.length;
    const totalPages = 1;

    return{
        reports: sampleReports,
        pagination:{
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
};

export const updateReportSettingService = async(
    userId: string,
    body: UpdateReportSettingDTO
) => {
    const { isEnabled } = body;
    let nextReportDate: Date | null = null;
    const existingReportSetting = await ReportSettingModel.findOne({
        userId,
    });
    if(!existingReportSetting)
        throw new NotFoundException("Report setting not found");

    // const frequency = existingReportSetting.frequency || ReportFrequencyEnum,
    // MONTHLY;

    if(isEnabled){
        const currentNextReportDate = existingReportSetting.nextReportDate;
        const now = new Date();
        if(!currentNextReportDate || currentNextReportDate <= now){
            nextReportDate = calculateNextReportDate(
                existingReportSetting.lastSentDate
            );
        }
        else{
            nextReportDate = currentNextReportDate;
        }
    }
    console.log(nextReportDate,"nextReportDate");
    

    existingReportSetting.set({
        ...body,
        nextReportDate,
    });

    await existingReportSetting.save();
};

export const generateReportService = async (
    userId: string,
    fromDate: Date,
    toDate: Date
) => {
    const results = await TransactionModel.aggregate([
        {
        $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: fromDate, $lte: toDate},
        },
        },

        {
            $facet:{
                summary:[
                    {
                        $group:{
                            _id: null,
                            totalIncome:{
                                $sum:{
                                    $cond:[{ $eq: ["$type", TransactionTypeEnum.INCOME]},
                                    {$abs: "$amount"},
                                    0,
                                ],
                                },
                            },
                            totalExpenses: {
                                 $sum:{
                                    $cond:[{ $eq: ["$type", TransactionTypeEnum.EXPENSE]},
                                    {$abs: "$amount"},
                                    0,
                                ],
                                },
                            }
                        },
                    }
                ],

                categories: [
                    {
                       $match: { type: TransactionTypeEnum.EXPENSE}, 
                    },
                    {
                        $group:{
                            _id: "$category",
                            total: {$sum: { $abs: "$amount" } },
                        },
                    },
                    {
                        $sort: {total: -1},
                    },
                    {
                        $limit: 5,
                    },

],
            },
        },
        {
            $project: {
                totalIncome: { $arrayElemAt: ["$summary.totalIncome", 0] },
                totalExpenses: {
                    $arrayElemAt: ["$summary.totalExpenses", 0],
                },
                categories: 1,
            }
        }
    ]);

    if(!results?.length || (results[0]?.totalIncome == 0 && results[0]?.totalExpenses == 0))
        return null;

    const { totalIncome = 0,
         totalExpenses = 0,
         categories = [],

     } = results[0] || {};

     const byCategory = categories.reduce(
        (acc: any, {_id, total}: any) => {
            acc[_id] = {
                amount: total,
                percentage : totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,

            };
            return acc;
        },
        {} as Record<string, {amount: number; percentage:
            number }>
        
     );

     const availableBalance = totalIncome - totalExpenses;
     const savingRate = calculateSavingRate(totalIncome, totalExpenses);

     const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;

     const insights = await generateInsightsAI({
        totalIncome,
        totalExpenses,
        availableBalance,
        savingRate,
        categories: byCategory,
        periodLabel: periodLabel

     });

     const aiSuggestions = await generateSpendingSuggestionsAI({
        availableBalance,
        monthlyIncome: totalIncome,
        topCategories: Object.entries(byCategory || {})
            .map(([name, cat]: any) => ({
                name,
                amount: cat.amount,
                percent: cat.percent,
            }))
            .slice(0, 5),
     });

     return {
        period: periodLabel,
        summary: {
            income: totalIncome,
            expenses: totalExpenses,
            balance: availableBalance,
            savingsRate: Number(savingRate.toFixed(1)),
            topCategories: Object.entries(byCategory)?.map
            (([name, cat]: any) =>({
                name,
                amount: cat.amount,
                percent: cat.percent
            })),
        },
insights: insights || [],
         aiSuggestions: aiSuggestions || "",
      };
};

async function generateSpendingSuggestionsAI({
    availableBalance,
    monthlyIncome,
    topCategories,
}: {
    availableBalance: number;
    monthlyIncome: number;
    topCategories: { name: string; amount: number; percent: number }[];
}) {
    try {
        const prompt = spendingSuggestionsPrompt({
            availableBalance,
            monthlyIncome,
            topCategories,
        });

        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [createUserContent([prompt])],
        });

        const response = result.text;
        return response?.trim() || "";
    } catch (error) {
        console.error("Error generating spending suggestions:", error);
        return `1. With ₹${availableBalance} available, consider allocating 20% (₹${Math.round(availableBalance * 0.2)}) to emergency fund
2. Track daily expenses to stay within budget
3. Review subscriptions and cancel unused services
4. Use cashback apps for essential purchases
5. Set aside ₹${Math.round(availableBalance * 0.1)} monthly for savings goals`;
    }
}

async function generateInsightsAI({
    totalIncome,
    totalExpenses,
    availableBalance,
    savingRate,
    categories,
    periodLabel,
}: {
    totalIncome: number;
    totalExpenses: number;
    availableBalance: number;
    savingRate: number;
    categories: Record<string, {amount: number; percentage:
        number }>;
    periodLabel: string;
}) {
    try{
        const prompt = reportInsightsPrompt({
            totalIncome : totalIncome,
        totalExpenses : totalExpenses,
        availableBalance: availableBalance,
        savingRate: Number(savingRate.toFixed(1)),
        categories,
        periodLabel,
        });

        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [createUserContent([prompt])],
            config: {
                responseMimeType: "application/json"
            },
        });

        const response = result.text;
        const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();
        
            if(!cleanedText) return [];
            const data = JSON.parse(cleanedText);
            return data;
    }
    catch(error){
        console.error("Error generating insights:", error);
        return [
            `Your savings rate is ${savingRate.toFixed(1)}% - aim for 20% to build wealth`,
            `Consider tracking expenses daily to identify spending patterns`,
            `Set aside at least 10% of income for emergencies`
        ];
    }
}

function calculateSavingRate(totalIncome: number,
totalExpenses: number){
    if(totalIncome <=0) return 0;
    const savingRate = ((totalIncome - totalExpenses)/
    totalIncome) * 100;
    return parseFloat(savingRate.toFixed(2));
}

export const generateReportFromImageService = async (userId: string, fileBuffer: Buffer) => {
    // 👇 Use OCR or Google GenAI to extract transactions from image
    const transactions = await parseTransactionsFromImage(fileBuffer);

    // 👇 generate report just like generateReportService
    const report = await generateReportFromTransactions(userId, transactions);

    return report;
};

async function parseTransactionsFromImage(fileBuffer: Buffer) {
  // Just return an empty array for testing
  return [];
}

// report.service.ts

export const generateReportFromTransactions = async (
  userId: string,
  transactions: any[]
) => {
  // Example: sum income and expenses
  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // return in the same format as generateReportService
  return {
    summary: {
      income: totalIncome,
      expenses: totalExpenses,
      balance,
    },
    transactions, // optional: include parsed transactions
  };
};