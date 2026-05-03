"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportEmailTemplate = void 0;
const format_currency_1 = require("../../utils/format-currency");
const helper_1 = require("../../utils/helper");
const getReportEmailTemplate = (reportData, frequency, aiSuggestions) => {
    const { username, period, totalIncome, totalExpenses, availableBalance, savingsRate, topSpendingCategories, insights, } = reportData;
    const reportTitle = `${(0, helper_1.capitalizeFirstLetter)(frequency)} Report`;
    const categoryTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <thead>
            <tr style="background: #667eea; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Category</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">%</th>
            </tr>
        </thead>
        <tbody>
            ${topSpendingCategories.map((cat) => `
            <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${cat.name}</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${(0, format_currency_1.formatCurrency)(cat.amount)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${cat.percent}%</td>
            </tr>
            `).join("")}
        </tbody>
    </table>`;
    const insightsTable = insights && insights.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <thead>
            <tr style="background: #48bb78; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">AI-Powered Insights</th>
            </tr>
        </thead>
        <tbody>
            ${insights.map((insight) => `
            <tr style="background: #f0fff4;">
                <td style="padding: 12px; border: 1px solid #ddd;">
                    <span style="color: #48bb78; margin-right: 8px;">💡</span>${insight}
                </td>
            </tr>
            `).join("")}
        </tbody>
    </table>` : "";
    const aiSuggestionsTable = aiSuggestions ? `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">🤖 Gemini AI Spending Suggestions</th>
            </tr>
        </thead>
        <tbody>
            <tr style="background: #e6f7ff;">
                <td style="padding: 15px; border: 1px solid #ddd; line-height: 1.8;">
                    ${aiSuggestions.split('\n').filter(s => s.trim()).map(s => {
        const text = s.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '');
        return `<div style="margin-bottom: 8px;">• ${text}</div>`;
    }).join("")}
                </td>
            </tr>
        </tbody>
    </table>` : "";
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportTitle}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            background-color: #f4f7fa;
        }
        .container {
            background-color: white;
            margin: 20px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px 20px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .summary-table td {
            padding: 15px;
            border: 1px solid #e0e0e0;
            text-align: center;
        }
        .summary-value {
            font-size: 24px;
            font-weight: 600;
        }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .neutral { color: #6c757d; }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #333;
            font-size: 20px;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        @media (max-width: 480px) {
            .container {
                margin: 10px;
            }
            .header {
                padding: 20px 15px;
            }
            .content {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ${reportTitle}</h1>
            <p>Hello ${username}, here's your financial summary for ${period}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>💰 Financial Summary</h2>
                <table class="summary-table">
                    <tr>
                        <td style="background: #f8f9fa;">
                            <h3 style="margin: 0; color: #666; font-size: 14px;">Total Income</h3>
                            <div class="summary-value positive">${(0, format_currency_1.formatCurrency)(totalIncome)}</div>
                        </td>
                        <td style="background: #f8f9fa;">
                            <h3 style="margin: 0; color: #666; font-size: 14px;">Total Expenses</h3>
                            <div class="summary-value negative">${(0, format_currency_1.formatCurrency)(totalExpenses)}</div>
                        </td>
                        <td style="background: #f8f9fa;">
                            <h3 style="margin: 0; color: #666; font-size: 14px;">Available Balance</h3>
                            <div class="summary-value ${availableBalance >= 0 ? 'positive' : 'negative'}">${(0, format_currency_1.formatCurrency)(availableBalance)}</div>
                        </td>
                        <td style="background: #f8f9fa;">
                            <h3 style="margin: 0; color: #666; font-size: 14px;">Savings Rate</h3>
                            <div class="summary-value ${savingsRate >= 20 ? 'positive' : savingsRate >= 10 ? 'neutral' : 'negative'}">${savingsRate}%</div>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <h2>📈 Top Spending Categories</h2>
                ${categoryTable}
            </div>

            <div class="section">
                <h2>🔍 AI-Powered Insights</h2>
                ${insightsTable}
            </div>

            ${aiSuggestionsTable}
        </div>
        
        <div class="footer">
            <p><strong>Monexra Financial Platform</strong></p>
            <p>This report was generated on ${new Date().toLocaleDateString()}</p>
            <p>© ${currentYear} Monexra. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
};
exports.getReportEmailTemplate = getReportEmailTemplate;
