import { Request, Response, NextFunction } from "express";
import { Document, Types } from "mongoose";

import { verifyJWT } from "@/config/jwt";
import { AppError } from "@/utils/error";
import { User } from "@/models";

interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      throw new AppError("Authorization header is missing or invalid", 401);
    }

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization?.split(" ")[1];
    }

    if (!token)
      throw new AppError("Authorization header is missing or invalid", 401);

    const decoded = verifyJWT(token);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) throw new AppError("User not found", 404);

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      error: (error as Error).message,
    });
  }
};

export default authMiddleware;
