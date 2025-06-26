import express, { Application, Request, Response } from "express";
import { userRoutes } from "./routes";
import { errorHandler } from "./middlewares";
import { PORT } from "./config/env";

const app: Application = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/v1", userRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
