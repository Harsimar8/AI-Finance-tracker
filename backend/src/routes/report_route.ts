import { Router } from "express";
import multer from "multer";
import {
  generateReportController,
  generateReportFromImageController,
  getAllReportsController,
  updateReportSettingController,
  resendAllReportsController,
} from "../controllers/report_controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const reportRoutes = Router();

// Multer setup to handle file uploads
const storage = multer.memoryStorage(); // file stays in memory
const upload = multer({ storage });

// GET routes - all protected
reportRoutes.get("/all", authMiddleware, getAllReportsController);
reportRoutes.get("/generate", authMiddleware, generateReportController);
reportRoutes.put("/update-setting", authMiddleware, updateReportSettingController);

// POST upload route - protected
reportRoutes.post("/upload", authMiddleware, upload.single("file"), generateReportFromImageController);

// POST resend all reports - admin only
reportRoutes.post("/resend-all", authMiddleware, resendAllReportsController);

export default reportRoutes;