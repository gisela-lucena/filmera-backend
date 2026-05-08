import { Router } from "express";
import {
  getCurrentUser,
  getUserById,
  patchUser,
} from "../controllers/users.js";
import { celebrate, Joi } from "celebrate";
import { validateURL } from "../utils/validation.js";

const validateUpdateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
  }),
});

const validateUserId = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
});

const userRouter = Router();

userRouter.get("/me", getCurrentUser);
userRouter.get("/:userId", validateUserId, getUserById);
userRouter.patch("/me", validateUpdateProfile, patchUser);

export default userRouter;
