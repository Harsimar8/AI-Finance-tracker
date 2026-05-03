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
exports.refreshTokenService = exports.loginService = exports.registerService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const app_error_1 = require("../utils/app-error");
const mongoose_1 = __importDefault(require("mongoose"));
const helper_1 = require("../utils/helper");
const report_setting_model_1 = __importStar(require("../models/report-setting.model"));
const jwt_1 = require("../utils/jwt");
const registerService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        const { email } = body;
        const existingUser = yield user_model_1.default.findOne({ email }).session(session);
        if (existingUser)
            throw new app_error_1.UnauthorizedException("User already exists");
        const newUser = new user_model_1.default(Object.assign({}, body));
        yield newUser.save({ session });
        const reportSetting = new report_setting_model_1.default({
            userId: newUser._id,
            frequency: report_setting_model_1.ReportFrequencyEnum.MONTHLY,
            isEnabled: true,
            nextReportDate: (0, helper_1.calculateNextReportDate)(),
            lastSentDate: null
        });
        yield reportSetting.save({ session });
        return { user: newUser.omitPassword() };
    }
    catch (error) {
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
exports.registerService = registerService;
const loginService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = body;
    const user = yield user_model_1.default.findOne({ email });
    if (!user)
        throw new app_error_1.NotFoundException("Email/password not found");
    const isPasswordValid = yield user.comparePassword(password);
    if (!isPasswordValid) {
        throw new app_error_1.UnauthorizedException("Invalid email/ password");
    }
    const { token, expiresAt } = (0, jwt_1.signJwtToken)({ userId: user.id });
    const reportSetting = yield report_setting_model_1.default.findOne({
        userId: user.id,
    }, { _id: 1, frequency: 1, isEnabled: 1 }).lean();
    return {
        user: user.omitPassword(),
        accessToken: token,
        expiresAt,
        reportSetting,
    };
});
exports.loginService = loginService;
const refreshTokenService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ _id: userId });
    if (!user)
        throw new app_error_1.NotFoundException("User not found");
    const { token, expiresAt } = (0, jwt_1.signJwtToken)({ userId: user.id });
    return {
        accessToken: token,
        expiresAt,
    };
});
exports.refreshTokenService = refreshTokenService;
