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
exports.sendEmail = void 0;
const env_config_1 = require("../config/env.config");
const resend_1 = require("resend");
const resend = new resend_1.Resend(env_config_1.Env.RESEND_API_KEY);
const mailer_sender = `Fnora <${env_config_1.Env.RESEND_MAILER_SENDER}>`;
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, from = mailer_sender, subject, text, html, }) {
    return resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to], // ✅ fixed
        subject,
        text,
        html,
    });
});
exports.sendEmail = sendEmail;
