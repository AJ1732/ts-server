import { Response, NextFunction } from "express";

import { generateHash } from "@/config/bcrypt";
import { User } from "@/models";
import { AppError } from "@/utils/app-error";
import { AuthenticatedRequest } from "@/types/request";
import { isMongoError } from "@/utils/type-guard";

export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;
    const warehouseId = req.user.warehouseId;

    const { email, password, role } = req.body;
    const hashed = await generateHash(password);
    const user = await User.create({
      tenantId,
      warehouseId,
      email,
      password: hashed,
      role,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (isMongoError(err) && err.code === 11000) {
      return next(new AppError("Email already exists", 409));
    }
    next(err);
  }
};

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;
    const warehouseId = req.user.warehouseId;

    const users = await User.find({ tenantId, warehouseId }).select(
      "-password"
    );
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;
    const warehouseId = req.user.warehouseId;

    const user = await User.findOne({
      _id: userId,
      tenantId,
      warehouseId,
    }).select("-password");
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;
    const warehouseId = req.user.warehouseId;

    const updates = { ...req.body };
    if (updates.password)
      updates.password = await generateHash(updates.password);
    const updated = await User.findOneAndUpdate(
      { _id: userId, tenantId, warehouseId },
      updates,
      { new: true, runValidators: true }
    ).select("-password");
    if (!updated) throw new AppError("User not found", 404);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (!req.user) throw new AppError("Missing authenticated user", 401);
    const tenantId = req.user.tenantId;
    const warehouseId = req.user.warehouseId;

    const deleted = await User.findOneAndDelete({
      _id: userId,
      tenantId,
      warehouseId,
    });
    if (!deleted) throw new AppError("User not found", 404);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
