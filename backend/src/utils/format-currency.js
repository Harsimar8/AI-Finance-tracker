"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCents = convertToCents;
exports.convertToDollarUnit = convertToDollarUnit;
exports.formatCurrency = formatCurrency;
function convertToCents(amount) {
    return Math.round(amount * 100);
}
function convertToDollarUnit(amount) {
    return amount / 100;
}
function formatCurrency(amount, currency = "INR") {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
