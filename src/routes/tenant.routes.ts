import { Router } from "express";
import {
  signupTenant,
  signinTenant,
  signoutTenant,
  onboardTenant,
  getTenant,
  updateTenant,
} from "@/controllers/tenant.controller";
import { upload, tenantMiddleware } from "@/middlewares";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "@/controllers/user.controller";

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

// Profile routes
tenantRouter.get("/:tenantId", getTenant); // ✅
tenantRouter.put(
  "/:tenantId",
  upload.fields([
    { name: "documents[cacCertificate]", maxCount: 1 },
    { name: "documents[validId]", maxCount: 1 },
    { name: "documents[utilityBill]", maxCount: 1 },
  ]),
  updateTenant
); // ✅
// Users in Tenant routes
tenantRouter.get("/:tenantId/users", getUsers); // ✅
tenantRouter.post("/:tenantId/users", createUser); // ✅
tenantRouter.get("/:tenantId/users/:userId", getUser); // ✅
tenantRouter.put("/:tenantId/users/:userId", updateUser);
tenantRouter.delete("/:tenantId/users/:userId", deleteUser);

export default tenantRouter;
