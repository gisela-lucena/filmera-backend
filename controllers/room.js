import Room from "../models/room.js";
import Swipe from "../models/swipe.js";

export async function getAvailableMovies(req, res, next) {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId).orFail();

    const dislikedSwipes = await Swipe.find({
      room: roomId,
      liked: false,
    });

    const blockedMovieIds = dislikedSwipes.map((swipe) => swipe.movieId);

    const availableMovies = room.movies.filter(
      (movie) => !blockedMovieIds.includes(movie.tmdbId),
    );

    res.send(availableMovies);
  } catch (err) {
    next(err);
  }
}
