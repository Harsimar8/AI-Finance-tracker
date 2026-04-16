import {Request, Response} from "express";
import {asyncHandler} from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { generateReportFromImageService, generateReportService, getAllReportsService,updateReportSettingService } from "../services/report.service";
import { updateReportSettingSchema } from "../validators/report_validator";
import { sendReportEmail } from "../utils/email";

export const getAllReportsController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        const pagination = {
            pageSize: parseInt(req.query.pageSize as string) || 20,
            pageNumber: parseInt(req.query.pageNumber as string) || 1,
        };

        const result = await getAllReportsService(userId, pagination);

        return res.status(HTTPSTATUS.OK).json({
            message: "Report history fetched successfully",
            ...result,
        });
    }
);

export const generateReportFromImageController = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw new Error("No file uploaded");

    // 1️⃣ Generate report from image (already exists)
    const report = await generateReportFromImageService(req.user?._id, file.buffer);

    // 2️⃣ Send real email with image attached
    await sendReportEmail({
      email: req.user?.email!,
      username: req.user?.name!,
      report,
      frequency: "Custom",
      attachment: { filename: "expense.png", content: file.buffer },
    });

    res.status(200).json({
      message: "Report generated from uploaded picture and emailed!",
    });
  }
);


export const updateReportSettingController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        
        const body = updateReportSettingSchema.parse(req.body);


        await updateReportSettingService(userId, body);

        return res.status(HTTPSTATUS.OK).json({
            message: "Report setting updated successfully",
        });
    }
);



export const generateReportController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        const { from, to} = req.query;
        const fromDate = new Date(from as string);
        const toDate = new Date(to as string);

        await generateReportService(userId, fromDate, toDate);

        return res.status(HTTPSTATUS.OK).json({
            message: "Report generated successfully",
        });
    }
);
