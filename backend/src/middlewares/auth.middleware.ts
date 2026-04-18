import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Env } from "../config/env.config";
import { UnauthorizedException } from "../utils/app-error";
import UserModel from "../models/user.model";

type AuthUser = {
  userId: string;
  email?: string;
  name?: string;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : authHeader;
    
  console.log("AUTH HEADERS:", req.headers.authorization, "Token:", token);
  if (!token) throw new UnauthorizedException("No token provided");

  try {
    const decoded = jwt.verify(token, Env.JWT_SECRET) as AuthUser;

    // Fetch user details for email
    const user = await UserModel.findById(decoded.userId).select("email name").lean();
    
    (req as any).user = {
      userId: decoded.userId,
      email: user?.email,
      name: user?.name,
    };

    next();
  } catch {
    throw new UnauthorizedException("Invalid token");
  }
};