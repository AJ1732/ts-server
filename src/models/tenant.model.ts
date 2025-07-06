import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import slugify from "slugify";

import {
  BUSINESS_NATURE_OPTIONS,
  INVENTORY_TYPE_OPTIONS,
  BusinessNature,
  InventoryTypes,
} from "@/types/tenant";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 7);
const INV_ALLOWED = Object.values(INVENTORY_TYPE_OPTIONS) as InventoryTypes[];
const BUS_ALLOWED = Object.values(BUSINESS_NATURE_OPTIONS) as BusinessNature[];

// SIGNUP SCHEMA
const TenantSignupSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, unique: true },
    businessEmail: { type: String, required: true, unique: true },
    legalBusinessName: { type: String, required: true },
  },
  { timestamps: true }
);

TenantSignupSchema.pre("validate", function (next) {
  if (this.isNew && !this.tenantId) {
    const slug = slugify(this.legalBusinessName, {
      replacement: "",
      lower: false,
      strict: true,
      trim: true,
    });
    const prefix = slug.slice(0, 3);
    this.tenantId = `${prefix}${nanoid()}`;
  }
  next();
});

export const TenantSignup = mongoose.model(
  "TenantSignup",
  TenantSignupSchema,
  "tenants"
);

// TENANTS SCHEMA
const TenantSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    // Company Information (Step 1)
    tradingBrandName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    corporateAddress: {
      type: String,
      required: [true, "Corporate address is required"],
      trim: true,
      maxlength: 500,
    },
    corporateRegistrationNumber: {
      type: String,
      unique: true,
      required: [true, "Corporate registration number is required"],
      trim: true,
      maxlength: 50,
    },
    // Primary Contact (Step 2)
    primaryContact: {
      name: {
        type: String,
        required: [true, "Primary contact name is required"],
        trim: true,
        maxlength: 100,
      },
      role: {
        type: String,
        required: [true, "Primary contact role is required"],
        trim: true,
        maxlength: 100,
      },
      phoneNumber: {
        type: String,
        required: [true, "Primary contact phone is required"],
        trim: true,
        maxlength: 20,
      },
      email: {
        type: String,
        required: [true, "Primary contact email is required"],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
      },
    },
    // Operational Details (Step 3)
    inventoryTypes: {
      type: [String],
      required: [true, "Select at least one inventory type"],
      validate: {
        validator(arr: string[]) {
          if (!Array.isArray(arr) || arr.length === 0) return false;
          return arr.every(
            (v) =>
              typeof v === "string" &&
              v.trim().length > 0 &&
              (INV_ALLOWED.includes(v as InventoryTypes) ||
                v.startsWith("OTHER:"))
          );
        },
        message:
          "Each inventory type must be a valid option or a non-empty custom value.",
      },
    },
    natureOfBusiness: {
      type: [String],
      required: [true, "Select at least one business type"],
      validate: {
        validator(arr: string[]) {
          if (!Array.isArray(arr) || arr.length === 0) return false;
          return arr.every(
            (v) =>
              typeof v === "string" &&
              v.trim().length > 0 &&
              (BUS_ALLOWED.includes(v as BusinessNature) ||
                v.startsWith("OTHER:"))
          );
        },
        message:
          "Each business type must be a valid option or a non-empty custom value.",
      },
    },
    // Document Storage (Step 4)
    documents: {
      cacCertificate: {
        filename: String,
        fileUrl: String,
        uploadedAt: Date,
      },
      validId: {
        filename: String,
        fileUrl: String,
        uploadedAt: Date,
      },
      utilityBill: {
        filename: String,
        fileUrl: String,
        uploadedAt: Date,
      },
    },
    // Account Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["basic", "standard", "premium"],
      default: "basic",
    },
    subscriptionExpiresAt: {
      type: Date,
    },
    // Tenant Settings
    settings: {
      timezone: {
        type: String,
        default: "UTC",
      },
      currency: {
        type: String,
        default: "USD",
      },
      language: {
        type: String,
        default: "en",
      },
    },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model("Tenant", TenantSchema, "tenants");
