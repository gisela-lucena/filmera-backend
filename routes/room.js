import { Router } from "express";
import {
  createRoom,
  joinRoom,
  getAvailableMovies,
} from "../controllers/room.js";

const roomRouter = Router();

roomRouter.post("/", createRoom);
roomRouter.post("/:roomId/join", joinRoom);
roomRouter.get("/", getAvailableMovies);

export default roomRouter;
