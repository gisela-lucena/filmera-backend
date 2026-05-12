import { Router } from "express";

import { getMovies, getAvailableMovies } from "../controllers/movies.js";

const movieRouter = Router();

movieRouter.get("/", getMovies);
movieRouter.get("/popular", getMovies);
movieRouter.get("/:roomId/available-movies", getAvailableMovies);

export default movieRouter;
