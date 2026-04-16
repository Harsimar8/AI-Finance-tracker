import {Router} from "express";
import { loginController, RegisterController, refreshTokenController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const authRoutes = Router();

authRoutes.post("/register", RegisterController);
authRoutes.post("/login", loginController);
authRoutes.post("/refresh-token", authMiddleware, refreshTokenController);

export default authRoutes;
