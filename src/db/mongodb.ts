import mongoose from "mongoose";

import { DB_URI, NODE_ENV } from "@/config/env";

export async function connectToDatabase() {
  if (!DB_URI) {
    throw new Error(
      "Please define the DB_URI environment variable inside the .env.<development/production>.local"
    );
  }

  try {
    await mongoose.connect(DB_URI);
    console.log(`Connected to database in ${NODE_ENV} mode`);
  } catch (error) {
    console.error("Error connecting to database: ", error);
    process.exit(1);
  }
}
