import { Router } from "express";
import {
  createRoom,
  joinRoom,
  getAvailableMovies,
} from "../controllers/room.js";

const roomRouter = Router();

roomRouter.post("/room", createRoom);
roomRouter.post("/room/:roomId/join", joinRoom);
roomRouter.get("/room", getAvailableMovies);

export default roomRouter;
