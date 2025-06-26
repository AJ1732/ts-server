import express, { Application, Request, Response } from "express";
import { userRoutes } from "./routes";
import { errorHandler } from "./middlewares";

const app: Application = express();
const port: number = 3000;

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api", userRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
