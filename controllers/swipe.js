import Swipe from "../models/swipe.js";
import Room from "../models/room.js";

export async function createSwipe(req, res, next) {
  try {
    const { roomCode, movieId, liked } = req.body;
    const userId = req.user._id;

    const swipe = await Swipe.findOneAndUpdate(
      { room: roomCode, user: userId, movieId },
      { room: roomCode, user: userId, movieId, liked },
      { new: true, upsert: true },
    );

    const room = await Room.findOne({ code: roomCode });
    if (!room) {
      return res.status(404).send({ message: "Room not found" });
    }

    let matchedMovie = null;

    if (liked) {
      const likes = await Swipe.find({
        room: roomCode,
        movieId,
        liked: true,
      });

      const isMatch = room.participants.every((participantId) =>
        likes.some(
          (swipeItem) => swipeItem.user.toString() === participantId.toString(),
        ),
      );

      if (isMatch) {
        matchedMovie = room.movies.find(
          (movie) => movie.tmdbId.toString() === movieId.toString(),
        );
        if (matchedMovie) {
          room.matchedMovie = matchedMovie;
          room.status = "matched";
          await room.save();
        }
      }
    }

    res.send({
      swipe,
      match: matchedMovie,
    });
  } catch (err) {
    next(err);
  }
}
