import express from "express";
import { authenticationController,  messageController,  userController } from "./modules/index.js";
import { globalErrorHandling } from "./middleware/error.middleware.js";
import { port } from "./config.js";
import { bootstrapDB } from "./DB/connection.db.js";
import cors from 'cors'

const app = express();

app.use(cors(),express.json());
bootstrapDB(app,port)




app.use("/auth", authenticationController);
app.use("/message", messageController);
app.use("/user", userController);
app.get("/", (req, res, next) => {
  res.send({ message: "welcome to BE API" });
});
app.all("{/*dummy}", (req, res, next) => {
  res.status(404).send({ message: "invalid application routing" });
});


app.use(globalErrorHandling)





