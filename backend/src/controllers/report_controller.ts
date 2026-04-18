import {Request, Response} from "express";
import {asyncHandler} from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { generateReportFromImageService, generateReportService, getAllReportsService,updateReportSettingService } from "../services/report.service";
import { updateReportSettingSchema } from "../validators/report_validator";
import { sendReportEmail } from "../utils/email";
import ReportSettingModel from "../models/report-setting.model";
import { UserDocument } from "../models/user.model";
import mongoose from "mongoose";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const getAllReportsController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        const pagination = {
            pageSize: parseInt(req.query.pageSize as string) || 20,
            pageNumber: parseInt(req.query.pageNumber as string) || 1,
        };

        const result = await getAllReportsService(userId, pagination);

        return res.status(HTTPSTATUS.OK).json({
            message: "Report history fetched successfully",
            ...result,
        });
    }
);

export const generateReportFromImageController = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw new Error("No file uploaded");

    // 1️⃣ Generate report from image (already exists)
    const report = await generateReportFromImageService(req.user?._id, file.buffer);

    // 2️⃣ Send real email with image attached
    await sendReportEmail({
      email: req.user?.email!,
      username: req.user?.name!,
      report,
      frequency: "Custom",
      attachment: { filename: "expense.png", content: file.buffer },
    });

    res.status(200).json({
      message: "Report generated from uploaded picture and emailed!",
    });
  }
);


export const updateReportSettingController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        
        const body = updateReportSettingSchema.parse(req.body);


        await updateReportSettingService(userId, body);

        return res.status(HTTPSTATUS.OK).json({
            message: "Report setting updated successfully",
        });
    }
);



export const generateReportController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        const userEmail = req.user?.email as string;
        const userName = req.user?.name as string || "User";
        console.log("Generating report for user:", userId, "email:", userEmail);
        
        try {
            const { from, to} = req.query;
            
            let fromDate: Date;
            let toDate: Date;
            
            if (from && to) {
                fromDate = new Date(from as string);
                toDate = new Date(to as string);
            } else {
                const now = new Date();
                toDate = now;
                fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            }

            console.log("Date range:", fromDate, "to", toDate);

            let report = await generateReportService(userId as string, fromDate, toDate);
            console.log("Generated report:", report);

            // If no transactions found, create a placeholder report
            if (!report) {
                report = {
                    period: `${fromDate.toDateString()} - ${toDate.toDateString()}`,
                    summary: {
                        income: 0,
                        expenses: 0,
                        balance: 0,
                        savingsRate: 0,
                        topCategories: [],
                    },
                };
            }

            // Send email to user with their report
            if (userEmail) {
                try {
                    await sendReportEmail({
                        email: userEmail,
                        username: userName,
                        report: {
                            period: report.period,
                            totalIncome: report.summary.income,
                            totalExpenses: report.summary.expenses,
                            availableBalance: report.summary.balance,
                            savingsRate: report.summary.savingsRate,
                            topSpendingCategories: report.summary.topCategories,
                        },
                        frequency: "Monthly",
                    });
                    console.log(`Report email sent to ${userEmail}`);
                } catch (emailError) {
                    console.error("Failed to send report email:", emailError);
                }
            } else {
                console.error("User email not found:", req.user);
            }

            return res.status(HTTPSTATUS.OK).json({
                message: "Report generated successfully",
                report,
            });
        } catch (error) {
            console.error("Error generating report:", error);
            return res.status(HTTPSTATUS.OK).json({
                message: "Report generation initiated",
            });
        }
    }
);

export const resendAllReportsController = asyncHandler(
    async (req: Request, res: Response) => {
        const now = new Date();
        const from = startOfMonth(subMonths(now, 1));
        const to = endOfMonth(subMonths(now, 1));

        const settings = await ReportSettingModel.find({
            isEnabled: true,
        }).populate<{ userId: UserDocument }>("userId");

        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (const setting of settings) {
            const user = setting.userId as UserDocument;
            if (!user || !user.email) {
                failCount++;
                continue;
            }

            try {
                const report = await generateReportService(user.id, from, to);

                if (report) {
                    await sendReportEmail({
                        email: user.email,
                        username: user.name || "User",
                        report: {
                            period: report.period,
                            totalIncome: report.summary.income,
                            totalExpenses: report.summary.expenses,
                            availableBalance: report.summary.balance,
                            savingsRate: report.summary.savingsRate,
                            topSpendingCategories: report.summary.topCategories,
                        },
                        frequency: "Monthly",
                    });
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error: any) {
                failCount++;
                errors.push(`Failed for ${user.email}: ${error.message}`);
            }
        }

        return res.status(HTTPSTATUS.OK).json({
            message: `Resend completed: ${successCount} sent, ${failCount} failed`,
            successCount,
            failCount,
            errors: errors.length > 0 ? errors : undefined,
        });
    }
);
