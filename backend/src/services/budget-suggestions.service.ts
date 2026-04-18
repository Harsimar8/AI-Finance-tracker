import mongoose from "mongoose";
import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model";
import { getDateRange } from "../utils/date";
import { DateRangePreset } from "../enums/date-range.enum";
import { CurrencyEnum } from "../utils/currency";

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface BudgetAnalysis {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  categoryBreakdown: CategorySpending[];
  topExpenses: CategorySpending[];
  monthlyAverage: number;
}

export interface InvestmentSuggestion {
  type: string;
  title: string;
  description: string;
  amount: number;
  risk: "low" | "medium" | "high";
  expectedReturn: string;
  reason: string;
}

export interface BudgetSuggestion {
  category: string;
  currentSpending: number;
  recommendedLimit: number;
  savingPotential: number;
  tip: string;
}

export interface FinancialSuggestions {
  budgetAnalysis: BudgetAnalysis;
  budgetSuggestions: BudgetSuggestion[];
  investmentSuggestions: InvestmentSuggestion[];
  overallHealth: "excellent" | "good" | "fair" | "poor";
  summary: string;
}

export const analyzeBudgetService = async (
  userId: string,
  dateRangePreset?: DateRangePreset
): Promise<FinancialSuggestions> => {
  const range = getDateRange(dateRangePreset || "month");
  const { from, to } = range;

  const transactions = await TransactionModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    date: { $gte: from, $lte: to },
  }).lean();

  let totalIncome = 0;
  let totalExpenses = 0;
  const categorySpending: Record<string, number> = {};

  for (const tx of transactions) {
    const amount = tx.amount || 0;

    if (tx.type === TransactionTypeEnum.INCOME) {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
      const category = tx.category?.toLowerCase() || "other";
      categorySpending[category] = (categorySpending[category] || 0) + amount;
    }
  }

  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const categoryBreakdown: CategorySpending[] = Object.entries(categorySpending)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topExpenses = categoryBreakdown.slice(0, 5);
  const monthlyAvgExpenses = totalExpenses;

  const budgetSuggestions: BudgetSuggestion[] = categoryBreakdown
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

  const investmentSuggestions: InvestmentSuggestion[] = generateInvestmentSuggestions(
    savings,
    savingsRate,
    monthlyAvgExpenses
  );

  let overallHealth: "excellent" | "good" | "fair" | "poor";
  let summary: string;

  if (savingsRate >= 30) {
    overallHealth = "excellent";
    summary = "Your finances are in excellent shape! You have a strong savings rate and can consider building wealth through diverse investments.";
  } else if (savingsRate >= 20) {
    overallHealth = "good";
    summary = "Your financial health is good. Consider increasing your savings rate and exploring investment opportunities.";
  } else if (savingsRate >= 10) {
    overallHealth = "fair";
    summary = "Your savings rate could be improved. Focus on reducing unnecessary expenses and building an emergency fund.";
  } else {
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
};

function getCategoryTip(category: string, amount: number, savingsRate: number): string {
  const tips: Record<string, string[]> = {
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

function generateInvestmentSuggestions(
  savings: number,
  savingsRate: number,
  monthlyExpenses: number
): InvestmentSuggestion[] {
  const suggestions: InvestmentSuggestion[] = [];

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