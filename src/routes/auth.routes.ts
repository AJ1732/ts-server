import { Router, Request, Response } from "express";

const authRouter: Router = Router();

authRouter.post("/register", (_req: Request, res: Response) => {
  res.send({ title: "Register user" });
});

authRouter.post("/login", (_req: Request, res: Response) => {
  res.send({ title: "Log in user" });
});

authRouter.post("/logout", (_req: Request, res: Response) => {
  res.send({ title: "Log out user" });
});

export default authRouter;
