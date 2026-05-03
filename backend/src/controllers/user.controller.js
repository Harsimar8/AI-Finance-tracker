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
exports.updateUserController = exports.getCurrentUserController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const http_config_1 = require("../config/http.config");
const user_service_1 = require("../services/user.service");
const user_validator_1 = require("../validators/user.validator");
exports.getCurrentUserController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const user = yield (0, user_service_1.findByIdUserService)(userId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "User fetched successfully",
        user,
    });
}));
exports.updateUserController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = user_validator_1.updateUserSchema.parse(req.body);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const profilePic = req.file;
    const user = yield (0, user_service_1.updateuserService)(userId, body, profilePic);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "User profile updated successfully",
        data: user,
    });
}));
