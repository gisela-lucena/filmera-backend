import mongoose from "mongoose";

const swipeSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    movieId: {
      type: Number,
      required: true,
    },

    liked: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

swipeSchema.index({ room: 1, user: 1, movieId: 1 }, { unique: true });

export default mongoose.model("Swipe", swipeSchema);
