import { config } from "dotenv";

import { AppError } from "@/utils/app-error";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

const {
  PORT: PORT_ENV,
  NODE_ENV: NODE_ENV_ENV,
  DB_URI: DB_URI_ENV,
  JWT_SECRET: JWT_SECRET_ENV,
  JWT_EXPIRES_IN: JWT_EXPIRES_IN_ENV,
  AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID_ENV,
  AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY_ENV,
  AWS_REGION: AWS_REGION_ENV,
  AWS_S3_BUCKET_NAME: AWS_S3_BUCKET_NAME_ENV,
} = process.env;

if (!PORT_ENV) throw new AppError("🌱 Missing env var: PORT", 500);
if (!DB_URI_ENV) throw new AppError("🌱 Missing env var: DB_URI", 500);
if (!JWT_SECRET_ENV) throw new AppError("🌱 Missing env var: JWT_SECRET", 500);
if (!JWT_EXPIRES_IN_ENV)
  throw new AppError("🌱 Missing env var: JWT_EXPIRES_IN", 500);
if (!AWS_ACCESS_KEY_ID_ENV)
  throw new AppError("🌱 Missing env var: AWS_ACCESS_KEY_ID", 500);
if (!AWS_SECRET_ACCESS_KEY_ENV)
  throw new AppError("🌱 Missing env var: AWS_SECRET_ACCESS_KEY", 500);
if (!AWS_REGION_ENV) throw new AppError("🌱 Missing env var: AWS_REGION", 500);
if (!AWS_S3_BUCKET_NAME_ENV)
  throw new AppError("🌱 Missing env var: AWS_S3_BUCKET_NAME", 500);

export const PORT: number = parseInt(PORT_ENV, 10);
export const NODE_ENV: string = NODE_ENV_ENV || "development";
export const DB_URI: string = DB_URI_ENV;
export const JWT_SECRET: string = JWT_SECRET_ENV;
export const JWT_EXPIRES_IN: string = JWT_EXPIRES_IN_ENV;
export const AWS_ACCESS_KEY_ID: string = AWS_ACCESS_KEY_ID_ENV;
export const AWS_SECRET_ACCESS_KEY: string = AWS_SECRET_ACCESS_KEY_ENV;
export const AWS_REGION: string = AWS_REGION_ENV;
export const AWS_S3_BUCKET_NAME: string = AWS_S3_BUCKET_NAME_ENV;
