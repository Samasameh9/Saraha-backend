import express from "express";
import {
  authenticationController,
  messageController,
  userController,
} from "./modules/index.js";
import { globalErrorHandling } from "./middleware/error.middleware.js";
import { port } from "./config.js";
import { bootstrapDB } from "./DB/connection.db.js";
import cors from "cors";
import helmet from "helmet";
import { conversationController } from "./modules/conversation/index.js";
import { generateLimiter } from "./common/utils/limiter.js";

const app = express();


const limiter=generateLimiter()
app.set("trust proxy", true);
app.use(helmet(), cors(), limiter, express.json());
await bootstrapDB(app, port);

app.use("/assets", express.static("./assets"));
app.use("/auth", authenticationController);
app.use("/message", messageController);
app.use("/user", userController);
app.use("/conversation", conversationController);
app.get("/", (req, res, next) => {
  res.send({ message: "welcome to BE API" });
});
app.all("{/*dummy}", (req, res, next) => {
  res.status(404).send({ message: "invalid application routing" });
});

app.use(globalErrorHandling);
