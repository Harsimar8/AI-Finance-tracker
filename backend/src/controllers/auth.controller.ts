import { Request, Response} from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService, refreshTokenService } from "../services/auth.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { UnauthorizedException } from "../utils/app-error";

export const RegisterController = asyncHandler(
    async (req: Request,res: Response) => {
        const body = registerSchema.parse(req.body);

        const result = await registerService(body);
        return res
        .status(HTTPSTATUS.CREATED)
        .json({ message: "User registered successfully",
            data: result,
         });
    }  
);

export const loginController = asyncHandler(
    async (req: Request, res: Response) =>{
        const body = loginSchema.parse({
            ...req.body,
        });
        const {user, accessToken, expiresAt, reportSetting} = await loginService(body);

        return res.status(HTTPSTATUS.OK).json({
            message: "User logged in successfully",
            user,
            accessToken,
            expiresAt,
            reportSetting,
        });
    }
);

export const refreshTokenController = asyncHandler(
    async (req: Request, res: Response) => {
        const user = (req as any).user;
        const userId = user?.userId;
        
        if (!userId) {
            throw new UnauthorizedException("Invalid token");
        }

        const result = await refreshTokenService(userId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Token refreshed successfully",
            ...result,
        });
    }
);