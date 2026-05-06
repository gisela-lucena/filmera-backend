import express from "express";
import { createSwipe } from "../controllers/swipe.js";

const router = express.Router();

router.post("/", createSwipe);

export default router;
