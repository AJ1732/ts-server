import 'dotenv/config';   
import express, { Application, Request, Response } from "express";

import { PORT } from "@/config/env";
import { connectToDatabase } from "@/db/mongodb";
import { errorHandler } from "@/middlewares";
import { authRoutes, userRoutes } from "@/routes";

const app: Application = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectToDatabase();
});
