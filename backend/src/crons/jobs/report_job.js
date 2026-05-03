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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReportJob = void 0;
const date_fns_1 = require("date-fns");
const mongoose_1 = __importDefault(require("mongoose"));
const report_setting_model_1 = __importDefault(require("../../models/report-setting.model"));
const report_model_1 = __importStar(require("../../models/report.model"));
const helper_1 = require("../../utils/helper");
const report_service_1 = require("../../services/report.service");
const email_1 = require("../../utils/email");
const processReportJob = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const now = new Date();
    let processedCount = 0;
    let failedCount = 0;
    const from = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 3));
    const to = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 3));
    try {
        const cursor = report_setting_model_1.default.find({
            isEnabled: true,
            nextReportDate: { $lte: now },
        })
            .populate("userId")
            .cursor();
        console.log("Running Report");
        try {
            for (var _d = true, cursor_1 = __asyncValues(cursor), cursor_1_1; cursor_1_1 = yield cursor_1.next(), _a = cursor_1_1.done, !_a; _d = true) {
                _c = cursor_1_1.value;
                _d = false;
                const setting = _c;
                const user = setting.userId;
                if (!user)
                    continue;
                const session = yield mongoose_1.default.startSession();
                try {
                    const report = yield (0, report_service_1.generateReportService)(user.id, from, to);
                    let emailSent = false;
                    if (report) {
                        try {
                            yield (0, email_1.sendReportEmail)({
                                email: user.email,
                                username: user.name,
                                report: {
                                    period: report.period,
                                    totalIncome: report.summary.income,
                                    totalExpenses: report.summary.expenses,
                                    availableBalance: report.summary.balance,
                                    savingsRate: report.summary.savingsRate,
                                    topSpendingCategories: report.summary.topCategories,
                                    insights: report.insights,
                                },
                                frequency: setting.frequency,
                            });
                            emailSent = true;
                        }
                        catch (_e) {
                            console.log(`Email failed for ${user.id}`);
                        }
                    }
                    yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
                        const bulkReports = [];
                        const bulkSettings = [];
                        if (report && emailSent) {
                            bulkReports.push({
                                insertOne: {
                                    document: {
                                        userId: user.id,
                                        sentDate: now,
                                        period: report.period,
                                        status: report_model_1.ReportStatusEnum.SENT,
                                        createdAt: now,
                                        updatedAt: now,
                                    },
                                },
                            });
                            bulkSettings.push({
                                updateOne: {
                                    filter: { _id: setting._id },
                                    update: {
                                        $set: {
                                            lastSentDate: now,
                                            nextReportDate: (0, helper_1.calculateNextReportDate)(now),
                                            updatedAt: now,
                                        },
                                    },
                                },
                            });
                        }
                        else {
                            bulkReports.push({
                                insertOne: {
                                    document: {
                                        userId: user.id,
                                        sentDate: now,
                                        period: (report === null || report === void 0 ? void 0 : report.period) ||
                                            `${(0, date_fns_1.format)(from, "MMMM d")} - ${(0, date_fns_1.format)(to, "d, yyyy")}`,
                                        status: report
                                            ? report_model_1.ReportStatusEnum.FAILED
                                            : report_model_1.ReportStatusEnum.NO_ACTIVITY,
                                        createdAt: now,
                                        updatedAt: now,
                                    },
                                },
                            });
                            bulkSettings.push({
                                updateOne: {
                                    filter: { _id: setting._id },
                                    update: {
                                        $set: {
                                            lastSentDate: null,
                                            nextReportDate: (0, helper_1.calculateNextReportDate)(now),
                                            updatedAt: now,
                                        },
                                    },
                                },
                            });
                        }
                        yield Promise.all([
                            report_model_1.default.bulkWrite(bulkReports, { ordered: false }),
                            report_setting_model_1.default.bulkWrite(bulkSettings, { ordered: false }),
                        ]);
                    }), {
                        maxCommitTimeMS: 1000,
                    });
                    processedCount++;
                }
                catch (error) {
                    console.log("Failed to process report", error);
                    failedCount++;
                }
                finally {
                    yield session.endSession();
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        console.log(`Processed: ${processedCount}`);
        console.log(`Failed: ${failedCount}`);
        return {
            success: true,
            processedCount,
            failedCount,
        };
    }
    catch (error) {
        console.error("Error Processing reports", error);
        return {
            success: false,
            error: "Report process failed",
        };
    }
});
exports.processReportJob = processReportJob;
