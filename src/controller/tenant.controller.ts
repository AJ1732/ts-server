import { Request, Response, NextFunction } from "express";

import { signJWT } from "@/config/jwt";
import { comparePassword, generateHash } from "@/config/bcrypt";
import { AppError } from "@/utils/app-error";
import { Tenant, TenantSignup } from "@/models";
import { DocumentUpload } from "@/types/document";
import { S3Service } from "@/services/s3.service";

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
  const uploadedFiles: Array<{ s3Key: string; documentType: string }> = [];

  try {
    const { tenantId } = req.params;
    const updates = req.body;
    const files = req.files as { [key: string]: Express.Multer.File[] };

    // Parse JSON strings from form data
    if (typeof updates.inventoryTypes === "string") {
      updates.inventoryTypes = JSON.parse(updates.inventoryTypes);
    }
    if (typeof updates.natureOfBusiness === "string") {
      updates.natureOfBusiness = JSON.parse(updates.natureOfBusiness);
    }

    // Fetch existing tenant to handle updates
    const existingTenant = await Tenant.findOne({ tenantId }).lean();
    if (!existingTenant) throw new AppError("Tenant not found", 404);

    // Handle document uploads to S3
    const documentUploads: Record<string, DocumentUpload> = {};
    const requiredDocs = ["cacCertificate", "validId", "utilityBill"];

    for (const docType of requiredDocs) {
      const key = `documents[${docType}]`;
      if (!files[key] || files[key].length === 0) {
        throw new AppError(
          `${docType} document is required for onboarding`,
          400
        );
      }
    }

    // Upload each document to S3
    for (const [fieldName, fileArray] of Object.entries(files)) {
      if (!fileArray || fileArray.length === 0) continue;
      const file = fileArray[0];
      const documentType = fieldName.replace("documents[", "").replace("]", "");

      try {
        const oldDoc =
          existingTenant.documents && documentType in existingTenant.documents
            ? (existingTenant.documents[
                documentType as keyof typeof existingTenant.documents
              ] as DocumentUpload | undefined)
            : undefined;
        if (oldDoc?.s3Key) {
          await S3Service.deleteFile(oldDoc.s3Key);
        }
        // console.log(`📤 Uploading ${documentType} for tenant ${tenantId}...`);

        const uploadResult = await S3Service.uploadFile(
          file,
          `tenant-documents/${tenantId}`
        );

        // Track uploaded files for cleanup on failure
        uploadedFiles.push({ s3Key: uploadResult.key, documentType });

        documentUploads[documentType] = {
          filename: uploadResult.originalName,
          fileUrl: uploadResult.location,
          s3Key: uploadResult.key,
          uploadedAt: new Date(),
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
        };

        // console.log(`✅ ${documentType} uploaded successfully: ${uploadResult.key}`);
      } catch (uploadError) {
        console.error(`❌ Failed to upload ${documentType}:`, uploadError);
        if (uploadError instanceof Error) {
          throw new AppError(
            `Failed to upload ${documentType}: ${uploadError.message}`,
            500
          );
        } else {
          throw new AppError(
            `Failed to upload ${documentType}: unknown error`,
            500
          );
        }
      }
    }

    // Merge document uploads into update payload
    updates.documents = {
      ...(existingTenant.documents || {}),
      ...documentUploads,
    };
    updates.onboardingComplete = true;

    // console.log("Updates", updates);

    const tenant = await Tenant.findOneAndUpdate({ tenantId }, updates, {
      new: true,
      runValidators: true,
    });
    if (!tenant) throw new AppError("Tenant not found", 404);
    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    for (const f of uploadedFiles) {
      await S3Service.deleteFile(f.s3Key).catch(() => {});
    }
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
  const uploadedFiles: Array<{ s3Key: string; documentType: string }> = [];
  try {
    const { tenantId } = req.params;
    const updates = req.body;
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;

    if (files && Object.keys(files).length > 0) {
      const existingTenant = await Tenant.findOne({ tenantId }).lean();
      if (!existingTenant) throw new AppError("Tenant not found", 404);

      const docsMap = existingTenant.documents as
        | Record<string, DocumentUpload>
        | undefined;
      const docUpdates: Record<string, DocumentUpload> = {};

      for (const [field, arr] of Object.entries(files)) {
        if (!arr?.length) continue;
        const file = arr[0];
        const docType = field.replace("documents[", "").replace("]", "");

        // delete old
        const old = docsMap?.[docType];
        if (old?.s3Key) await S3Service.deleteFile(old.s3Key);

        // upload new
        const result = await S3Service.uploadFile(
          file,
          `tenant-documents/${tenantId}`
        );
        uploadedFiles.push({ s3Key: result.key, documentType: docType });
        docUpdates[docType] = {
          filename: result.originalName,
          fileUrl: result.location,
          s3Key: result.key,
          uploadedAt: new Date(),
          size: result.size,
          mimeType: result.mimeType,
        };
      }
      updates.documents = { ...(docsMap || {}), ...docUpdates };
    }

    const updated = await Tenant.findOneAndUpdate({ tenantId }, updates, {
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
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) throw new AppError("Tenant not found", 404);

    // cleanup S3
    const docs = tenant.documents;
    if (docs) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [type, doc] of Object.entries(docs)) {
        if (doc && typeof doc === "object" && "s3Key" in doc && doc.s3Key) {
          await S3Service.deleteFile((doc as DocumentUpload).s3Key);
        }
      }
    }

    await Tenant.deleteOne({ tenantId });
    res
      .status(200)
      .json({ success: true, message: `Tenant ${tenantId} deleted` });
  } catch (error) {
    next(error);
  }
};
