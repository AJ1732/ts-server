import { User } from "@/models";
import { AppError } from "@/utils/error";
import { Request, Response, NextFunction } from "express";

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

