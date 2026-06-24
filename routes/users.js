import { Router } from "express";
import {
  addFavoriteMovie,
  getFavoriteMovies,
  getUsers,
  getCurrentUser,
  getUserById,
  patchUser,
  removeFavoriteMovie,
} from "../controllers/users.js";
import { celebrate, Joi } from "celebrate";

const validateUpdateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
  }),
});

const validateUserId = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
});

const validateFavoriteMovie = celebrate({
  body: Joi.object().keys({
    id: Joi.number().integer().positive().optional(),
    tmdbId: Joi.number().integer().positive().optional(),
    title: Joi.string().required().min(1).max(200),
    year: Joi.string().allow("").max(10).optional(),
    rating: Joi.string().allow("").max(20).optional(),
    certification: Joi.string().allow("").max(20).optional(),
    contentRating: Joi.string().allow("").max(20).optional(),
    overview: Joi.string().allow("").max(3000).optional(),
    poster: Joi.string().allow("").uri().optional(),
  }).or("id", "tmdbId"),
});

const validateFavoriteMovieId = celebrate({
  params: Joi.object().keys({
    movieId: Joi.number().integer().positive().required(),
  }),
});

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/me", getCurrentUser);
userRouter.get("/me/favorites", getFavoriteMovies);
userRouter.post("/me/favorites", validateFavoriteMovie, addFavoriteMovie);
userRouter.delete(
  "/me/favorites/:movieId",
  validateFavoriteMovieId,
  removeFavoriteMovie,
);
userRouter.get("/:userId", validateUserId, getUserById);
userRouter.patch("/me", validateUpdateProfile, patchUser);

export default userRouter;
