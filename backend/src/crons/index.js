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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCrons = void 0;
const scheduler_1 = require("./scheduler");
const initializeCrons = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobs = (0, scheduler_1.startJobs)();
        console.log(` ${jobs.length} cron jobs initialized`);
        return jobs;
    }
    catch (error) {
        console.error("CRON INIT ERROR: ", error);
        return [];
    }
});
exports.initializeCrons = initializeCrons;
