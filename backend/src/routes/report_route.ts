import { Router } from "express";
import multer from "multer";
import {
  generateReportController,
  generateReportFromImageController,
  getAllReportsController,
  updateReportSettingController,
} from "../controllers/report_controller";

const reportRoutes = Router();

// Multer setup to handle file uploads
const storage = multer.memoryStorage(); // file stays in memory
const upload = multer({ storage });

// GET routes
reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.put("/update-setting", updateReportSettingController);

// POST upload route
// ✅ Make sure your form-data key in Postman is "file"
reportRoutes.post("/upload", upload.single("file"), generateReportFromImageController);

export default reportRoutes;