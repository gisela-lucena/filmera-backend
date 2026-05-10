import { Router } from "express";
import { getMovies } from "../controllers/movies.js";

const movieRouter = Router();

movieRouter.get("/", getMovies);

export default movieRouter;
