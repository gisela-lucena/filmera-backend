import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
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
    overview: String,
    poster: String,
  },
  { _id: false },
);

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 8,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    movies: {
      type: [movieSchema],
      default: [],
    },

    matchedMovie: {
      type: movieSchema,
      default: null,
    },

    status: {
      type: String,
      enum: ["waiting", "config", "swiping", "matched", "closed"],
      default: "waiting",
    },

    filters: {
      genres: {
        type: [Number],
        default: [],
      },
      year: {
        type: String,
        default: "any",
      },
      sort: {
        type: String,
        default: "popularity.desc",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Room", roomSchema);
