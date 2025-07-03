import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { User } from "@/models";

import { AppError } from "@/utils/error";
import { comparePassword, generateHash } from "@/config/bcrypt";
import { signJWT } from "@/config/jwt";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!req.body || typeof req.body !== "object")
      throw new AppError("Request body must be JSON", 400);

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      throw new AppError("Name, Email and password are required", 400);

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) throw new AppError("User already exists", 409);

    // Hash password
    const hashedPassword = await generateHash(password);

    // Create new user
    const newUser = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    );

    // Generate JWT token
    let token;
    if (!newUser || newUser.length === 0) {
      token = signJWT({ userId: newUser[0]._id.toString() });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: newUser[0],
        token,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body || typeof req.body !== "object")
      throw new AppError("Request body must be JSON", 400);

    const { email, password } = req.body;
    if (!email || !password)
      throw new AppError("Email and password are required", 400);

    const user = await User.findOne({ email });
    if (!user) throw new AppError("User not found", 404);

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new AppError("Invalid password", 401);

    const token = signJWT({ userId: user._id.toString() });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: upassword, ...rest } = user.toObject();

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
      })
      .status(200)
      .json({
        success: true,
        message: "User signed in successfully",
        data: {
          user: { ...rest },
          // token,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (
  req: Request,
  res: Response
  // next: NextFunction
) => {
  try {
    // Check this out later
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
    });
    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    console.error("Error during sign out:", error);
    res.status(500).json({ error: "Error during sign out" });
  }
};
