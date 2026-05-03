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
exports.sendReportEmail = void 0;
// utils/email.ts
const email_service_1 = require("../services/email.service");
const sendReportEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, username, report, frequency, attachment, }) {
    try {
        yield (0, email_service_1.sendReportEmail)({ email, username, report, frequency, attachment });
        console.log(`✅ Report email sent to ${email}`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to send report email to ${email}:`, error);
        return false;
    }
});
exports.sendReportEmail = sendReportEmail;
