import { endOfMonth, startOfMonth, subMonths, format } from "date-fns";
import mongoose from "mongoose";

import ReportSettingModel from "../../models/report-setting.model";
import { UserDocument } from "../../models/user.model";
import { calculateNextReportDate } from "../../utils/helper";

// ❗ add these imports according to your project
// import ReportModel from "../../models/report.model";
// import { ReportStatusEnum } from "../../models/report.model";
// import { generateReportService } from "../../services/report.service";
// import { sendReportEmail } from "../../services/email.service";

export const processReportJob = async () => {
    const now = new Date();

    let processedCount = 0;
    let failedCount = 0;

    const from = startOfMonth(subMonths(now, 3));
    const to = endOfMonth(subMonths(now, 3));

    try {
        const cursor = ReportSettingModel.find({
            isEnabled: true,
            nextReportDate: { $lte: now },
        })
        .populate<{ userId: UserDocument }>("userId")
        .cursor();

        console.log("Running Report");

        for await (const setting of cursor) {
            const user = setting.userId as UserDocument;
            if (!user) continue;

            const session = await mongoose.startSession();

            try {
                const report = await generateReportService(user.id, from, to);

                let emailSent = false;

                if (report) {
                    try {
                        await sendReportEmail({
                            email: user.email!,
                            username: user.name!,
                            report: {
                                period: report.period,
                                totalIncome: report.summary.income,
                                totalExpenses: report.summary.expenses,
                                availableBalance: report.summary.balance,
                                savingsRate: report.summary.savingsRate,
                                topSpendingCategories: report.summary.topCategories,
                                insights: report.insights,
                            },
                            frequency: setting.frequency!,
                        });
                        emailSent = true;
                    } catch {
                        console.log(`Email failed for ${user.id}`);
                    }
                }

                await session.withTransaction(async () => {
                    const bulkReports: any[] = [];
                    const bulkSettings: any[] = [];

                    if (report && emailSent) {
                        bulkReports.push({
                            insertOne: {
                                document: {
                                    userId: user.id,
                                    sentDate: now,
                                    period: report.period,
                                    status: ReportStatusEnum.SENT,
                                    createdAt: now,
                                    updatedAt: now,
                                },
                            },
                        });

                        bulkSettings.push({
                            updateOne: {
                                filter: { _id: setting._id },
                                update: {
                                    $set: {
                                        lastSentDate: now,
                                        nextReportDate: calculateNextReportDate(now),
                                        updatedAt: now,
                                    },
                                },
                            },
                        });
                    } else {
                        bulkReports.push({
                            insertOne: {
                                document: {
                                    userId: user.id,
                                    sentDate: now,
                                    period:
                                        report?.period ||
                                        `${format(from, "MMMM d")} - ${format(to, "d, yyyy")}`,
                                    status: report
                                        ? ReportStatusEnum.FAILED
                                        : ReportStatusEnum.NO_ACTIVITY,
                                    createdAt: now,
                                    updatedAt: now,
                                },
                            },
                        });

                        bulkSettings.push({
                            updateOne: {
                                filter: { _id: setting._id },
                                update: {
                                    $set: {
                                        lastSentDate: null,
                                        nextReportDate: calculateNextReportDate(now),
                                        updatedAt: now,
                                    },
                                },
                            },
                        });
                    }

                    await Promise.all([
                        ReportModel.bulkWrite(bulkReports, { ordered: false }),
                        ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
                    ]);
                }, {
                    maxCommitTimeMS: 1000,
                });

                processedCount++;
            } catch (error) {
                console.log("Failed to process report", error);
                failedCount++;
            } finally {
                await session.endSession();
            }
        }

        console.log(`Processed: ${processedCount}`);
        console.log(`Failed: ${failedCount}`);

        return {
            success: true,
            processedCount,
            failedCount,
        };
    } catch (error) {
        console.error("Error Processing reports", error);
        return {
            success: false,
            error: "Report process failed",
        };
    }
};