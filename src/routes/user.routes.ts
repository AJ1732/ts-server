import { Router } from "express";

import { signinUser, getUser, getUsers } from "@/controllers/user.controller";
import {
  requireManager,
  userMiddleware,
  warehouseAccessMiddleware,
} from "@/middlewares";

const userRouter = Router();

userRouter.post("/signin", signinUser);
userRouter.get("/:userId", getUser);

// Below routes require a valid user‑token
userRouter.use(userMiddleware, warehouseAccessMiddleware);

// manager only
userRouter.get("/", requireManager, warehouseAccessMiddleware, getUsers);

export default userRouter;
