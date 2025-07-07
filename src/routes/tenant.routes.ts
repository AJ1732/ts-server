import { Router } from "express";
import {
  signupTenant,
  signinTenant,
  signoutTenant,
  onboardTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
} from "@/controller/tenant.controller";
import { upload, tenantMiddleware } from "@/middlewares";

const tenantRouter = Router();

// Public routes
tenantRouter.post("/signup", signupTenant);
tenantRouter.post("/signin", signinTenant);
tenantRouter.post("/signout", signoutTenant);

// Protected routes
tenantRouter.use(tenantMiddleware);

tenantRouter.post(
  "/:tenantId/onboard",
  upload.fields([
    { name: "documents[cacCertificate]", maxCount: 1 },
    { name: "documents[validId]", maxCount: 1 },
    { name: "documents[utilityBill]", maxCount: 1 },
  ]),
  onboardTenant
);
tenantRouter.get("/", getTenants);
tenantRouter.get("/:tenantId", getTenant);
tenantRouter.put(
  "/:tenantId",
  upload.fields([
    { name: "documents[cacCertificate]", maxCount: 1 },
    { name: "documents[validId]", maxCount: 1 },
    { name: "documents[utilityBill]", maxCount: 1 },
  ]),
  updateTenant
);
tenantRouter.delete("/:tenantId", deleteTenant);

export default tenantRouter;
