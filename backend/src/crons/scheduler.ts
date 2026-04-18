import cron from 'node-cron';
import { processRecurringTransactions } from '../controllers/transaction.controller';
import { processReportJob } from './jobs/report_job';


const scheduleJob = (name: string, time: string, job: Function) => {
    console.log(`Schedule ${name} at ${time}`);

    return cron.schedule(time, async () => {
        try {
            await job();
            console.log(`${name} completed`);
        } catch (error) {
            console.log(`${name} failed`, error);
        }
    }, {
        scheduled: true,
        timezone: "UTC",
    });
};

export const startJobs = () => {
    return [
        scheduleJob(
            "Transactions",
            "5 0 * * *",   // ✅ FIXED
            processRecurringTransactions
        ),

        scheduleJob(
            "Reports",
            "*/1 * * * *",  // ✅ FIXED
            processReportJob
        )
    ];
};