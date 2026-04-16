import { z } from "zod";

export const reportSettingSchema = z.object({
    isEnabled: z.boolean().default(true),
});

export const updateReportSettingSchema = reportSettingSchema.partial();
export type UpdateReportSettingDTO = z.infer<typeof updateReportSettingSchema>; 