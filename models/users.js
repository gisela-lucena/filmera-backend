import mongoose from "mongoose";
import validator from "validator";

const favoriteMovieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    year: String,
    rating: String,
    certification: String,
    overview: String,
    poster: String,
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Email invalido",
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  favorites: {
    type: [favoriteMovieSchema],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

export default User;
