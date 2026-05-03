"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.analyzeBudgetService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = __importStar(require("../models/transaction.model"));
const date_1 = require("../utils/date");
const analyzeBudgetService = (userId, dateRangePreset) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const range = (0, date_1.getDateRange)(dateRangePreset || "month");
    const { from, to } = range;
    const transactions = yield transaction_model_1.default.find({
        userId: new mongoose_1.default.Types.ObjectId(userId),
        date: { $gte: from, $lte: to },
    }).lean();
    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpending = {};
    for (const tx of transactions) {
        const amount = tx.amount || 0;
        if (tx.type === transaction_model_1.TransactionTypeEnum.INCOME) {
            totalIncome += amount;
        }
        else {
            totalExpenses += amount;
            const category = ((_a = tx.category) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "other";
            categorySpending[category] = (categorySpending[category] || 0) + amount;
        }
    }
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    const categoryBreakdown = Object.entries(categorySpending)
        .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
        .sort((a, b) => b.amount - a.amount);
    const topExpenses = categoryBreakdown.slice(0, 5);
    const monthlyAvgExpenses = totalExpenses;
    const budgetSuggestions = categoryBreakdown
        .filter((cat) => cat.percentage > 15)
        .map((cat) => {
        const recommendedLimit = cat.amount * 0.8;
        return {
            category: cat.category,
            currentSpending: cat.amount,
            recommendedLimit: Math.round(recommendedLimit),
            savingPotential: Math.round(cat.amount - recommendedLimit),
            tip: getCategoryTip(cat.category, cat.amount, savingsRate),
        };
    });
    const investmentSuggestions = generateInvestmentSuggestions(savings, savingsRate, monthlyAvgExpenses);
    let overallHealth;
    let summary;
    if (savingsRate >= 30) {
        overallHealth = "excellent";
        summary = "Your finances are in excellent shape! You have a strong savings rate and can consider building wealth through diverse investments.";
    }
    else if (savingsRate >= 20) {
        overallHealth = "good";
        summary = "Your financial health is good. Consider increasing your savings rate and exploring investment opportunities.";
    }
    else if (savingsRate >= 10) {
        overallHealth = "fair";
        summary = "Your savings rate could be improved. Focus on reducing unnecessary expenses and building an emergency fund.";
    }
    else {
        overallHealth = "poor";
        summary = "Your expenses are too close to your income. Prioritize reducing spending and increasing income to improve financial health.";
    }
    return {
        budgetAnalysis: {
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalExpenses: Math.round(totalExpenses * 100) / 100,
            savings: Math.round(savings * 100) / 100,
            savingsRate: Math.round(savingsRate * 10) / 10,
            categoryBreakdown,
            topExpenses,
            monthlyAverage: Math.round(monthlyAvgExpenses * 100) / 100,
        },
        budgetSuggestions,
        investmentSuggestions,
        overallHealth,
        summary,
    };
});
exports.analyzeBudgetService = analyzeBudgetService;
function getCategoryTip(category, amount, savingsRate) {
    const tips = {
        dining: [
            `You've spent ₹${Math.round(amount).toLocaleString()} on dining this month. Try meal prepping to save up to 40%.`,
            `₹${Math.round(amount).toLocaleString()} on dining - consider cooking at home 3 days a week.`,
            `Dining expenses at ₹${Math.round(amount).toLocaleString()} - useZomato/Swiggy coupons to save 20%.`,
        ],
        shopping: [
            `Shopping at ₹${Math.round(amount).toLocaleString()} - wait for Amazon/flipkart sales for 30%+ discounts.`,
            `Consider making a shopping list to avoid impulse purchases.`,
            `₹${Math.round(amount).toLocaleString()} on shopping - try refurbished items for 50% savings.`,
        ],
        entertainment: [
            `Entertainment at ₹${Math.round(amount).toLocaleString()} - consider sharing streaming plans.`,
            `Look for free community events to reduce entertainment costs.`,
            `₹${Math.round(amount).toLocaleString()} - explore free local attractions.`,
        ],
        transportation: [
            `Transport at ₹${Math.round(amount).toLocaleString()} - try public transport or carpooling.`,
            `Consider bike/scooter for better fuel efficiency.`,
            `Plan routes optimally to reduce fuel costs by 15%.`,
        ],
        healthcare: [
            `Healthcare at ₹${Math.round(amount).toLocaleString()} - invest in preventive health.`,
            `Consider health insurance for long-term savings.`,
            `Look for corporate wellness programs for discounts.`,
        ],
        groceries: [
            `Groceries at ₹${Math.round(amount).toLocaleString()} - buy in bulk for non-perishables.`,
            `Use grocery apps for 10-20% cashback.`,
            `Plan weekly meals to reduce food waste and save 15%.`,
        ],
        income: [
            `Great income source! Consider diversifying.`,
            `Look for ways to increase this income stream.`,
            `Invest some of this in SIPs for long-term growth.`,
        ],
        other: [
            `Review this category to identify potential savings.`,
            `Track these expenses to find patterns.`,
            `Consider if this expense is necessary.`,
        ],
    };
    const categoryTips = tips[category] || tips["other"];
    return categoryTips[Math.floor(Math.random() * categoryTips.length)];
}
function generateInvestmentSuggestions(savings, savingsRate, monthlyExpenses) {
    const suggestions = [];
    const emergencyFundMonths = Math.ceil(monthlyExpenses * 6);
    if (savingsRate < 20) {
        suggestions.push({
            type: "savings",
            title: "Build Emergency Fund",
            description: "Create a rainy day fund covering 3-6 months of expenses",
            amount: emergencyFundMonths,
            risk: "low",
            expectedReturn: "3-4% p.a.",
            reason: "Essential for financial security before investing",
        });
    }
    if (savings > 50000) {
        suggestions.push({
            type: "mutual_funds",
            title: "Systematic Investment Plan (SIP)",
            description: "Start a monthly SIP in diversified mutual funds",
            amount: Math.min(savings * 0.3, 10000),
            risk: "medium",
            expectedReturn: "12-15% p.a.",
            reason: "Long-term wealth creation with professional management",
        });
    }
    if (savings > 100000) {
        suggestions.push({
            type: "stocks",
            title: "Direct Stocks",
            description: "Invest in fundamentally strong blue-chip companies",
            amount: Math.min(savings * 0.2, 20000),
            risk: "medium",
            expectedReturn: "15-20% p.a.",
            reason: "Higher returns but requires research and patience",
        });
    }
    suggestions.push({
        type: "gold",
        title: "Sovereign Gold Bonds",
        description: "Invest in government-backed gold bonds",
        amount: Math.min(savings * 0.1, 5000),
        risk: "low",
        expectedReturn: "5-8% p.a.",
        reason: "Hedge against inflation and currency depreciation",
    });
    if (savings > 200000) {
        suggestions.push({
            type: "fixed_deposit",
            title: "Fixed Deposits",
            description: "Park surplus funds in high-interest FDs",
            amount: Math.min(savings * 0.4, 50000),
            risk: "low",
            expectedReturn: "6-7% p.a.",
            reason: "Safe and steady returns for low-risk investors",
        });
    }
    if (savingsRate >= 25) {
        suggestions.push({
            type: "real_estate",
            title: "Real Estate Investment",
            description: "Consider REITs for fractional real estate exposure",
            amount: savings * 0.15,
            risk: "medium",
            expectedReturn: "10-14% p.a.",
            reason: "Diversify portfolio with real estate without large capital",
        });
    }
    suggestions.push({
        type: "retirement",
        title: "National Pension System (NPS)",
        description: "Tax-efficient retirement savings with market-linked returns",
        amount: Math.min(savings * 0.1, 5000),
        risk: "medium",
        expectedReturn: "8-10% p.a.",
        reason: "Tax benefits under Section 80CCD and retirement planning",
    });
    return suggestions.slice(0, 5);
}
