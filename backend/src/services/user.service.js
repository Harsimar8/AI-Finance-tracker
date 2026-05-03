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
exports.updateuserService = exports.findByIdUserService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const app_error_1 = require("../utils/app-error");
const mongoose_1 = __importDefault(require("mongoose"));
const findByIdUserService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(userId));
    return user === null || user === void 0 ? void 0 : user.omitPassword();
});
exports.findByIdUserService = findByIdUserService;
const updateuserService = (userId, body, profilePic) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(userId));
    if (!user)
        throw new app_error_1.NotFoundException("User not found");
    if (profilePic) {
        user.profilePicture = profilePic.path;
    }
    if (body.name) {
        user.name = body.name;
    }
    if (body.preferredCurrency) {
        user.preferredCurrency = body.preferredCurrency;
    }
    yield user.save();
    return user.omitPassword();
});
exports.updateuserService = updateuserService;
