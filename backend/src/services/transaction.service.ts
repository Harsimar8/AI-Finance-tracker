import TransactionModel from "../models/transaction.model";
import mongoose from "mongoose";
import { calculateNextOccurrence } from "../utils/helper";
import { CreateTransactionSchema, CreateTransactionType, UpdateTransactionType } from "../validators/transaction.validators";
import { TransactionTypeEnum } from "../constants/transaction.constants";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { string } from "zod";
import axios from "axios";
import { genAI } from "../config/google-ai-config";
import { createPartFromBase64, createUserContent } from "@google/genai";

/* =======================
   CREATE TRANSACTION
======================= */

export const createTransactionService = async (
  body: CreateTransactionType,
  userId: string
) => {
  console.log("🔧 Creating transaction:", { body, userId });
  
  let nextRecurringDate: Date | undefined;
  const currentDate = new Date();

  if (body.isRecurring && body.recurringInterval) {
    const calculatedDate = calculateNextOccurrence(
      body.date,
      body.recurringInterval
    );

    nextRecurringDate =
      calculatedDate < currentDate
        ? calculateNextOccurrence(currentDate, body.recurringInterval)
        : calculatedDate;
  }

  const transaction = await TransactionModel.create({
    ...body,
    userId: new mongoose.Types.ObjectId(userId),
    amount: Number(body.amount),
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate,
    lastProcessed: null,
  });

  return transaction;
};

/* =======================
   GET ALL TRANSACTIONS
======================= */

export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword?: string;
    type?: keyof typeof TransactionTypeEnum;
    recurringStatus?: "RECURRING" | "NON_RECURRING";
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const { keyword, type, recurringStatus } = filters;

  const filterConditions: Record<string, any> = {
    userId: new mongoose.Types.ObjectId(userId),
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
    if(recurringStatus === "RECURRING"){
        filterConditions.isRecurring = true;
    }
    else if(recurringStatus === "NON_RECURRING"){
        filterConditions.isRecurring = false;
    }
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    TransactionModel.countDocuments(filterConditions),
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
};


export const getTransactionByIdService = async(
    userId: string,
    transactionId: string
) => {
    const transaction = await TransactionModel.findOne({
        _id: transactionId,
        userId,
    });
    if(!transaction) throw new NotFoundException("Transaction not found");

    return {
    transaction,
    };
}

export const duplicateTransactionService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId: new mongoose.Types.ObjectId(userId),
  });
  if(!transaction) throw new NotFoundException("Transaction not found");

  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id: undefined,
    userId: new mongoose.Types.ObjectId(userId),
    title: `Duplicate - ${transaction.title}`,
    description: transaction.description
    ? `${transaction.description} (Duplicate)`
    : "Duplicated transaction",
    isRecurring: false,
    recurringInterval: undefined,
    nextRecurringDate: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });
  return duplicated;
};

export const updateTransactionService  =async (
  userId: string,
  transactionId: string,
  body: UpdateTransactionType
) => {
  const existingTransaction = await TransactionModel.findOne({
    _id:transactionId,
    userId: new mongoose.Types.ObjectId(userId),
  });
if(!existingTransaction)
  throw new NotFoundException("Transaction not found");

const now = new Date();
const isRecurring = body.isRecurring ?? existingTransaction.isRecurring

const date = body.date ?? existingTransaction.date;

existingTransaction.date;

const recurringInterval =
  body.recurringInterval !== undefined
    ? body.recurringInterval
    : existingTransaction.recurringInterval;


let nextRecurringDate: Date | undefined;

if(isRecurring && recurringInterval){
  const calculatedDate = calculateNextOccurrence(date, recurringInterval);

  nextRecurringDate = calculatedDate < now ? calculateNextOccurrence(now, recurringInterval): calculatedDate;
}

existingTransaction.set({
  ...(body.title && {title: body.title}),
  ...(body.category && {category:body.category}),
  ...(body.type && {type:body.type}),
  ...(body.paymentMethod && {paymentMethod:body.paymentMethod}),
  ...(body.amount !== undefined && {amount: Number(body.amount)}),
  date,
  isRecurring,
  recurringInterval,
  nextRecurringDate,
});

await existingTransaction.save();

return;
}


export const deleteTransactionService = async (
   userId: string,
   transactionId: string
)  => {
  const deleted = await TransactionModel.findByIdAndDelete({
    _id: transactionId,
    userId: new mongoose.Types.ObjectId(userId),
  });
  if(!deleted) throw new NotFoundException("Transaction not found");

  return;
}


export const bulkDeleteTransactionService = async(
  userId: string,
  transactionIds: string[]
) => {
  const result = await TransactionModel.deleteMany({
    _id: { $in: transactionIds},
    userId: new mongoose.Types.ObjectId(userId),
  });

  if( result.deletedCount === 0)
    throw new NotFoundException("No transactions found");

  return{
    success: true,
    deletedCount: result.deletedCount,
  }
}


