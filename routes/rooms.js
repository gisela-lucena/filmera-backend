import { Router } from "express";
import {
  createRoom,
  updateRoomFilters,
  joinRoom,
  getAvailableMovies,
  addMovieToRoom,
  getRoom,
  clearMatch,
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
    code: Joi.string().min(4).max(20).optional(),
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
    filters: Joi.object()
      .keys({
        genres: Joi.alternatives()
          .try(Joi.array().items(Joi.number()), Joi.string().allow(""))
          .default([]),
        year: Joi.alternatives()
          .try(Joi.string().valid("any"), Joi.string().length(4))
          .default("any"),
        sort: Joi.string()
          .valid(
            "popularity.desc",
            "popularity.asc",
            "vote_average.desc",
            "vote_average.asc",
            "release_date.desc",
            "release_date.asc",
            "primary_release_date.desc",
            "primary_release_date.asc",
          )
          .default("popularity.desc"),
      })
      .optional(),
  }),
});

const filtersSchema = Joi.object()
  .keys({
    genres: Joi.alternatives()
      .try(Joi.array().items(Joi.number()), Joi.string().allow(""))
      .default([]),
    year: Joi.alternatives()
      .try(Joi.string().valid("any"), Joi.string().length(4))
      .default("any"),
    sort: Joi.string()
      .valid(
        "popularity.desc",
        "popularity.asc",
        "vote_average.desc",
        "vote_average.asc",
        "release_date.desc",
        "release_date.asc",
        "primary_release_date.desc",
        "primary_release_date.asc",
      )
      .default("popularity.desc"),
  })
  .required();

const validateUpdateRoomFilters = celebrate({
  params: Joi.object().keys({
    roomCode: Joi.string().min(4).max(20).required(),
  }),
  body: Joi.object().keys({
    filters: filtersSchema,
  }),
});

roomRouter.post("/", validateCreateRoom, createRoom);
roomRouter.patch(
  "/:roomCode/filters",
  validateUpdateRoomFilters,
  updateRoomFilters,
);
roomRouter.post("/:roomCode/join", validateRoomCode, joinRoom);
roomRouter.post("/:roomCode/movies", addMovieToRoom);
roomRouter.get("/:roomCode", validateRoomCode, getRoom);
roomRouter.get(
  "/:roomCode/available-movies",
  validateRoomCode,
  getAvailableMovies,
);
roomRouter.patch("/:roomCode/match/clear", validateRoomCode, clearMatch);

export default roomRouter;
