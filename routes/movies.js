import { Router } from "express";
import { getMovies, getAvailableMovies } from "../controllers/movies.js";
import { celebrate, Joi } from "celebrate";
import auth from "../middlewares/auth.js";

const movieRouter = Router();

const validateGetMovies = celebrate({
  query: Joi.object().keys({
    genres: Joi.string().optional(),
    year: Joi.alternatives()
      .try(Joi.string().valid("any"), Joi.string().length(4))
      .optional(),
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
      .optional(),
  }),
});

const validateRoomCode = celebrate({
  params: Joi.object().keys({
    roomCode: Joi.string().min(4).max(20).required(),
  }),
});

movieRouter.get("/", validateGetMovies, getMovies);
movieRouter.get("/popular", getMovies);
movieRouter.get(
  "/:roomCode/available-movies",
  auth,
  validateRoomCode,
  getAvailableMovies,
);

export default movieRouter;
