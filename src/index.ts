import "dotenv/config";
import { Request, Response } from "express";
import cookieParser from "cookie-parser";

import { PORT } from "@/config/env";
import { ExpressConfig } from "@/config/express";
import { connectToDatabase } from "@/db/mongodb";
import { errorMiddleware } from "@/middlewares";
import { adminRoutes, tenantRoutes, userRoutes } from "@/routes";

const app = ExpressConfig();

app.use(cookieParser());

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorMiddleware);

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectToDatabase();
});
