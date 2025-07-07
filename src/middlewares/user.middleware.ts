import type { NextFunction, Response } from "express";

import { verifyJWT } from "@/config/jwt";
import { User } from "@/models";
import type { AuthenticatedRequest } from "@/types/request";
import { AppError } from "@/utils/app-error";

// --- Middleware: user authentication ---
export const userMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) throw new AppError("Authentication token is missing", 401);

    const decoded = verifyJWT(token);
    if (!decoded?.id) throw new AppError("Invalid token payload", 401);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) throw new AppError("User not found", 404);

    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      error: (err as Error).message,
    });
    return;
  }
};

// --- Middleware: ensure user has access to specific warehouse ---
export const warehouseAccessMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const { warehouseId } = req.params;

  if (!req.user) throw new AppError("Authentication required", 401);
  if (req.user.warehouseId !== warehouseId)
    throw new AppError("Forbidden: cannot access another warehouse", 403);
  next();
};

// --- Middleware: role-based authorization ---
export const requireManager = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) throw new AppError("Authentication required", 401);
  if (req.user.role !== "manager")
    throw new AppError("Forbidden: manager role required", 403);
  next();
};
