"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
const zod_1 = require("zod");
const currency_1 = require("../utils/currency");
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(255).optional(),
    preferredCurrency: zod_1.z.enum(Object.values(currency_1.CurrencyEnum)).optional(),
});
