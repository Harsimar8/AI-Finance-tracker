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
exports.sendReportEmail = void 0;
// src/services/email.service.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const report_templates_1 = require("../mailers/templates/report_templates");
const sendReportEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, username, report, frequency, attachment = null, aiSuggestions, }) {
    const html = (0, report_templates_1.getReportEmailTemplate)(Object.assign({ username }, report), frequency, aiSuggestions);
    console.log("Email Service - Using Gmail SMTP");
    console.log("Email Service - Sending to:", email);
    try {
        // Use Gmail SMTP with app password
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: `${frequency} Financial Report`,
            html,
        };
        if (attachment) {
            mailOptions.attachments = [{
                    filename: attachment.filename,
                    content: attachment.content,
                }];
        }
        const result = yield transporter.sendMail(mailOptions);
        console.log("Gmail SMTP response:", result);
    }
    catch (err) {
        console.error("Gmail SMTP error:", (err === null || err === void 0 ? void 0 : err.message) || err);
        throw err;
    }
});
exports.sendReportEmail = sendReportEmail;
