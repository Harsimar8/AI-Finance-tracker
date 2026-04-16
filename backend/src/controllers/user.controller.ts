import {Request, Response} from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { findByIdUserService, updateuserService } from "../services/user.service";
import { updateUserSchema } from "../validators/user.validator";

export const getCurrentUserController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId =  req.user?.userId;

        const user = await findByIdUserService(userId);
        return res.status(HTTPSTATUS.OK).json({
            message: "User fetched successfully",
            user, 
        });
    }
);

export const updateUserController = asyncHandler(
    async (req: Request, res: Response) => {
        const body = updateUserSchema.parse(req.body);
        const userId = req.user?.userId;
        const profilePic = req.file;
        const user = await updateuserService(userId, body, profilePic);
        return res.status(HTTPSTATUS.OK).json({
message: "User profile updated successfully",
data: user,
        })
        
    }
)
