import { Router } from "express";
import { createSwipe } from "../controllers/swipe.js";
import { celebrate, Joi } from "celebrate";

const swipeRouter = Router();

const validateCreateSwipe = celebrate({
  body: Joi.object().keys({
    roomCode: Joi.string().required(),
    movieId: Joi.number().required(),
    liked: Joi.boolean().required(),
  }),
});

swipeRouter.post("/", validateCreateSwipe, createSwipe);

export default swipeRouter;
