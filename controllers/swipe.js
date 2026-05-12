import Swipe from "../models/swipe.js";
import Room from "../models/room.js";

export async function createSwipe(req, res, next) {
  try {
    const { roomId, movieId, liked } = req.body;
    const userId = req.user._id;

    const swipe = await Swipe.findOneAndUpdate(
      { room: roomId, user: userId, movieId },
      { room: roomId, user: userId, movieId, liked },
      { new: true, upsert: true },
    );

    const room = await Room.findById(roomId).orFail();

    let matchedMovie = null;

    if (liked) {
      const likes = await Swipe.find({
        room: roomId,
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
      matched: Boolean(matchedMovie),
      matchedMovie,
    });
  } catch (err) {
    next(err);
  }
}
