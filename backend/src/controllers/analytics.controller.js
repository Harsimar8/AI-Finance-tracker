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
Object.defineProperty(exports, "__esModule", { value: true });
exports.expensePieChartBreakdownController = exports.chartAnalyticsController = exports.summaryAnalyticsController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const http_config_1 = require("../config/http.config");
const analytics_service_1 = require("../services/analytics.service");
exports.summaryAnalyticsController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { preset, from, to } = req.query;
    const filter = {
        dateRangePreset: preset,
        customFrom: from ? new Date(from) : undefined,
        customTo: to ? new Date(to) : undefined,
    };
    const stats = yield (0, analytics_service_1.summaryAnalyticsService)(userId, filter.dateRangePreset, filter.customFrom, filter.customTo);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Summary fetched successfully",
        data: stats,
    });
}));
exports.chartAnalyticsController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { preset, from, to } = req.query;
    const filter = {
        dateRangePreset: preset,
        customFrom: from ? new Date(from) : undefined,
        customTo: to ? new Date(to) : undefined,
    };
    const chartData = yield (0, analytics_service_1.chartAnalyticsService)(userId, filter.dateRangePreset, filter.customFrom, filter.customTo);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Chart fetched successfully",
        data: chartData,
    });
}));
exports.expensePieChartBreakdownController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { preset, from, to } = req.query;
    const filter = {
        dateRangePreset: preset,
        customFrom: from ? new Date(from) : undefined,
        customTo: to ? new Date(to) : undefined,
    };
    const pieChartData = yield (0, analytics_service_1.expensePieChartBreakdownService)(userId, filter.dateRangePreset, filter.customFrom, filter.customTo);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Expense breakdown fetched successfully",
        data: pieChartData,
    });
}));
