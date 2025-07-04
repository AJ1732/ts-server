import { Request, Response, NextFunction } from "express";

import { User } from "@/models";
import { AppError } from "@/utils/error";

interface AuthRequest extends Request {
  userId?: string;
}

export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) throw new AppError("No Users found", 404);

    res.status(200).json({
      success: true,
      message: "Successfully fetched all Users",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({
      success: true,
      message: `Successfully fetched User ${req.params.id}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const idToDelete = req.params.id;
    console.log("ID:", idToDelete);
    console.log("USER ID:", req.userId);

    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }
    if (req.userId !== idToDelete) {
      throw new AppError(
        "Forbidden: you can only delete your own account",
        403
      );
    }
    const deletedUser = await User.findByIdAndDelete(idToDelete);
    if (!deletedUser) throw new AppError("User not found", 404);

    res.status(200).json({
      success: true,
      message: `Successfully deleted User ${req.params.id}`,
    });
  } catch (error) {
    next(error);
  }
};
