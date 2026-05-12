import { Router } from "express";
import { createSwipe } from "../controllers/swipe.js";

const swipeRouter = Router();

swipeRouter.post("/", createSwipe);

export default swipeRouter;
