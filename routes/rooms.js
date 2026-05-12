import { Router } from "express";
import {
  createRoom,
  joinRoom,
  getAvailableMovies,
} from "../controllers/room.js";
import { celebrate, Joi } from "celebrate";

const roomRouter = Router();

const validateRoomId = celebrate({
  params: Joi.object().keys({
    roomId: Joi.string().hex().length(24).required(),
  }),
});

const validateCreateRoom = celebrate({
  body: Joi.object().keys({
    code: Joi.string().min(4).max(20).required(),
    movies: Joi.array()
      .items(
        Joi.object().keys({
          tmdbId: Joi.number().required(),
          title: Joi.string().required(),
          year: Joi.string().allow(""),
          rating: Joi.string().allow(""),
          overview: Joi.string().allow(""),
          poster: Joi.string().uri().allow(""),
        }),
      )
      .required(),
    filters: Joi.object().optional(),
  }),
});

roomRouter.post("/", validateCreateRoom, createRoom);
roomRouter.post("/:roomId/join", validateRoomId, joinRoom);
roomRouter.get("/:roomId", validateRoomId, getAvailableMovies);

export default roomRouter;
