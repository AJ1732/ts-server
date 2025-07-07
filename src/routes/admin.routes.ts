import { Router } from "express";

import { signIn, signOut, signUp } from "@/controllers/admin.controller";
import {
  deleteTenant,
  getTenant,
  getTenants,
  updateTenant,
} from "@/controllers/tenant.controller";
import { adminMiddleware, upload } from "@/middlewares";

const adminRouter: Router = Router();

adminRouter.post("/signup", signUp);
adminRouter.post("/signin", signIn);
adminRouter.post("/signout", signOut);

adminRouter.use(adminMiddleware);

adminRouter.get("/", getTenants);
adminRouter.get("/:tenantId", getTenant);
adminRouter.put(
  "/:tenantId",
  upload.fields([
    { name: "documents[cacCertificate]", maxCount: 1 },
    { name: "documents[validId]", maxCount: 1 },
    { name: "documents[utilityBill]", maxCount: 1 },
  ]),
  updateTenant
);
adminRouter.delete("/:tenantId", deleteTenant);

export default adminRouter;
