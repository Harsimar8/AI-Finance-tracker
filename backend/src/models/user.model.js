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
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("../utils/bcrypt");
const currency_1 = require("../utils/currency");
const mongoose_2 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    profilePicture: {
        type: String,
        default: null,
    },
    preferredCurrency: {
        type: String,
        enum: Object.values(currency_1.CurrencyEnum),
        default: currency_1.CurrencyEnum.INR,
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true,
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password")) {
            if (this.password) {
                this.password = yield (0, bcrypt_1.hashValue)(this.password);
            }
        }
        next();
    });
});
userSchema.methods.omitPassword = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, bcrypt_1.compareValue)(password, this.password);
    });
};
const UserModel = mongoose_2.default.model("User", userSchema);
exports.default = UserModel;
