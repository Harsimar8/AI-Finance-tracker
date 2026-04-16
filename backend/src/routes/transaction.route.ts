import {Router} from "express";
import {
  createTransactionController,
  duplicateTransactionController,
  getAllTransactionController,
  getTransactionByIdController,
  updateTransactionController,
  deleteTransactionController,
  bulkDeleteTransactionController,
  bulkTransactionController,
  scanReceiptController
} from "../controllers/transaction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

import { scanReceiptService } from "../services/transaction.service";
import { upload } from "../config/cloudinary.config";


const transactionRoutes = Router();



transactionRoutes.post(
    "/scan-receipt",
    authMiddleware,
    scanReceiptController
);


transactionRoutes.get("/all", authMiddleware, getAllTransactionController);

transactionRoutes.get("/duplicate/:id", authMiddleware, duplicateTransactionController);

transactionRoutes.get("/:id", authMiddleware, getTransactionByIdController);
transactionRoutes.put("/update/:id", authMiddleware,  updateTransactionController);

transactionRoutes.post("/create", authMiddleware, createTransactionController);

transactionRoutes.post("/bulk-transaction", authMiddleware, bulkTransactionController);

transactionRoutes.delete("/delete/:id", authMiddleware, deleteTransactionController);

transactionRoutes.delete("/bulk-delete", authMiddleware, bulkDeleteTransactionController);

export default transactionRoutes;