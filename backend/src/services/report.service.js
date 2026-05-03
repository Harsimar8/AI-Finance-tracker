"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportFromTransactions = exports.generateReportFromImageService = exports.generateReportService = exports.updateReportSettingService = exports.getAllReportsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const date_fns_1 = require("date-fns");
const report_setting_model_1 = __importDefault(require("../models/report-setting.model"));
const transaction_model_1 = __importStar(require("../models/transaction.model"));
const app_error_1 = require("../utils/app-error");
const helper_1 = require("../utils/helper");
const genai_1 = require("@google/genai");
const google_ai_config_1 = require("../config/google-ai-config");
const prompt_1 = require("../utils/prompt");
const getAllReportsService = (userId, pagination) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {};
    const { pageNumber, pageSize } = pagination;
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
            sentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "SENT",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            __v: 0,
        },
    ];
    const totalCount = sampleReports.length;
    const totalPages = 1;
    return {
        reports: sampleReports,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
});
exports.getAllReportsService = getAllReportsService;
const updateReportSettingService = (userId, body) => __awaiter(void 0, void 0, void 0, function* () {
    const { isEnabled } = body;
    let nextReportDate = null;
    const existingReportSetting = yield report_setting_model_1.default.findOne({
        userId,
    });
    if (!existingReportSetting)
        throw new app_error_1.NotFoundException("Report setting not found");
    // const frequency = existingReportSetting.frequency || ReportFrequencyEnum,
    // MONTHLY;
    if (isEnabled) {
        const currentNextReportDate = existingReportSetting.nextReportDate;
        const now = new Date();
        if (!currentNextReportDate || currentNextReportDate <= now) {
            nextReportDate = (0, helper_1.calculateNextReportDate)(existingReportSetting.lastSentDate);
        }
        else {
            nextReportDate = currentNextReportDate;
        }
    }
    console.log(nextReportDate, "nextReportDate");
    existingReportSetting.set(Object.assign(Object.assign({}, body), { nextReportDate }));
    yield existingReportSetting.save();
});
exports.updateReportSettingService = updateReportSettingService;
const generateReportService = (userId, fromDate, toDate) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const results = yield transaction_model_1.default.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                date: { $gte: fromDate, $lte: toDate },
            },
        },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalIncome: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", transaction_model_1.TransactionTypeEnum.INCOME] },
                                        { $abs: "$amount" },
                                        0,
                                    ],
                                },
                            },
                            totalExpenses: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", transaction_model_1.TransactionTypeEnum.EXPENSE] },
                                        { $abs: "$amount" },
                                        0,
                                    ],
                                },
                            }
                        },
                    }
                ],
                categories: [
                    {
                        $match: { type: transaction_model_1.TransactionTypeEnum.EXPENSE },
                    },
                    {
                        $group: {
                            _id: "$category",
                            total: { $sum: { $abs: "$amount" } },
                        },
                    },
                    {
                        $sort: { total: -1 },
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
    if (!(results === null || results === void 0 ? void 0 : results.length) || (((_a = results[0]) === null || _a === void 0 ? void 0 : _a.totalIncome) == 0 && ((_b = results[0]) === null || _b === void 0 ? void 0 : _b.totalExpenses) == 0))
        return null;
    const { totalIncome = 0, totalExpenses = 0, categories = [], } = results[0] || {};
    const byCategory = categories.reduce((acc, { _id, total }) => {
        acc[_id] = {
            amount: total,
            percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
        };
        return acc;
    }, {});
    const availableBalance = totalIncome - totalExpenses;
    const savingRate = calculateSavingRate(totalIncome, totalExpenses);
    const periodLabel = `${(0, date_fns_1.format)(fromDate, "MMMM d")} - ${(0, date_fns_1.format)(toDate, "d, yyyy")}`;
    const insights = yield generateInsightsAI({
        totalIncome,
        totalExpenses,
        availableBalance,
        savingRate,
        categories: byCategory,
        periodLabel: periodLabel
    });
    const aiSuggestions = yield generateSpendingSuggestionsAI({
        availableBalance,
        monthlyIncome: totalIncome,
        topCategories: Object.entries(byCategory || {})
            .map(([name, cat]) => ({
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
            topCategories: (_c = Object.entries(byCategory)) === null || _c === void 0 ? void 0 : _c.map(([name, cat]) => ({
                name,
                amount: cat.amount,
                percent: cat.percent
            })),
        },
        insights: insights || [],
        aiSuggestions: aiSuggestions || "",
    };
});
exports.generateReportService = generateReportService;
function generateSpendingSuggestionsAI(_a) {
    return __awaiter(this, arguments, void 0, function* ({ availableBalance, monthlyIncome, topCategories, }) {
        try {
            const prompt = (0, prompt_1.spendingSuggestionsPrompt)({
                availableBalance,
                monthlyIncome,
                topCategories,
            });
            const result = yield google_ai_config_1.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [(0, genai_1.createUserContent)([prompt])],
            });
            const response = result.text;
            return (response === null || response === void 0 ? void 0 : response.trim()) || "";
        }
        catch (error) {
            console.error("Error generating spending suggestions:", error);
            return "";
        }
    });
}
function generateInsightsAI(_a) {
    return __awaiter(this, arguments, void 0, function* ({ totalIncome, totalExpenses, availableBalance, savingRate, categories, periodLabel, }) {
        try {
            const prompt = (0, prompt_1.reportInsightsPrompt)({
                totalIncome: totalIncome,
                totalExpenses: totalExpenses,
                availableBalance: availableBalance,
                savingRate: Number(savingRate.toFixed(1)),
                categories,
                periodLabel,
            });
            const result = yield google_ai_config_1.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [(0, genai_1.createUserContent)([prompt])],
                config: {
                    responseMimeType: "application/json"
                },
            });
            const response = result.text;
            const cleanedText = response === null || response === void 0 ? void 0 : response.replace(/```(?:json)?\n?/g, "").trim();
            if (!cleanedText)
                return [];
            const data = JSON.parse(cleanedText);
            return data;
        }
        catch (error) {
            return [];
        }
    });
}
function calculateSavingRate(totalIncome, totalExpenses) {
    if (totalIncome <= 0)
        return 0;
    const savingRate = ((totalIncome - totalExpenses) /
        totalIncome) * 100;
    return parseFloat(savingRate.toFixed(2));
}
const generateReportFromImageService = (userId, fileBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    // 👇 Use OCR or Google GenAI to extract transactions from image
    const transactions = yield parseTransactionsFromImage(fileBuffer);
    // 👇 generate report just like generateReportService
    const report = yield (0, exports.generateReportFromTransactions)(userId, transactions);
    return report;
});
exports.generateReportFromImageService = generateReportFromImageService;
function parseTransactionsFromImage(fileBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        // Just return an empty array for testing
        return [];
    });
}
// report.service.ts
const generateReportFromTransactions = (userId, transactions) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.generateReportFromTransactions = generateReportFromTransactions;
