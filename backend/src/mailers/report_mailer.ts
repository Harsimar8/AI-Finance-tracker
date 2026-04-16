import { formatCurrency } from "../utils/format-currency";
import { sendEmail } from "./mailer";
import { getReportEmailTemplate } from "./templates/report_templates";
// import { sendEmail } from "../utils/send-email"; // make sure this exists

type ReportEmailParams = {
    email: string;
    username: string;
    report: {
        period: string;
        totalIncome: number;
        totalExpenses: number; // ✅ added
        availableBalance: number;
        savingsRate: number;
        topSpendingCategories: { name: string; percent: number }[]; // ✅ fixed
        insights: string[];
    };
    frequency: string;
};

export const sendReportEmail = async (params: ReportEmailParams) => {
    const { email, username, report, frequency } = params;

    const html = getReportEmailTemplate(
        {
            username,
            ...report,
        },
        frequency
    );

    const text = `Your ${frequency} Financial Report (${report.period})
Income: ${formatCurrency(report.totalIncome)}
Expenses: ${formatCurrency(report.totalExpenses)}
Balance: ${formatCurrency(report.availableBalance)}
Savings Rate: ${report.savingsRate.toFixed(2)}%

${report.insights.join("\n")}
`;

    console.log(text); // ✅ moved after declaration

    await sendEmail({
        to: email,
        subject: `${frequency} Financial Report - ${report.period}`,
        text,
        html,
    });
};