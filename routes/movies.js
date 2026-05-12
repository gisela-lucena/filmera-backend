import { Router } from "express";

import {
  getPopularMovies,
  getTopRatedMovies,
  getGenres,
  getMoviesByGenre,
  getMovieDetails,
} from "../controllers/movies.js";

const movieRouter = Router();

movieRouter.get("/popular", getPopularMovies);
movieRouter.get("/top-rated", getTopRatedMovies);
movieRouter.get("/genres", getGenres);
movieRouter.get("/discover", getMoviesByGenre);
movieRouter.get("/:movieId", getMovieDetails);

export default movieRouter;
