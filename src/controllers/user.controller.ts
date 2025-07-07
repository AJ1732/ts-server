import { Response, NextFunction } from "express";

import { comparePassword, generateHash } from "@/config/bcrypt";
import { User } from "@/models";
import { AppError } from "@/utils/app-error";
import { AuthenticatedRequest } from "@/types/request";
import { isMongoError } from "@/utils/type-guard";
import { signJWT } from "@/config/jwt";

export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) {
      throw new AppError("Missing authenticated tenant", 401);
    }

    const { tenantId: paramTenant } = req.params;
    if (paramTenant !== req.tenant.tenantId)
      throw new AppError("Forbidden: wrong tenant context", 403);

    const { email, password, role, warehouseId } = req.body;
    if (!warehouseId || !email || !password || !role) {
      throw new AppError(
        "warehouseId, email, password, and role are required",
        400
      );
    }

    const hashed = await generateHash(password);
    const user = await User.create({
      tenantId: req.tenant.tenantId,
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

export const signinUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await comparePassword(password, user.password!);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = signJWT({ id: user._id.toString() });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .status(200)
      .json({
        success: true,
        data: {
          email: user.email,
          tenantId: user.tenantId,
          warehouseId: user.warehouseId,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let users;
    if (req.tenant) {
      users = await User.find({ tenantId: req.tenant.tenantId }).select(
        "-password"
      );
      res.json({ success: true, data: users });
      return;
    }
    if (req.user) {
      const { tenantId, warehouseId } = req.user;
      users = await User.find({ tenantId, warehouseId }).select("-password");
      res.json({ success: true, data: users });
      return;
    }

    throw new AppError("Missing credentials", 401);
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
    const { tenantId: paramTenant, userId } = req.params;

    if (req.tenant) {
      if (paramTenant !== req.tenant.tenantId) {
        throw new AppError("Forbidden: wrong tenant context", 403);
      }
      const user = await User.findOne({
        _id: userId,
        tenantId: req.tenant.tenantId,
      }).select("-password");
      if (!user) throw new AppError("User not found", 404);
      res.json({ success: true, data: user });
      return;
    }

    if (req.user) {
      const { tenantId, warehouseId } = req.user;
      const user = await User.findOne({
        _id: userId,
        tenantId,
        warehouseId,
      }).select("-password");
      if (!user) throw new AppError("User not found", 404);
      res.json({ success: true, data: user });
      return;
    }
    throw new AppError("Missing credentials", 401);
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
    if (!req.tenant) throw new AppError("Missing authenticated tenant", 401);

    const { tenantId: paramTenant, userId } = req.params;
    if (paramTenant !== req.tenant.tenantId) {
      throw new AppError("Forbidden: wrong tenant context", 403);
    }

    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await generateHash(updates.password);
    }
    console.log("Upadtes: ", updates);

    const updated = await User.findOneAndUpdate(
      { _id: userId, tenantId: req.tenant.tenantId },
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) throw new AppError("User not found", 404);

    res.json({ success: true, data: updated });
  } catch (err) {
    if (isMongoError(err) && err.code === 11000) {
      throw new AppError("Email already exists", 409);
    }
    next(err);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) throw new AppError("Missing authenticated tenant", 401);

    const { tenantId: paramTenant, userId } = req.params;
    if (paramTenant !== req.tenant.tenantId)
      throw new AppError("Forbidden: wrong tenant context", 403);

    const deleted = await User.findOneAndDelete({
      _id: userId,
      tenantId: req.tenant.tenantId,
    });

    if (!deleted) throw new AppError("User not found", 404);

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
