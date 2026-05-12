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
      )
      .optional(),
  }),
});

const validateRoomId = celebrate({
  params: Joi.object().keys({
    roomId: Joi.string().hex().length(24).required(),
  }),
});

movieRouter.get("/", validateGetMovies, getMovies);
movieRouter.get("/popular", getMovies);
movieRouter.get("/:roomId/available-movies", auth, validateRoomId, getAvailableMovies);

export default movieRouter;
