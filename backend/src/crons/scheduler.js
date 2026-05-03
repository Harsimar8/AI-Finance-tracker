"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const transaction_controller_1 = require("../controllers/transaction.controller");
const report_job_1 = require("./jobs/report_job");
const scheduleJob = (name, time, job) => {
    console.log(`Schedule ${name} at ${time}`);
    return node_cron_1.default.schedule(time, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield job();
            console.log(`${name} completed`);
        }
        catch (error) {
            console.log(`${name} failed`, error);
        }
    }), {
        scheduled: true,
        timezone: "UTC",
    });
};
const startJobs = () => {
    return [
        scheduleJob("Transactions", "5 0 * * *", // ✅ FIXED
        transaction_controller_1.processRecurringTransactions),
        scheduleJob("Reports", "*/1 * * * *", // ✅ FIXED
        report_job_1.processReportJob)
    ];
};
exports.startJobs = startJobs;
