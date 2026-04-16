import {Router} from "express";
import { getCurrentUserController, updateUserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../config/cloudinary.config";


const userRoutes = Router();

userRoutes.get("/current-user", authMiddleware, getCurrentUserController);
userRoutes.put(
    "/update",
    authMiddleware,
    upload.single("profilePicture"),
    updateUserController
);

export default userRoutes;
