"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spendingSuggestionsPrompt = exports.reportInsightsPrompt = exports.receiptPrompt = void 0;
const CATEGORIES = [
    "groceries", "dining", "transportation", "utilities",
    "entertainment", "shopping", "healthcare", "travel",
    "housing", "income", "investments", "other"
];
exports.receiptPrompt = `You are an expert receipt analyzer specializing in Indian receipts.

Analyze this receipt image and extract transaction details.

IMPORTANT CATEGORY RULES:
- Grocery stores (D-Mart, Big Bazaar, Reliance Fresh, Spencer's, etc.) = "groceries"
- Restaurants, cafes, food delivery (Zomato, Swiggy, Domino's, McDonald's) = "dining"
- Pharmacies (Apollo, MedPlus, Cipla) = "healthcare"
- Clothing stores (Reliance Trends, Pantaloons, Shoppers Stop) = "shopping"
- Electronics (Croma, Reliance Digital, Vijay Sales) = "shopping"
- Fuel stations (Indian Oil, HP, Bharat Petroleum) = "transportation"
- Metro, bus, auto, taxi = "transportation"
- Mobile recharge = "utilities"
- Electricity, water, gas bills = "utilities"
- Movie theaters, streaming = "entertainment"
- Flight, train tickets = "travel"
- Hotel bookings = "travel"
- Any other store/retail = "shopping"

STRICT JSON format:
{
  "title": "Store/Merchant name in title case",
  "amount": number (positive, total amount only),
  "date": "YYYY-MM-DD format",
  "description": "Brief list of items or purpose",
  "category": "one of: groceries, dining, transportation, utilities, entertainment, shopping, healthcare, travel, other",
  "type": "EXPENSE",
  "paymentMethod": "CARD, CASH, UPI, BANK_TRANSFER, MOBILE_PAYMENT, OTHER"
}

Look carefully at:
1. Store name/logo at top of receipt
2. Total amount (usually at bottom, labeled "Total", "Grand Total", "Amount Payable")
3. Date at top or bottom
4. Items listed to determine category

If uncertain about category, use "other".

Payment method inference:
- If store is large chain/restaurant with card machine mentioned = "CARD"
- If small local store = "CASH" or "UPI"
- If online order = "UPI" or "CARD"
- Default to "CASH" if unsure
`;
const reportInsightsPrompt = ({ totalIncome, totalExpenses, availableBalance, savingRate, categories, periodLabel, }) => {
    const categoryList = Object.entries(categories)
        .map(([name, { amount, percentage }]) => `- ${name}: ₹${amount} (${percentage}%)`)
        .join("\n");
    return `
You are a financial advisor AI. Analyze the following financial data for the period ${periodLabel} and provide 4-6 insightful observations and actionable recommendations.

Financial Data:
Total Income: ₹${totalIncome}
Total Expenses: ₹${totalExpenses}
Available Balance: ₹${availableBalance}
Savings Rate: ${savingRate}%
Top Spending Categories:
${categoryList}

Generate a JSON array of strings, where each string is a concise, actionable insight or recommendation. Focus on:
- Spending patterns and potential savings
- Savings rate analysis and goals
- Budget recommendations
- Financial health indicators
- Category-specific advice

Example format:
["Your savings rate of ${savingRate}% is excellent - keep up the good work!", "Consider reducing dining expenses which account for X% of your spending", "You're on track to meet your savings goals this month"]

Return only the JSON array, no additional text.
    `;
};
exports.reportInsightsPrompt = reportInsightsPrompt;
const spendingSuggestionsPrompt = ({ availableBalance, monthlyIncome, topCategories, }) => {
    const categoryStr = topCategories
        .map(c => `${c.name}: ₹${c.amount} (${c.percent}%)`)
        .join(", ");
    return `
You are a Gemini AI financial advisor. Based on the user's current financial situation, provide smart spending suggestions.

User's Financial Status:
- Available Balance: ₹${availableBalance}
- Monthly Income: ₹${monthlyIncome}
- Top Spending Categories: ${categoryStr}

Provide 5-7 smart spending suggestions formatted as a numbered list. Each suggestion should:
1. Be specific to their balance (₹${availableBalance})
2. Consider their spending patterns
3. Help optimize their finances
4. Include actionable advice (e.g., "Allocate 20% of remaining balance to emergency fund")

Format your response as a simple list with line breaks, like:
1. Suggestion text here
2. Next suggestion here
3. And so on...

Use the ₹ symbol for rupees.
    `;
};
exports.spendingSuggestionsPrompt = spendingSuggestionsPrompt;
