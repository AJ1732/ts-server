import { config } from "dotenv";

import { AppError } from "@/utils/error";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

const {
  PORT: PORT_ENV,
  NODE_ENV: NODE_ENV_ENV,
  DB_URI: DB_URI_ENV,
  JWT_SECRET: JWT_SECRET_ENV,
  JWT_EXPIRES_IN: JWT_EXPIRES_IN_ENV,
} = process.env;

if (!PORT_ENV) throw new AppError("🌱 Missing env var: PORT", 500);
if (!DB_URI_ENV) throw new AppError("🌱 Missing env var: DB_URI", 500);
if (!JWT_SECRET_ENV) throw new AppError("🌱 Missing env var: JWT_SECRET", 500);
if (!JWT_EXPIRES_IN_ENV)
  throw new AppError("🌱 Missing env var: JWT_EXPIRES_IN", 500);

export const PORT: number = parseInt(PORT_ENV, 10);
export const NODE_ENV: string = NODE_ENV_ENV || "development";
export const DB_URI: string = DB_URI_ENV;
export const JWT_SECRET: string = JWT_SECRET_ENV;
export const JWT_EXPIRES_IN: string = JWT_EXPIRES_IN_ENV;
