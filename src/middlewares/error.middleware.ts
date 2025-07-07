import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { AppError } from "@/utils/app-error";

const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let error =
      err instanceof AppError
        ? err
        : new AppError((err as Error).message || "Something went wrong", 500);

    error.message = err.message;
    error.stack = err.stack;
    console.error(error);

    // Mongoose bad ObjectId error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any).name === "CastError") {
      error = new AppError("Resource not found.", 404);
    }

    // Mongoose duplicate key error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any).code === 11000) {
      error = new AppError("Duplicate field value entered.", 400);
    }

    // Mongoose validation error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any).name === "ValidationError") {
      const valErrors = (err as mongoose.Error.ValidationError).errors;
      const messages = Object.values(valErrors).map((e) => e.message);
      error = new AppError(messages.join(", "), 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  } catch (error) {
    res.status(500).send("Something broke!");
    next(error);
  }
};

export default errorMiddleware;
