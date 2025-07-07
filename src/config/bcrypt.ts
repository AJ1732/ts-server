import bcrypt from "bcryptjs";

import { AppError } from "@/utils/app-error";

export async function generateHash(
  input: string,
  saltRounds: number = 10
): Promise<string> {
  try {
    return await bcrypt.hash(input, saltRounds);
  } catch (err) {
    throw new AppError(`Error generating hash: ${(err as Error).message}`, 500);
  }
}

export async function comparePassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch (err) {
    throw new AppError(
      `Error comparing password: ${(err as Error).message}`,
      500
    );
  }
}
