export enum CurrencyEnum {
    INR = "INR",
}

export const CurrencySymbols: Record<CurrencyEnum, string> = {
    [CurrencyEnum.INR]: "₹",
};

export const CurrencyNames: Record<CurrencyEnum, string> = {
    [CurrencyEnum.INR]: "Indian Rupee",
};

const exchangeRatesUSD: Record<CurrencyEnum, number> = {
    [CurrencyEnum.INR]: 1,
};

export function convertCurrency(
    amount: number,
    fromCurrency: CurrencyEnum,
    toCurrency: CurrencyEnum
): number {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    
    const amountInUSD = amount / exchangeRatesUSD[fromCurrency];
    const convertedAmount = amountInUSD * exchangeRatesUSD[toCurrency];
    
    return Math.round(convertedAmount * 100) / 100;
}

export function getExchangeRate(fromCurrency: CurrencyEnum, toCurrency: CurrencyEnum): number {
    if (fromCurrency === toCurrency) {
        return 1;
    }
    return exchangeRatesUSD[toCurrency] / exchangeRatesUSD[fromCurrency];
}

export function formatCurrencyWithSymbol(
    amount: number,
    currency: CurrencyEnum
): string {
    const symbol = CurrencySymbols[currency];
    const formattedAmount = amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${symbol}${formattedAmount}`;
}

export function getAllCurrencies(): Array<{ code: CurrencyEnum; name: string; symbol: string }> {
    return Object.values(CurrencyEnum).map((currency) => ({
        code: currency,
        name: CurrencyNames[currency],
        symbol: CurrencySymbols[currency],
    }));
}