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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
const app_error_1 = require("../utils/app-error");
const user_model_1 = __importDefault(require("../models/user.model"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))
        ? authHeader.split(" ")[1]
        : authHeader;
    console.log("AUTH HEADERS:", req.headers.authorization, "Token:", token);
    if (!token)
        throw new app_error_1.UnauthorizedException("No token provided");
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.Env.JWT_SECRET);
        // Fetch user details for email
        const user = yield user_model_1.default.findById(decoded.userId).select("email name").lean();
        req.user = {
            userId: decoded.userId,
            email: user === null || user === void 0 ? void 0 : user.email,
            name: user === null || user === void 0 ? void 0 : user.name,
        };
        next();
    }
    catch (_a) {
        throw new app_error_1.UnauthorizedException("Invalid token");
    }
});
exports.authMiddleware = authMiddleware;
