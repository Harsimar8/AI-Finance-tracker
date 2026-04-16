export type ReportType = {
    period: string;
    totalIncome: number;
    availableBalance: number;
    savingsRate: number;
    toSpendingCategories: Array<{
        name: string; percent: number }>;
        insights: string[];
    
};