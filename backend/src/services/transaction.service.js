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
exports.scanReceiptFromBase64 = exports.scanReceiptService = exports.bulkTransactionService = exports.bulkDeleteTransactionService = exports.deleteTransactionService = exports.updateTransactionService = exports.duplicateTransactionService = exports.getTransactionByIdService = exports.getAllTransactionService = exports.createTransactionService = void 0;
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const helper_1 = require("../utils/helper");
const app_error_1 = require("../utils/app-error");
const axios_1 = __importDefault(require("axios"));
const google_ai_config_1 = require("../config/google-ai-config");
const geminiRetry_1 = require("../utils/geminiRetry");
const prompt_1 = require("../utils/prompt");
/* =======================
   CREATE TRANSACTION
======================= */
const createTransactionService = (body, userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔧 Creating transaction:", { body, userId });
    let nextRecurringDate;
    const currentDate = new Date();
    if (body.isRecurring && body.recurringInterval) {
        const calculatedDate = (0, helper_1.calculateNextOccurrence)(body.date, body.recurringInterval);
        nextRecurringDate =
            calculatedDate < currentDate
                ? (0, helper_1.calculateNextOccurrence)(currentDate, body.recurringInterval)
                : calculatedDate;
    }
    const transaction = yield transaction_model_1.default.create(Object.assign(Object.assign({}, body), { userId: new mongoose_1.default.Types.ObjectId(userId), amount: Number(body.amount), isRecurring: body.isRecurring || false, recurringInterval: body.recurringInterval || null, nextRecurringDate, lastProcessed: null }));
    return transaction;
});
exports.createTransactionService = createTransactionService;
/* =======================
   GET ALL TRANSACTIONS
======================= */
const getAllTransactionService = (userId, filters, pagination) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, type, recurringStatus } = filters;
    const filterConditions = {
        userId: new mongoose_1.default.Types.ObjectId(userId),
    };
    if (keyword) {
        filterConditions.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { category: { $regex: keyword, $options: "i" } },
        ];
    }
    if (type) {
        filterConditions.type = type;
    }
    if (recurringStatus) {
        if (recurringStatus === "RECURRING") {
            filterConditions.isRecurring = true;
        }
        else if (recurringStatus === "NON_RECURRING") {
            filterConditions.isRecurring = false;
        }
    }
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;
    const [transactions, totalCount] = yield Promise.all([
        transaction_model_1.default.find(filterConditions)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 }),
        transaction_model_1.default.countDocuments(filterConditions),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);
    return {
        transactions,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
});
exports.getAllTransactionService = getAllTransactionService;
const getTransactionByIdService = (userId, transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield transaction_model_1.default.findOne({
        _id: transactionId,
        userId,
    });
    if (!transaction)
        throw new app_error_1.NotFoundException("Transaction not found");
    return {
        transaction,
    };
});
exports.getTransactionByIdService = getTransactionByIdService;
const duplicateTransactionService = (userId, transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield transaction_model_1.default.findOne({
        _id: transactionId,
        userId: new mongoose_1.default.Types.ObjectId(userId),
    });
    if (!transaction)
        throw new app_error_1.NotFoundException("Transaction not found");
    const duplicated = yield transaction_model_1.default.create(Object.assign(Object.assign({}, transaction.toObject()), { _id: undefined, userId: new mongoose_1.default.Types.ObjectId(userId), title: `Duplicate - ${transaction.title}`, description: transaction.description
            ? `${transaction.description} (Duplicate)`
            : "Duplicated transaction", isRecurring: false, recurringInterval: undefined, nextRecurringDate: undefined, createdAt: undefined, updatedAt: undefined }));
    return duplicated;
});
exports.duplicateTransactionService = duplicateTransactionService;
const updateTransactionService = (userId, transactionId, body) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const existingTransaction = yield transaction_model_1.default.findOne({
        _id: transactionId,
        userId: new mongoose_1.default.Types.ObjectId(userId),
    });
    if (!existingTransaction)
        throw new app_error_1.NotFoundException("Transaction not found");
    const now = new Date();
    const isRecurring = (_a = body.isRecurring) !== null && _a !== void 0 ? _a : existingTransaction.isRecurring;
    const date = (_b = body.date) !== null && _b !== void 0 ? _b : existingTransaction.date;
    existingTransaction.date;
    const recurringInterval = body.recurringInterval !== undefined
        ? body.recurringInterval
        : existingTransaction.recurringInterval;
    let nextRecurringDate;
    if (isRecurring && recurringInterval) {
        const calculatedDate = (0, helper_1.calculateNextOccurrence)(date, recurringInterval);
        nextRecurringDate = calculatedDate < now ? (0, helper_1.calculateNextOccurrence)(now, recurringInterval) : calculatedDate;
    }
    existingTransaction.set(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (body.title && { title: body.title })), (body.category && { category: body.category })), (body.type && { type: body.type })), (body.paymentMethod && { paymentMethod: body.paymentMethod })), (body.amount !== undefined && { amount: Number(body.amount) })), { date,
        isRecurring,
        recurringInterval,
        nextRecurringDate }));
    yield existingTransaction.save();
    return;
});
exports.updateTransactionService = updateTransactionService;
const deleteTransactionService = (userId, transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield transaction_model_1.default.findByIdAndDelete({
        _id: transactionId,
        userId: new mongoose_1.default.Types.ObjectId(userId),
    });
    if (!deleted)
        throw new app_error_1.NotFoundException("Transaction not found");
    return;
});
exports.deleteTransactionService = deleteTransactionService;
const bulkDeleteTransactionService = (userId, transactionIds) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield transaction_model_1.default.deleteMany({
        _id: { $in: transactionIds },
        userId: new mongoose_1.default.Types.ObjectId(userId),
    });
    if (result.deletedCount === 0)
        throw new app_error_1.NotFoundException("No transactions found");
    return {
        success: true,
        deletedCount: result.deletedCount,
    };
});
exports.bulkDeleteTransactionService = bulkDeleteTransactionService;
const bulkTransactionService = (userId, transactions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bulkOps = transactions.map((tx) => ({
            insertOne: {
                document: Object.assign(Object.assign({}, tx), { userId: new mongoose_1.default.Types.ObjectId(userId), isRecurring: false, nextRecurringDate: null, recurringInterval: null, lastProcessed: null, createdAt: new Date(), updatedAt: new Date() }),
            },
        }));
        const result = yield transaction_model_1.default.bulkWrite(bulkOps, { ordered: true
        });
        return {
            insertedCount: result.insertedCount,
            success: true,
        };
    }
    catch (error) {
        throw error;
    }
});
exports.bulkTransactionService = bulkTransactionService;
const scanReceiptService = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!file)
        throw new app_error_1.BadRequestException("No file uploaded");
    try {
        if (!file.path)
            throw new app_error_1.BadRequestException("Failed to upload file");
        console.log("Fetching image from:", file.path);
        console.log("File mimetype:", file.mimetype);
        const responseData = yield axios_1.default.get(file.path, {
            responseType: "arraybuffer",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });
        console.log("Image fetched successfully, size:", responseData.data.length);
        const base64String = Buffer.from(responseData.data).toString("base64");
        if (!base64String)
            throw new app_error_1.BadRequestException("Could not process file");
        console.log("Calling Gemini API with model:");
        const result = yield (0, geminiRetry_1.callGeminiWithRetry)(google_ai_config_1.genAI.models, {
            model: "models/gemini-2.5-flash",
            contents: [
                {
                    inlineData: {
                        data: base64,
                        mimeType,
                    },
                },
                {
                    text: prompt_1.receiptPrompt,
                },
            ],
        });
        const response = (_e = (_d = (_c = (_b = (_a = result.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        if (!response) {
            console.error("❌ Empty Gemini response");
            return { error: "Empty AI response" };
        }
        const cleanedText = response === null || response === void 0 ? void 0 : response.replace(/```(?:json)?\n?/g, "").trim();
        if (!cleanedText) {
            return { error: "Could not read receipt content" };
        }
        let data;
        try {
            data = JSON.parse(cleanedText);
        }
        catch (err) {
            console.error("❌ JSON parse failed:", cleanedText);
            return { error: "Invalid AI response format" };
        }
        console.log("Parsed data:", data);
        if (!data.amount || !data.date) {
            return { error: "Receipt missing information" };
        }
        let category = ((_f = data.category) === null || _f === void 0 ? void 0 : _f.toLowerCase()) || "other";
        const validCategories = ["groceries", "dining", "transportation", "utilities", "entertainment", "shopping", "healthcare", "travel", "other"];
        if (!validCategories.includes(category)) {
            category = "other";
        }
        let paymentMethod = ((_g = data.paymentMethod) === null || _g === void 0 ? void 0 : _g.toUpperCase()) || "CASH";
        const validPaymentMethods = ["CASH", "CARD", "UPI", "BANK_TRANSFER", "MOBILE_PAYMENT", "OTHER"];
        if (!validPaymentMethods.includes(paymentMethod)) {
            paymentMethod = "CASH";
        }
        return {
            title: data.title || "Receipt",
            amount: Math.abs(Number(data.amount)),
            date: data.date,
            description: data.description || "",
            category: category,
            paymentMethod: paymentMethod,
            type: "EXPENSE",
            receiptUrl: file.path,
        };
    }
    catch (error) {
        console.error("Receipt scanning error:", error);
        if (error.response) {
            console.error("Axios error response:", error.response.status, error.response.data);
        }
        else if (error.message) {
            console.error("Error message:", error.message);
        }
        const errorMessage = error.message || "Unknown error";
        if (errorMessage.includes("404")) {
            return { error: "Image not found on storage" };
        }
        else if (errorMessage.includes("401") || errorMessage.includes("403")) {
            return { error: "Storage access denied" };
        }
        else if (errorMessage.includes("Gemini") || errorMessage.includes("api")) {
            return { error: "AI service unavailable. Please check API key." };
        }
        return { error: "Receipt scanning service unavailable" };
    }
});
exports.scanReceiptService = scanReceiptService;
const scanReceiptFromBase64 = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { base64, mimeType, fileName } = payload;
    if (!base64)
        throw new app_error_1.BadRequestException("No image data provided");
    try {
        console.log("📸 Processing base64:", fileName);
        const result = yield (0, geminiRetry_1.callGeminiWithRetry)(google_ai_config_1.genAI.models, {
            model: "models/gemini-2.5-flash",
            contents: [
                {
                    inlineData: {
                        data: base64,
                        mimeType,
                    },
                },
                {
                    text: prompt_1.receiptPrompt,
                },
            ],
        });
        const response = (_e = (_d = (_c = (_b = (_a = result.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
        console.log("🧠 Gemini raw response:", response);
        const cleanedText = response === null || response === void 0 ? void 0 : response.replace(/```(?:json)?\n?/g, "").trim();
        if (!cleanedText) {
            return { error: "Could not read receipt content" };
        }
        const data = JSON.parse(cleanedText);
        if (!data.amount || !data.date) {
            return { error: "Receipt missing information" };
        }
        let category = ((_f = data.category) === null || _f === void 0 ? void 0 : _f.toLowerCase()) || "other";
        const validCategories = [
            "groceries",
            "dining",
            "transportation",
            "utilities",
            "entertainment",
            "shopping",
            "healthcare",
            "travel",
            "other",
        ];
        if (!validCategories.includes(category)) {
            category = "other";
        }
        let paymentMethod = ((_g = data.paymentMethod) === null || _g === void 0 ? void 0 : _g.toUpperCase()) || "CASH";
        const validPaymentMethods = [
            "CASH",
            "CARD",
            "UPI",
            "BANK_TRANSFER",
            "MOBILE_PAYMENT",
            "OTHER",
        ];
        if (!validPaymentMethods.includes(paymentMethod)) {
            paymentMethod = "CASH";
        }
        return {
            title: data.title || "Receipt",
            amount: Math.abs(Number(data.amount)),
            date: data.date,
            description: data.description || "",
            category,
            paymentMethod,
            type: "EXPENSE",
            receiptUrl: `data:${mimeType};base64,${base64}`,
        };
    }
    catch (error) {
        console.error("❌ Receipt scanning error:", error === null || error === void 0 ? void 0 : error.message);
        return {
            error: "AI service unavailable (quota or API issue)",
        };
    }
});
exports.scanReceiptFromBase64 = scanReceiptFromBase64;
