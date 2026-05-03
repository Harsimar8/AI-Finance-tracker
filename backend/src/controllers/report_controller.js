"use strict";
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
exports.resendAllReportsController = exports.generateReportController = exports.updateReportSettingController = exports.generateReportFromImageController = exports.getAllReportsController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const http_config_1 = require("../config/http.config");
const report_service_1 = require("../services/report.service");
const report_validator_1 = require("../validators/report_validator");
const email_1 = require("../utils/email");
const report_setting_model_1 = __importDefault(require("../models/report-setting.model"));
const date_fns_1 = require("date-fns");
exports.getAllReportsController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const pagination = {
        pageSize: parseInt(req.query.pageSize) || 20,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const result = yield (0, report_service_1.getAllReportsService)(userId, pagination);
    return res.status(http_config_1.HTTPSTATUS.OK).json(Object.assign({ message: "Report history fetched successfully" }, result));
}));
exports.generateReportFromImageController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const file = req.file;
    if (!file)
        throw new Error("No file uploaded");
    // 1️⃣ Generate report from image (already exists)
    const report = yield (0, report_service_1.generateReportFromImageService)((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, file.buffer);
    // 2️⃣ Send real email with image attached
    yield (0, email_1.sendReportEmail)({
        email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
        username: (_c = req.user) === null || _c === void 0 ? void 0 : _c.name,
        report: {
            period: (report === null || report === void 0 ? void 0 : report.period) || "Custom",
            totalIncome: ((_d = report === null || report === void 0 ? void 0 : report.summary) === null || _d === void 0 ? void 0 : _d.income) || 0,
            totalExpenses: ((_e = report === null || report === void 0 ? void 0 : report.summary) === null || _e === void 0 ? void 0 : _e.expenses) || 0,
            availableBalance: ((_f = report === null || report === void 0 ? void 0 : report.summary) === null || _f === void 0 ? void 0 : _f.balance) || 0,
            savingsRate: ((_g = report === null || report === void 0 ? void 0 : report.summary) === null || _g === void 0 ? void 0 : _g.savingsRate) || 0,
            topSpendingCategories: ((_h = report === null || report === void 0 ? void 0 : report.summary) === null || _h === void 0 ? void 0 : _h.topCategories) || [],
            insights: (report === null || report === void 0 ? void 0 : report.insights) || [],
        },
        frequency: "Custom",
        attachment: { filename: "expense.png", content: file.buffer },
    });
    res.status(200).json({
        message: "Report generated from uploaded picture and emailed!",
    });
}));
exports.updateReportSettingController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const body = report_validator_1.updateReportSettingSchema.parse(req.body);
    yield (0, report_service_1.updateReportSettingService)(userId, body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Report setting updated successfully",
    });
}));
exports.generateReportController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    const userName = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.name) || "User";
    console.log("Generating report for user:", userId, "email:", userEmail);
    try {
        const { from, to } = req.query;
        let fromDate;
        let toDate;
        if (from && to) {
            fromDate = new Date(from);
            toDate = new Date(to);
        }
        else {
            const now = new Date();
            toDate = now;
            fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        }
        console.log("Date range:", fromDate, "to", toDate);
        let report = yield (0, report_service_1.generateReportService)(userId, fromDate, toDate);
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
                insights: [],
                aiSuggestions: "",
            };
        }
        // Send email to user with their report
        if (userEmail) {
            try {
                yield (0, email_1.sendReportEmail)({
                    email: userEmail,
                    username: userName,
                    report: {
                        period: report.period,
                        totalIncome: report.summary.income,
                        totalExpenses: report.summary.expenses,
                        availableBalance: report.summary.balance,
                        savingsRate: report.summary.savingsRate,
                        topSpendingCategories: report.summary.topCategories,
                        insights: report.insights || [],
                    },
                    frequency: "Monthly",
                    aiSuggestions: report.aiSuggestions,
                });
                console.log(`Report email sent to ${userEmail}`);
            }
            catch (emailError) {
                console.error("Failed to send report email:", emailError);
            }
        }
        else {
            console.error("User email not found:", req.user);
        }
        return res.status(http_config_1.HTTPSTATUS.OK).json({
            message: "Report generated successfully",
            report,
        });
    }
    catch (error) {
        console.error("Error generating report:", error);
        return res.status(http_config_1.HTTPSTATUS.OK).json({
            message: "Report generation initiated",
        });
    }
}));
exports.resendAllReportsController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const from = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 1));
    const to = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 1));
    const settings = yield report_setting_model_1.default.find({
        isEnabled: true,
    }).populate("userId");
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    for (const setting of settings) {
        const user = setting.userId;
        if (!user || !user.email) {
            failCount++;
            continue;
        }
        try {
            const report = yield (0, report_service_1.generateReportService)(user.id, from, to);
            if (report) {
                yield (0, email_1.sendReportEmail)({
                    email: user.email,
                    username: user.name || "User",
                    report: {
                        period: report.period,
                        totalIncome: report.summary.income,
                        totalExpenses: report.summary.expenses,
                        availableBalance: report.summary.balance,
                        savingsRate: report.summary.savingsRate,
                        topSpendingCategories: report.summary.topCategories,
                        insights: report.insights || [],
                    },
                    frequency: "Monthly",
                    aiSuggestions: report.aiSuggestions,
                });
                successCount++;
            }
            else {
                failCount++;
            }
        }
        catch (error) {
            failCount++;
            errors.push(`Failed for ${user.email}: ${error.message}`);
        }
    }
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: `Resend completed: ${successCount} sent, ${failCount} failed`,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined,
    });
}));
