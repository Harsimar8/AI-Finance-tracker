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
exports.processRecurringTransactions = exports.scanReceiptController = exports.bulkTransactionController = exports.bulkDeleteTransactionController = exports.deleteTransactionController = exports.updateTransactionController = exports.duplicateTransactionController = exports.getTransactionByIdController = exports.getAllTransactionController = exports.createTransactionController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const http_config_1 = require("../config/http.config");
const transaction_validators_1 = require("../validators/transaction.validators");
const app_error_1 = require("../utils/app-error");
const transaction_service_1 = require("../services/transaction.service");
const helper_1 = require("../utils/helper");
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = require("../models/transaction.model");
/* =======================
   CREATE TRANSACTION
======================= */
exports.createTransactionController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("📝 REQ.USER:", req.user);
    console.log("📝 REQ.BODY:", req.body);
    const body = transaction_validators_1.createTransactionSchema.parse(req.body);
    // ensure userId is string
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    console.log("📝 USER ID:", userId);
    const transaction = yield (0, transaction_service_1.createTransactionService)(body, userId);
    return res.status(http_config_1.HTTPSTATUS.CREATED).json({
        message: "Transaction created successfully",
        transaction,
    });
}));
/* =======================
   GET ALL TRANSACTIONS
======================= */
exports.getAllTransactionController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    // const transactionId = transactionIdSchema.parse(req.params.id);
    const filters = {
        keyword: req.query.keyword,
        type: req.query.type,
        recurringStatus: req.query.recurringStatus,
    };
    const pagination = {
        pageSize: parseInt(req.query.pageSize) || 20,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const result = yield (0, transaction_service_1.getAllTransactionService)(userId, filters, pagination);
    return res.status(http_config_1.HTTPSTATUS.OK).json(Object.assign({ message: "Transaction fetched successfully" }, result));
}));
exports.getTransactionByIdController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const transactionId = transaction_validators_1.transactionIdSchema.parse(req.params.id);
    const transaction = yield (0, transaction_service_1.getTransactionByIdService)(userId, transactionId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction fetched successfully",
        transaction,
    });
}));
exports.duplicateTransactionController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const transactionId = transaction_validators_1.transactionIdSchema.parse(req.params.id);
    const transaction = yield (0, transaction_service_1.duplicateTransactionService)(userId, transactionId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction duplicated successfully",
        data: transaction,
    });
}));
exports.updateTransactionController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const transactionId = transaction_validators_1.transactionIdSchema.parse(req.params.id);
    const body = transaction_validators_1.updateTransactionSchema.parse(req.body);
    yield (0, transaction_service_1.updateTransactionService)(userId, transactionId, body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction updated successfully",
    });
}));
exports.deleteTransactionController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const transactionId = transaction_validators_1.transactionIdSchema.parse(req.params.id);
    yield (0, transaction_service_1.deleteTransactionService)(userId, transactionId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Transaction deleted successfully",
    });
}));
exports.bulkDeleteTransactionController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { transactionIds } = transaction_validators_1.bulkDeleteTransactionSchema.parse(req.body);
    const result = yield (0, transaction_service_1.bulkDeleteTransactionService)(userId, transactionIds);
    return res.status(http_config_1.HTTPSTATUS.OK).json(Object.assign({ message: "Transaction deleted successfully" }, result));
}));
exports.bulkTransactionController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { transactions } = transaction_validators_1.bulkTransactionSchema.parse(req.body);
    const result = yield (0, transaction_service_1.bulkTransactionService)(userId, transactions);
    return res.status(http_config_1.HTTPSTATUS.OK).json(Object.assign({ message: "Bulk transactions inserted successfully" }, result));
}));
exports.scanReceiptController = (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const file = req === null || req === void 0 ? void 0 : req.file;
    const body = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    console.log("scanReceiptController called", { hasBody: !!body, hasFile: !!file, bodyKeys: Object.keys(body || {}) });
    let result;
    if (body.base64 && body.base64.length > 0) {
        console.log("Processing base64 receipt...");
        const payload = {
            base64: body.base64,
            mimeType: body.mimeType || "image/jpeg",
            fileName: body.fileName || "receipt.jpg",
        };
        result = yield (0, transaction_service_1.scanReceiptFromBase64)(payload);
    }
    else if (file) {
        console.log("Processing file upload...");
        result = yield (0, transaction_service_1.scanReceiptService)(file);
    }
    else {
        console.log("No image data provided, body:", JSON.stringify(body).substring(0, 200));
        throw new app_error_1.BadRequestException("No image data provided");
    }
    console.log("Scan result:", result);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Receipt scanned successfully",
        data: result,
    });
}));
const processRecurringTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const now = new Date();
    try {
        const transactionCursor = transaction_model_1.TransactionModel.find({
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
                        yield transaction_model_1.TransactionModel.create([Object.assign(Object.assign({}, tx.toObject()), { _id: new mongoose_1.default.Types.ObjectId(), date: tx.nextRecurringDate, isRecurring: false, nextRecurringDate: null, recurringInterval: null }),], { session });
                        yield transaction_model_1.TransactionModel.updateOne({ _id: tx._id }, {
                            nextRecurringDate: nextDate,
                            lastProcessed: now,
                        }, { session });
                    }));
                }
                finally {
                    session.endSession();
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
    }
    catch (error) {
        console.error("Recurring processing error", error);
    }
});
exports.processRecurringTransactions = processRecurringTransactions;
