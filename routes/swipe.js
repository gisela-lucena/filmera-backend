import express from "express";
import { createSwipe } from "../controllers/swipe.js";

const swipeRouter = express.Router();

router.post("/", createSwipe);

export default swipeRouter;
