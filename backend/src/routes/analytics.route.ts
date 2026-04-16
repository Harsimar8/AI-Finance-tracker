import { Router } from "express";
import {
  chartAnalyticsController,
  expensePieChartBreakdownController,
  summaryAnalyticsController,
} from "../controllers/analytics.controller";
import { getBudgetSuggestionsController } from "../controllers/budget-suggestions.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const analyticsRoutes = Router();

analyticsRoutes.get("/summary", authMiddleware, summaryAnalyticsController);
analyticsRoutes.get("/chart", authMiddleware, chartAnalyticsController);
analyticsRoutes.get("/expense-breakdown", authMiddleware, expensePieChartBreakdownController);
analyticsRoutes.get("/suggestions", authMiddleware, getBudgetSuggestionsController);

export default analyticsRoutes;