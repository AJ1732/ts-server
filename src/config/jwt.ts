import jwt from "jsonwebtoken";

import { JWT_SECRET, JWT_EXPIRES_IN } from "@/config/env";
import { AppError } from "@/utils/error";

export interface JwtPayload {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function signJWT(payload: JwtPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  } catch (err) {
    throw new AppError(`JWT signing failed: ${(err as Error).message}`, 500);
  }
}

export function verifyJWT(token: string): JwtPayload {
  try {
    if (!JWT_SECRET) {
      throw new AppError("Missing JWT secret in environment", 500);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JwtPayload;
  } catch (err) {
    throw new AppError(
      `JWT verification failed: ${(err as Error).message}`,
      401
    );
  }
}
