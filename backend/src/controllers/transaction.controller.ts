import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

import { HTTPSTATUS } from "../config/http.config";
import { bulkDeleteTransactionSchema, bulkTransactionSchema, createTransactionSchema, transactionIdSchema, updateTransactionSchema } from "../validators/transaction.validators";
import { BadRequestException } from "../utils/app-error";
import {
  bulkDeleteTransactionService,
  bulkTransactionService,
  createTransactionService,
  deleteTransactionService,
  duplicateTransactionService,
  getAllTransactionService,
  getTransactionByIdService,
  scanReceiptService,
  scanReceiptFromBase64,
  updateTransactionService,
} from "../services/transaction.service";
import { TransactionTypeEnum } from "../models/transaction.model";
import { calculateNextOccurrence } from "../utils/helper";
import mongoose from "mongoose";
import { TransactionModel } from "../models/transaction.model";


/* =======================
   CREATE TRANSACTION
======================= */

export const createTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body);

    // ensure userId is string
   const userId = req.user?.userId;

    const transaction = await createTransactionService(body, userId);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Transaction created successfully",
      transaction,
    });
  }
);

/* =======================
   GET ALL TRANSACTIONS
======================= */

export const getAllTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    // const transactionId = transactionIdSchema.parse(req.params.id);

    const filters = {
      keyword: req.query.keyword as string | undefined,
      type: req.query.type as keyof typeof TransactionTypeEnum | undefined,
      recurringStatus: req.query.recurringStatus as
        | "RECURRING"
        | "NON_RECURRING"
        | undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

   

    const result = await getAllTransactionService(
      userId,
      filters,
      pagination
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction fetched successfully",
      ...result,
    });
  }
);


export const getTransactionByIdController = asyncHandler(
    async (req: Request, res: Response) =>{
        const userId = req.user?.userId;
        const transactionId = transactionIdSchema.parse(req.params.id);

        const transaction = await getTransactionByIdService(userId, transactionId);
        
        return res.status(HTTPSTATUS.OK).json({
            message: "Transaction fetched successfully",
            transaction,
        });
    }

);


export const duplicateTransactionController = asyncHandler(
    async (req: Request, res: Response) =>{
        const userId = req.user?.userId;
        const transactionId = transactionIdSchema.parse(req.params.id);

        const transaction = await duplicateTransactionService(userId, transactionId);
        
        return res.status(HTTPSTATUS.OK).json({
            message: "Transaction duplicated successfully",
            data: transaction,
        });
    }
);


export const updateTransactionController = asyncHandler(
    async (req: Request, res: Response) =>{
       const userId = req.user?.userId;
        const transactionId = transactionIdSchema.parse(req.params.id);
        const body = updateTransactionSchema.parse(req.body);
        await updateTransactionService(
          userId,
          transactionId,
          body
        );

      
        return res.status(HTTPSTATUS.OK).json({
            message: "Transaction updated successfully",
        });
    }
);


export const deleteTransactionController = asyncHandler(
    async (req: Request, res: Response) =>{
        const userId = req.user?.userId;
        const transactionId = transactionIdSchema.parse(req.params.id);
      

        await deleteTransactionService(
          userId,
          transactionId);

      
        return res.status(HTTPSTATUS.OK).json({
            message: "Transaction deleted successfully",
        });
    }
);


export const bulkDeleteTransactionController = asyncHandler(
    async (req: Request, res: Response) =>{
        const userId = req.user?.userId;
        const {transactionIds} = bulkDeleteTransactionSchema.parse(req.body);
      

        const result = await bulkDeleteTransactionService(
          userId,
          transactionIds);

      
        return res.status(HTTPSTATUS.OK).json({
            message: "Transaction deleted successfully",
            ...result,
        });
    }
);

export const bulkTransactionController = asyncHandler(
    async (req: Request, res: Response) =>{
        const userId = req.user?.userId;
        const {transactions} = bulkTransactionSchema.parse(req.body);
      

        const result = await bulkTransactionService(
          userId,
          transactions
        )

      
        return res.status(HTTPSTATUS.OK).json({
            message: "Bulk transactions inserted successfully",
            ...result,
        });
    }
);


export const scanReceiptController = asyncHandler(
  async(req: Request, res:Response) => {
    const file = req?.file;
    const body = req.body;
    const userId = req.user?.userId;

    console.log("scanReceiptController called", { hasBody: !!body, hasFile: !!file, bodyKeys: Object.keys(body || {}) });
    
    let result;
    
    if (body.base64 && body.base64.length > 0) {
      console.log("Processing base64 receipt...");
      const payload = {
        base64: body.base64,
        mimeType: body.mimeType || "image/jpeg",
        fileName: body.fileName || "receipt.jpg",
      };
      result = await scanReceiptFromBase64(payload);
    } else if (file) {
      console.log("Processing file upload...");
      result = await scanReceiptService(file);
    } else {
      console.log("No image data provided, body:", JSON.stringify(body).substring(0, 200));
      throw new BadRequestException("No image data provided");
    }
    
    console.log("Scan result:", result);
    
    return res.status(HTTPSTATUS.OK).json({
      message: "Receipt scanned successfully",
      data: result,
    })
  }
);


export const processRecurringTransactions = async () => {
  const now = new Date();

  try{
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now},
    }).cursor();

    console.log("Starting recurring process");

    for await (const tx of transactionCursor) {
      const nextDate = calculateNextOccurrence(
        tx.nextRecurringDate!,
        tx.recurringInterval!
      );

      const session = await mongoose.startSession();
      try{
        await session.withTransaction(async () => {
          await TransactionModel.create([{
            ...tx.toObject(),
            _id: new mongoose.Types.ObjectId(),
            date: tx.nextRecurringDate,
            isRecurring: false,
            nextRecurringDate: null,
            recurringInterval: null,
            
          },
        ],
        {session}
      );

          await TransactionModel.updateOne(
            {_id: tx._id},
            {
              nextRecurringDate: nextDate,
              lastProcessed: now,
            },
            { session }
          );
        });
      }
      finally {
        session.endSession();
      }
    }
  }
    catch(error){
      console.error("Recurring processing error", error);
    }
    };
    





