"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
const defaults = {
    audience: ["user"],
};
const accessTokenSignOptions = {
    expiresIn: env_config_1.Env.JWT_EXPRESS_IN,
    secret: env_config_1.Env.JWT_SECRET,
};
const signJwtToken = (payload, options) => {
    var _a;
    const isAccessToken = !options || options === accessTokenSignOptions;
    const _b = options || accessTokenSignOptions, { secret } = _b, opts = __rest(_b, ["secret"]);
    console.log("JWT_EXPIRES_IN =>", env_config_1.Env.JWT_EXPRESS_IN, typeof env_config_1.Env.JWT_EXPIRES_IN);
    const token = jsonwebtoken_1.default.sign(payload, secret, Object.assign(Object.assign({}, defaults), opts));
    const expiresAt = isAccessToken ? ((_a = jsonwebtoken_1.default.decode(token)) === null || _a === void 0 ? void 0 : _a.exp) * 1000
        : undefined;
    return {
        token,
        expiresAt,
    };
};
exports.signJwtToken = signJwtToken;