export const bulkTransactionService = async(
  userId: string,
  transactions: CreateTransactionType[]
) => {
  try{
    const bulkOps = transactions.map((tx) => ({
      insertOne:{
        document:{
          ...tx,
          userId: new mongoose.Types.ObjectId(userId),
          isRecurring: false,
          nextRecurringDate: null,
          recurringInterval: null,
          lastProcessed: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }));

    const result = await TransactionModel.bulkWrite(
      bulkOps,
      {ordered: true
    });

  return {
    insertedCount: result.insertedCount,
    success: true,
  
  };
  }
  catch(error){
    throw error;
  }
};

export interface ScanReceiptPayload {
  base64: string;
  mimeType: string;
  fileName: string;
}

export const scanReceiptService = async (
  file: Express.Multer.File | undefined
) => {
  if (!file) throw new BadRequestException("No file uploaded");

  try {
    if (!file.path)
      throw new BadRequestException("Failed to upload file");

    console.log("Fetching image from:", file.path);
    console.log("File mimetype:", file.mimetype);
    
    const responseData = await axios.get(file.path, {
      responseType: "arraybuffer",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log("Image fetched successfully, size:", responseData.data.length);

    const base64String = Buffer.from(responseData.data).toString("base64");

    if (!base64String)
      throw new BadRequestException("Could not process file");

    console.log("Calling Gemini API with model:", genAIModel);
    
    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [
        createUserContent([
          receiptPrompt,
          createPartFromBase64(base64String, file.mimetype),
        ]),
      ],
      config: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
      },
    });

    console.log("Gemini API response received");

    const response = result.text;
    const cleanedText = response
      ?.replace(/```(?:json)?\n?/g, "")
      .trim();

    if (!cleanedText) {
      return { error: "Could not read receipt content" };
    }

    const data = JSON.parse(cleanedText);
    console.log("Parsed data:", data);

    if (!data.amount || !data.date) {
      return { error: "Receipt missing information" };
    }

    let category = data.category?.toLowerCase() || "other";
    
    const validCategories = ["groceries", "dining", "transportation", "utilities", "entertainment", "shopping", "healthcare", "travel", "other"];
    if (!validCategories.includes(category)) {
      category = "other";
    }

    let paymentMethod = data.paymentMethod?.toUpperCase() || "CASH";
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
  } catch (error: any) {
    console.error("Receipt scanning error:", error);
    if (error.response) {
      console.error("Axios error response:", error.response.status, error.response.data);
    } else if (error.message) {
      console.error("Error message:", error.message);
    }
    
    const errorMessage = error.message || "Unknown error";
    if (errorMessage.includes("404")) {
      return { error: "Image not found on storage" };
    } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
      return { error: "Storage access denied" };
    } else if (errorMessage.includes("Gemini") || errorMessage.includes("api")) {
      return { error: "AI service unavailable. Please check API key." };
    }
    
    return { error: "Receipt scanning service unavailable" };
  }
};

export const scanReceiptFromBase64 = async (
  payload: ScanReceiptPayload
) => {
  const { base64, mimeType, fileName } = payload;
  
  if (!base64) throw new BadRequestException("No image data provided");

  try {
    console.log("Processing base64 image, filename:", fileName, "mimeType:", mimeType);
    console.log("Calling Gemini API with model:", genAIModel);
    
    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [
        createUserContent([
          receiptPrompt,
          createPartFromBase64(base64, mimeType),
        ]),
      ],
      config: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
      },
    });

    console.log("Gemini API response received");

    const response = result.text;
    const cleanedText = response
      ?.replace(/```(?:json)?\n?/g, "")
      .trim();

    if (!cleanedText) {
      return { error: "Could not read receipt content" };
    }

    const data = JSON.parse(cleanedText);
    console.log("Parsed data:", data);

    if (!data.amount || !data.date) {
      return { error: "Receipt missing information" };
    }

    let category = data.category?.toLowerCase() || "other";
    
    const validCategories = ["groceries", "dining", "transportation", "utilities", "entertainment", "shopping", "healthcare", "travel", "other"];
    if (!validCategories.includes(category)) {
      category = "other";
    }

    let paymentMethod = data.paymentMethod?.toUpperCase() || "CASH";
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
      receiptUrl: `data:${mimeType};base64,${base64}`,
    };
  } catch (error: any) {
    console.error("Receipt scanning error:", error);
    if (error.response) {
      console.error("Axios error response:", error.response.status, error.response.data);
    } else if (error.message) {
      console.error("Error message:", error.message);
    }
    
    const errorMessage = error.message || "Unknown error";
    if (errorMessage.includes("Gemini") || errorMessage.includes("api")) {
      return { error: "AI service unavailable. Please check API key." };
    }
    
    return { error: "Receipt scanning service unavailable" };
  }
};



