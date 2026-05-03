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
exports.passportAuthenticateJwt = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = __importDefault(require("passport"));
const env_config_1 = require("./env.config");
const user_service_1 = require("../services/user.service");
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env_config_1.Env.JWT_SECRET,
    audience: ["user"],
    algorithms: ["HS256"]
};
passport_1.default.use(new passport_jwt_1.Strategy(options, (payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!payload.userId) {
            return done(null, false, { message: "Invalid token payload" });
        }
        const user = yield (0, user_service_1.findByIdUserService)(payload.userId);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
})));
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((user, done) => done(null, user));
exports.passportAuthenticateJwt = passport_1.default.authenticate("jwt", {
    session: false,
});
