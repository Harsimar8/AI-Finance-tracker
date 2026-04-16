import {z} from "zod";
import { CurrencyEnum } from "../utils/currency";

export const updateUserSchema = z.object({
    name: z.string().trim().min(1).max(255).optional(),
    preferredCurrency: z.enum(Object.values(CurrencyEnum)).optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;