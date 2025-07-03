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
    let token: string | undefined;

    if (req.cookies && typeof req.cookies.token === "string") {
      token = req.cookies.token;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ", 2)[1];
    }

    if (!token) {
      throw new AppError("Authentication token is missing", 401);
    }

    const decoded = verifyJWT(token);
    if (!decoded?.userId) {
      throw new AppError("Invalid token payload", 401);
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) throw new AppError("User not found", 404);

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      error: (error as Error).message,
    });
    return;
  }
};

export default authMiddleware;
