import { Request, Response, NextFunction } from "express";

import { signJWT } from "@/config/jwt";
import { comparePassword, generateHash } from "@/config/bcrypt";
import { AppError } from "@/utils/error";
import { Tenant, TenantSignup } from "@/models";

export const signupTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessEmail, legalBusinessName } = req.body;
    let tenant = await TenantSignup.findOne({ businessEmail });
    if (tenant) throw new AppError("Tenant already exists", 409);

    tenant = await TenantSignup.create({ businessEmail, legalBusinessName });
    const hashed = await generateHash(tenant.tenantId);

    await Tenant.findOneAndUpdate(
      { tenantId: tenant.tenantId },
      { password: hashed },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: { tenantId: tenant.tenantId, email: tenant.businessEmail },
      onboarding: false,
    });
  } catch (error) {
    next(error);
  }
};

export const signinTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const tenant = await Tenant.findOne({ businessEmail: email }).select(
      "+password"
    );
    if (!tenant) throw new AppError("Tenant not found", 404);

    const valid = await comparePassword(password, tenant.password);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const token = signJWT({ id: tenant._id.toString() });
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
        data: { tenantId: tenant.tenantId },
        onboarding: tenant.onboardingComplete,
      });
  } catch (error) {
    next(error);
  }
};

export const signoutTenant = (_req: Request, res: Response) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    .status(200)
    .json({ success: true, message: "Signed out" });
};

export const onboardTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const updates = req.body;

    if (typeof updates.inventoryTypes === "string") {
      updates.inventoryTypes = JSON.parse(updates.inventoryTypes);
    }
    if (typeof updates.natureOfBusiness === "string") {
      updates.natureOfBusiness = JSON.parse(updates.natureOfBusiness);
    }

    const files = req.files as {
      [key: string]: Express.Multer.File[];
    };

    updates.documents = {
      cacCertificate: {
        filename: files["documents[cacCertificate]"]?.[0]?.originalname,
        fileUrl: `uploads/${files["documents[cacCertificate]"]?.[0]?.filename}`,
        uploadedAt: new Date(),
      },
      validId: {
        filename: files["documents[validId]"]?.[0]?.originalname,
        fileUrl: `uploads/${files["documents[validId]"]?.[0]?.filename}`,
        uploadedAt: new Date(),
      },
      utilityBill: {
        filename: files["documents[utilityBill]"]?.[0]?.originalname,
        fileUrl: `uploads/${files["documents[utilityBill]"]?.[0]?.filename}`,
        uploadedAt: new Date(),
      },
    };

    console.log("Updates", updates);

    const tenant = await Tenant.findOneAndUpdate(
      { tenantId },
      { ...updates, onboardingComplete: true },
      { new: true, runValidators: true }
    );
    if (!tenant) throw new AppError("Tenant not found", 404);
    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};

export const createTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenant = await Tenant.create(req.body);
    res.status(201).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
};

export const getTenants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json({
      success: true,
      count: tenants.length,
      data: tenants,
    });
  } catch (error) {
    next(error);
  }
};

export const getTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) throw new AppError("Tenant not found", 404);
    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const updated = await Tenant.findOneAndUpdate({ tenantId }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new AppError("Tenant not found", 404);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId } = req.params;
    const deleted = await Tenant.findOneAndDelete({ tenantId });
    if (!deleted) throw new AppError("Tenant not found", 404);
    res
      .status(200)
      .json({ success: true, message: `Tenant ${tenantId} deleted` });
  } catch (error) {
    next(error);
  }
};
