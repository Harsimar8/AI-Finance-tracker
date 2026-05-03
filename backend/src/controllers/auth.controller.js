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
exports.refreshTokenController = exports.loginController = exports.RegisterController = void 0;
const http_config_1 = require("../config/http.config");
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_service_1 = require("../services/auth.service");
const app_error_1 = require("../utils/app-error");
exports.RegisterController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = auth_validator_1.registerSchema.parse(req.body);
    const result = yield (0, auth_service_1.registerService)(body);
    return res
        .status(http_config_1.HTTPSTATUS.CREATED)
        .json({ message: "User registered successfully",
        data: result,
    });
}));
exports.loginController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = auth_validator_1.loginSchema.parse(Object.assign({}, req.body));
    const { user, accessToken, expiresAt, reportSetting } = yield (0, auth_service_1.loginService)(body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "User logged in successfully",
        user,
        accessToken,
        expiresAt,
        reportSetting,
    });
}));
exports.refreshTokenController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user === null || user === void 0 ? void 0 : user.userId;
    if (!userId) {
        throw new app_error_1.UnauthorizedException("Invalid token");
    }
    const result = yield (0, auth_service_1.refreshTokenService)(userId);
    return res.status(http_config_1.HTTPSTATUS.OK).json(Object.assign({ message: "Token refreshed successfully" }, result));
}));
