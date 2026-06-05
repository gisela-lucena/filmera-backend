import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import swipeRouter from "./routes/swipes.js";
import userRouter from "./routes/users.js";
import roomRouter from "./routes/rooms.js";
import moviesRouter from "./routes/movies.js";
import auth from "./middlewares/auth.js";
import cors from "cors";
import {
  createUser,
  requestPasswordReset,
  resetPassword,
  userLogin,
} from "./controllers/users.js";
import { celebrate, Joi, errors } from "celebrate";

console.log("Ambiente:", process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://filmera-frontend.vercel.app",
  "https://filmera.us",
];

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

const validateForgotPasswordRequest = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
});

const validateResetPasswordRequest = celebrate({
  body: Joi.object().keys({
    token: Joi.string().required().hex().length(64),
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
app.post(
  "/forgot-password",
  validateForgotPasswordRequest,
  requestPasswordReset,
);
app.post("/reset-password", validateResetPasswordRequest, resetPassword);
app.use("/swipes", auth, swipeRouter);
app.use("/users", auth, userRouter);
app.use("/rooms", auth, roomRouter);
app.use("/movies", moviesRouter);

app.use(errors());
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.statusCode ? err.message : "Internal server error",
  });
});

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
