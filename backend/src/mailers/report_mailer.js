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
const format_currency_1 = require("../utils/format-currency");
const mailer_1 = require("./mailer");
const report_templates_1 = require("./templates/report_templates");
const sendReportEmail = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, report, frequency, aiSuggestions } = params;
    const html = (0, report_templates_1.getReportEmailTemplate)(Object.assign({ username }, report), frequency, aiSuggestions);
    const text = `Your ${frequency} Financial Report (${report.period})
Income: ${(0, format_currency_1.formatCurrency)(report.totalIncome)}
Expenses: ${(0, format_currency_1.formatCurrency)(report.totalExpenses)}
Balance: ${(0, format_currency_1.formatCurrency)(report.availableBalance)}
Savings Rate: ${report.savingsRate.toFixed(2)}%

${(report.insights || []).join("\n")}
`;
    console.log(text);
    yield (0, mailer_1.sendEmail)({
        to: email,
        subject: `${frequency} Financial Report - ${report.period}`,
        text,
        html,
    });
});
exports.sendReportEmail = sendReportEmail;
