"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_config_1 = require("./config/env.config");
const http_config_1 = require("./config/http.config");
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const app_error_1 = require("./utils/app-error");
const asyncHandler_middleware_1 = require("./middlewares/asyncHandler.middleware");
const database_config_1 = __importDefault(require("./config/database.config"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const transaction_route_1 = __importDefault(require("./routes/transaction.route"));
const report_route_1 = __importDefault(require("./routes/report_route"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
const crons_1 = require("./crons");
const helper_1 = require("./utils/helper");
const date_1 = require("./utils/date");
const google_ai_config_1 = require("./config/google-ai-config");
const app = (0, express_1.default)();
const BASE_PATH = env_config_1.Env.BASE_PATH;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
/* ================= TEST ROUTES ================= */
app.get("/", (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    throw new app_error_1.BadRequestException("This is a test Error");
    res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Hello Subscribe to the channel",
    });
})));
/* ================= AI TEST ROUTE ================= */
app.get(`${BASE_PATH}/test-ai`, (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("Testing AI with key:", ((_a = env_config_1.Env.GEMINI_API_KEY) === null || _a === void 0 ? void 0 : _a.substring(0, 15)) + "...");
        const result = yield google_ai_config_1.genAI.models.generateContent({
            model: google_ai_config_1.genAIModel,
            contents: [{ role: "user", parts: [{ text: "Say 'AI is working' if you receive this" }] }],
            config: { responseMimeType: "text/plain" },
        });
        res.status(http_config_1.HTTPSTATUS.OK).json({
            message: "AI test successful",
            response: result.text,
        });
    }
    catch (error) {
        console.error("AI Test Error:", error.message);
        res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message: "AI test failed",
            error: error.message,
        });
    }
})));
/* ================= TEST ROUTE ================= */
app.get("/", (0, asyncHandler_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    throw new app_error_1.BadRequestException("This is a test Error");
    res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Hello Subscribe to the channel",
    });
})));
/* ================= INIT HELPERS ================= */
(0, helper_1.calculateNextReportDate)();
/* ================= ROUTES ================= */
/**
 * Public routes (NO auth)
 */
app.use(`${BASE_PATH}/auth`, auth_routes_1.default);
/**
 * Protected routes (NOW USING YOUR CUSTOM authMiddleware INSIDE ROUTES)
 */
app.use(`${BASE_PATH}/user`, user_route_1.default);
app.use(`${BASE_PATH}/transaction`, transaction_route_1.default);
app.use(`${BASE_PATH}/report`, report_route_1.default);
app.use(`${BASE_PATH}/analytics`, analytics_route_1.default);
/* ================= ERROR HANDLER ================= */
app.use(errorHandler_middleware_1.errorHandler);
/* ================= DEBUG ================= */
const date = (0, date_1.getDateRange)("lastMonth");
console.log(date);
/* ================= SERVER START ================= */
app.listen(env_config_1.Env.PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_config_1.default)();
    yield (0, crons_1.initializeCrons)();
    console.log(`Server is running on port ${env_config_1.Env.PORT} in ${env_config_1.Env.NODE_ENV} mode`);
}));
