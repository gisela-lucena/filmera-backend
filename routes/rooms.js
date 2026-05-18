import { Router } from "express";
import {
  createRoom,
  joinRoom,
  getAvailableMovies,
  addMovieToRoom,
} from "../controllers/room.js";
import { celebrate, Joi } from "celebrate";

const roomRouter = Router();

const validateRoomCode = celebrate({
  params: Joi.object().keys({
    roomCode: Joi.string().min(4).max(20).required(),
  }),
});

const validateCreateRoom = celebrate({
  body: Joi.object().keys({
    roomCode: Joi.string().min(4).max(20).optional(),
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
      .default([]),
    filters: Joi.object().optional(),
  }),
});

roomRouter.post("/", validateCreateRoom, createRoom);
roomRouter.post("/:roomCode/join", validateRoomCode, joinRoom);
roomRouter.post("/:roomCode/movies", addMovieToRoom);
roomRouter.get("/:roomCode", validateRoomCode, getAvailableMovies);

export default roomRouter;
