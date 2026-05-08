import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import swipeRouter from "./routes/swipe.js";
import userRouter from "./routes/users.js";
import roomRouter from "./routes/room.js";
import auth from "./middlewares/auth.js";
import dotenv from "dotenv";
import cors from "cors";
import { logRequests } from "./middlewares/requestLogger.js";

dotenv.config();
console.log("Ambiente:", process.env.NODE_ENV);

const app = express();
app.use(cors());

app.use(express.json());
app.use(logRequests);

app.use("/swipe", swipeRouter);
app.use("/users", auth, userRouter);
app.use("/room", auth, roomRouter);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado ao MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB", err);
    process.exit(1);
  });

export default app;
