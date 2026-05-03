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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRecurringTransactions = void 0;
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
const helper_1 = require("../../utils/helper");
const mongoose_1 = __importDefault(require("mongoose"));
const processRecurringTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const now = new Date();
    let processedCount = 0;
    let failedCount = 0;
    try {
        const transactionCursor = transaction_model_1.default.find({
            isRecurring: true,
            nextRecurringDate: { $lte: now },
        }).cursor();
        console.log("Starting recurring process");
        try {
            for (var _d = true, transactionCursor_1 = __asyncValues(transactionCursor), transactionCursor_1_1; transactionCursor_1_1 = yield transactionCursor_1.next(), _a = transactionCursor_1_1.done, !_a; _d = true) {
                _c = transactionCursor_1_1.value;
                _d = false;
                const tx = _c;
                const nextDate = (0, helper_1.calculateNextOccurrence)(tx.nextRecurringDate, tx.recurringInterval);
                const session = yield mongoose_1.default.startSession();
                try {
                    yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
                        yield transaction_model_1.default.create([
                            Object.assign(Object.assign({}, tx.toObject()), { _id: new mongoose_1.default.Types.ObjectId(), title: `Recurring - ${tx.title}`, date: tx.nextRecurringDate, nextRecurringDate: null, lastProcessed: null }),
                        ], {
                            session
                        });
                        processedCount++;
                        yield transaction_model_1.default.updateOne({ _id: tx._id }, {
                            $set: {
                                nextRecurringDate: nextDate,
                                lastProcessed: now,
                            },
                        }, { session });
                    }), {
                        maxCommitTimeMS: 2000,
                    });
                }
                catch (error) {
                    failedCount++;
                    console.log(`Failed recurring tx: ${tx._id}`, error);
                }
                finally {
                    yield session.endSession();
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = transactionCursor_1.return)) yield _b.call(transactionCursor_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        console.log(`Processed: ${processedCount} transaction`);
        console.log(`Failed: ${failedCount} transaction`);
        return {
            success: true,
            processedCount,
            failedCount
        };
    }
    catch (error) {
        console.error("Error occur processing transaction", error);
        return {
            success: false,
            error: error === null || error === void 0 ? void 0 : error.message,
        };
    }
});
exports.processRecurringTransactions = processRecurringTransactions;
