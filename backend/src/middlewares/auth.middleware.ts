import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Env } from "../config/env.config";
import { UnauthorizedException } from "../utils/app-error";

type AuthUser = {
  userId: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
   console.log("🔥 HEADERS:", req.headers.authorization);
  if (!token) throw new UnauthorizedException("No token provided");

  try {
    const decoded = jwt.verify(token, Env.JWT_SECRET) as AuthUser;

    (req as any).user = decoded;

    next();
  } catch {
    throw new UnauthorizedException("Invalid token");
  }
};