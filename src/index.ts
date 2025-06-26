import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";

import { PORT } from "@/config/env";
import { connectToDatabase } from "@/db/mongodb";
import { errorMiddleware } from "@/middlewares";
import { authRoutes, userRoutes } from "@/routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorMiddleware);

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectToDatabase();
});
