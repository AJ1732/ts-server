import { Router } from "express";

import { signIn, signOut, signUp } from "@/controller/admin.controller";

const adminRouter: Router = Router();

adminRouter.post("/signup", signUp);
adminRouter.post("/signin", signIn);
adminRouter.post("/signout", signOut);

export default adminRouter;
