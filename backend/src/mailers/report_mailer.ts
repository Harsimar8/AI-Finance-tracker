import { formatCurrency } from "../utils/format-currency";
import { sendEmail } from "./mailer";
import { getReportEmailTemplate } from "./templates/report_templates";

export type ReportType = {
    period: string;
    totalIncome: number;
    totalExpenses: number;
    availableBalance: number;
    savingsRate: number;
    topSpendingCategories: { name: string; amount: number; percent: number }[];
    insights: string[];
};

type ReportEmailParams = {
    email: string;
    username: string;
    report: {
        period: string;
        totalIncome: number;
        totalExpenses: number;
        availableBalance: number;
        savingsRate: number;
        topSpendingCategories: { name: string; amount: number; percent: number }[];
        insights: string[];
    };
    frequency: string;
    aiSuggestions?: string;
};

export const sendReportEmail = async (params: ReportEmailParams) => {
    const { email, username, report, frequency, aiSuggestions } = params;

    const html = getReportEmailTemplate(
        {
            username,
            ...report,
        },
        frequency,
        aiSuggestions
    );

    const text = `Your ${frequency} Financial Report (${report.period})
Income: ${formatCurrency(report.totalIncome)}
Expenses: ${formatCurrency(report.totalExpenses)}
Balance: ${formatCurrency(report.availableBalance)}
Savings Rate: ${report.savingsRate.toFixed(2)}%

${(report.insights || []).join("\n")}
`;

    console.log(text);

    await sendEmail({
        to: email,
        subject: `${frequency} Financial Report - ${report.period}`,
        text,
        html,
    });
};