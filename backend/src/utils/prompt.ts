import {PaymentMethodEnum } from "../models/transaction.model";

const CATEGORIES = [
  "groceries", "dining", "transportation", "utilities",
  "entertainment", "shopping", "healthcare", "travel",
  "housing", "income", "investments", "other"
];

export const receiptPrompt = 
`You are an expert receipt analyzer specializing in Indian receipts.

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


export const reportInsightsPrompt = ({
    totalIncome,
    totalExpenses,
    availableBalance,
    savingRate,
    categories,
    periodLabel,
}: {
    totalIncome: number;
    totalExpenses: number;
    availableBalance: number;
    savingRate: number;
    categories: Record<string, { amount: number; percentage: number }>;
    periodLabel: string;
}) => {
    const categoryList = Object.entries(categories)
        .map(([name, { amount, percentage }]) =>
            `- ${name}: ₹${amount} (${percentage}%)`
        )
        .join("\n");

    return `
Report period: ${periodLabel}
Total Income: ₹${totalIncome}
Total Expenses: ₹${totalExpenses}
Available Balance: ₹${availableBalance}
Savings Rate: ${savingRate}%
Top Spending Categories:
${categoryList}
    `;
};
