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
exports.getBudgetSuggestionsController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const http_config_1 = require("../config/http.config");
const budget_suggestions_service_1 = require("../services/budget-suggestions.service");
exports.getBudgetSuggestionsController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const dateRangePreset = req.query.preset;
    const suggestions = yield (0, budget_suggestions_service_1.analyzeBudgetService)(userId, dateRangePreset);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Budget analysis fetched successfully",
        data: suggestions,
    });
}));
