import express from "express";
import { getAvailableMovies } from "../controllers/room.js";

const roomRouter = express.Router();

router.get("/", getAvailableMovies);

export default roomRouter;
