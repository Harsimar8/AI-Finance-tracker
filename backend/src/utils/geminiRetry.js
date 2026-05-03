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
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGeminiWithRetry = callGeminiWithRetry;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function callGeminiWithRetry(model_1, payload_1) {
    return __awaiter(this, arguments, void 0, function* (model, payload, retries = 3) {
        var _a;
        for (let i = 0; i < retries; i++) {
            try {
                return yield model.generateContent(payload);
            }
            catch (err) {
                if ((err === null || err === void 0 ? void 0 : err.status) === 503 || ((_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.includes("UNAVAILABLE"))) {
                    console.log(`Retrying Gemini... attempt ${i + 1}`);
                    yield sleep(1500 * (i + 1));
                }
                else {
                    throw err;
                }
            }
        }
        throw new Error("Gemini failed after retries");
    });
}
