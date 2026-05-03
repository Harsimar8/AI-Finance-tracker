"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyNames = exports.CurrencySymbols = exports.CurrencyEnum = void 0;
exports.convertCurrency = convertCurrency;
exports.getExchangeRate = getExchangeRate;
exports.formatCurrencyWithSymbol = formatCurrencyWithSymbol;
exports.getAllCurrencies = getAllCurrencies;
var CurrencyEnum;
(function (CurrencyEnum) {
    CurrencyEnum["USD"] = "USD";
    CurrencyEnum["INR"] = "INR";
    CurrencyEnum["AED"] = "AED";
    CurrencyEnum["GBP"] = "GBP";
    CurrencyEnum["EUR"] = "EUR";
})(CurrencyEnum || (exports.CurrencyEnum = CurrencyEnum = {}));
exports.CurrencySymbols = {
    [CurrencyEnum.USD]: "$",
    [CurrencyEnum.INR]: "₹",
    [CurrencyEnum.AED]: "د.إ",
    [CurrencyEnum.GBP]: "£",
    [CurrencyEnum.EUR]: "€",
};
exports.CurrencyNames = {
    [CurrencyEnum.USD]: "US Dollar",
    [CurrencyEnum.INR]: "Indian Rupee",
    [CurrencyEnum.AED]: "UAE Dirham",
    [CurrencyEnum.GBP]: "British Pound",
    [CurrencyEnum.EUR]: "Euro",
};
const exchangeRatesUSD = {
    [CurrencyEnum.USD]: 1,
    [CurrencyEnum.INR]: 83.12,
    [CurrencyEnum.AED]: 3.67,
    [CurrencyEnum.GBP]: 0.79,
    [CurrencyEnum.EUR]: 0.92,
};
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    const amountInUSD = amount / exchangeRatesUSD[fromCurrency];
    const convertedAmount = amountInUSD * exchangeRatesUSD[toCurrency];
    return Math.round(convertedAmount * 100) / 100;
}
function getExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return 1;
    }
    return exchangeRatesUSD[toCurrency] / exchangeRatesUSD[fromCurrency];
}
function formatCurrencyWithSymbol(amount, currency) {
    const symbol = exports.CurrencySymbols[currency];
    const formattedAmount = amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${symbol}${formattedAmount}`;
}
function getAllCurrencies() {
    return Object.values(CurrencyEnum).map((currency) => ({
        code: currency,
        name: exports.CurrencyNames[currency],
        symbol: exports.CurrencySymbols[currency],
    }));
}
