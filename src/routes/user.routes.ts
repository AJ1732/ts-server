import { Router, Request, Response } from "express";

import { deleteUser, getUser, getUsers } from "@/controller/user.controller";
import { authMiddleware } from "@/middlewares";

const userRouter: Router = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", authMiddleware, getUser);

userRouter.post("/", (_req: Request, res: Response) => {
  res.send({ title: "CREATE new user" });
});

userRouter.put("/:id", (_req: Request, res: Response) => {
  res.send({ title: "UPDATE user" });
});

userRouter.delete("/:id", authMiddleware, deleteUser);

export default userRouter;
