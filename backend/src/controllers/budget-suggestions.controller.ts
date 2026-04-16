import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { analyzeBudgetService } from "../services/budget-suggestions.service";

export const getBudgetSuggestionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const dateRangePreset = req.query.preset as string | undefined;

    const suggestions = await analyzeBudgetService(userId, dateRangePreset as any);

    return res.status(HTTPSTATUS.OK).json({
      message: "Budget analysis fetched successfully",
      data: suggestions,
    });
  }
);