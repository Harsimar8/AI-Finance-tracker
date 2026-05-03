"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const report_controller_1 = require("../controllers/report_controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const reportRoutes = (0, express_1.Router)();
// Multer setup to handle file uploads
const storage = multer_1.default.memoryStorage(); // file stays in memory
const upload = (0, multer_1.default)({ storage });
// GET routes - all protected
reportRoutes.get("/all", auth_middleware_1.authMiddleware, report_controller_1.getAllReportsController);
reportRoutes.get("/generate", auth_middleware_1.authMiddleware, report_controller_1.generateReportController);
reportRoutes.put("/update-setting", auth_middleware_1.authMiddleware, report_controller_1.updateReportSettingController);
// POST upload route - protected
reportRoutes.post("/upload", auth_middleware_1.authMiddleware, upload.single("file"), report_controller_1.generateReportFromImageController);
// POST resend all reports - admin only
reportRoutes.post("/resend-all", auth_middleware_1.authMiddleware, report_controller_1.resendAllReportsController);
exports.default = reportRoutes;
