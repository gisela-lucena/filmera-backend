import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import swipeRouter from "./routes/swipe.js";
import userRouter from "./routes/users.js";
import roomRouter from "./routes/room.js";
import moviesRouter from "./routes/movies.js";
import auth from "./middlewares/auth.js";
import dotenv from "dotenv";
import cors from "cors";
import { createUser, userLogin } from "./controllers/users.js";
import { celebrate, Joi, errors } from "celebrate";

dotenv.config();
console.log("Ambiente:", process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3000;
const { MONGODB_URI } = process.env;
const allowedOrigins = ["http://localhost:3000"];

const validateSigninRequest = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(70),
  }),
});

const validateSignupRequest = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(70),
  }),
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.post("/signin", validateSigninRequest, userLogin);
app.post("/signup", validateSignupRequest, createUser);
app.use("/swipe", auth, swipeRouter);
app.use("/users", auth, userRouter);
app.use("/room", auth, roomRouter);
app.use("/movies", auth, moviesRouter);

app.use(errors());

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
