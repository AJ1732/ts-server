import { Router, Request, Response } from "express";

const userRouter: Router = Router();

userRouter.get("/", (_req: Request, res: Response) => {
  res.send({ title: "GET all users" });
});

userRouter.get("/:id", (_req: Request, res: Response) => {
  res.send({ title: "GET user details" });
});

userRouter.post("/", (_req: Request, res: Response) => {
  res.send({ title: "CREATE new user" });
});

userRouter.put("/:id", (_req: Request, res: Response) => {
  res.send({ title: "UPDATE user" });
});

userRouter.delete("/:id", (_req: Request, res: Response) => {
  res.send({ title: "DELETE user" });
});

export default userRouter;
