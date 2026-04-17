import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { BadRequestException } from "./utils/app-error";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";

import connectDatabse from "./config/database.config";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.route";
import transactionRoutes from "./routes/transaction.route";
import reportRoutes from "./routes/report_route";
import analyticsRoutes from "./routes/analytics.route";

import { initializeCrons } from "./crons";
import { calculateNextReportDate } from "./utils/helper";
import { getDateRange } from "./utils/date";
import { genAI, genAIModel } from "./config/google-ai-config";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

/* ================= TEST ROUTES ================= */

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    throw new BadRequestException("This is a test Error");

    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel",
    });
  })
);

/* ================= AI TEST ROUTE ================= */

app.get(
  `${BASE_PATH}/test-ai`,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      console.log("Testing AI with key:", Env.GEMINI_API_KEY?.substring(0, 15) + "...");
      
      const result = await genAI.models.generateContent({
        model: genAIModel,
        contents: [{ role: "user", parts: [{ text: "Say 'AI is working' if you receive this" }] }],
        config: { responseMimeType: "text/plain" },
      });
      
      res.status(HTTPSTATUS.OK).json({
        message: "AI test successful",
        response: result.text,
      });
    } catch (error: any) {
      console.error("AI Test Error:", error.message);
      res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "AI test failed",
        error: error.message,
      });
    }
  })
);

/* ================= TEST ROUTE ================= */

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    throw new BadRequestException("This is a test Error");

    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel",
    });
  })
);

/* ================= INIT HELPERS ================= */

calculateNextReportDate();

/* ================= ROUTES ================= */

/**
 * Public routes (NO auth)
 */
app.use(`${BASE_PATH}/auth`, authRoutes);

/**
 * Protected routes (NOW USING YOUR CUSTOM authMiddleware INSIDE ROUTES)
 */
app.use(`${BASE_PATH}/user`, userRoutes);
app.use(`${BASE_PATH}/transaction`, transactionRoutes);
app.use(`${BASE_PATH}/report`, reportRoutes);
app.use(`${BASE_PATH}/analytics`, analyticsRoutes);

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

/* ================= DEBUG ================= */

const date = getDateRange("lastMonth");
console.log(date);

/* ================= SERVER START ================= */

app.listen(Env.PORT, async () => {
  await connectDatabse();
  await initializeCrons();

  console.log(
    `Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`
  );
});