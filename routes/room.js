import { Router } from "express";
import { getAvailableMovies } from "../controllers/room.js";

const roomRouter = Router();

roomRouter.get("/room", getAvailableMovies);

export default roomRouter;
