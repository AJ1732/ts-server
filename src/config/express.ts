import express, { Application } from "express";

export const ExpressConfig = () => {
  const app: Application = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.set("trust proxy", true); // Research on this
  return app;
};
