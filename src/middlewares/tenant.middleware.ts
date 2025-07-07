import type { NextFunction, Response } from "express";

import { verifyJWT } from "@/config/jwt";
import { Tenant } from "@/models";
import { AppError } from "@/utils/app-error";
import type { AuthenticatedRequest } from "@/types/request";

const tenantMiddleware = async (
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

    const tenant = await Tenant.findById(decoded.id).select("-password");
    if (!tenant) throw new AppError("Tenant not found", 404);

    // stash tenant on req for downstream handlers
    req.tenant = tenant;
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

export default tenantMiddleware;
