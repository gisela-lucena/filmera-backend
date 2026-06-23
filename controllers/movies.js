import Room from "../models/room.js";
import Swipe from "../models/swipe.js";
import {
  fetchMovieCreditsFromTmdb,
  fetchMovieWatchProvidersFromTmdb,
  fetchMoviesFromTmdb,
} from "../utils/tmdb.js";

export const getMovies = async (req, res, next) => {
  try {
    const { genres, year, sort = "popularity.desc", providers } = req.query;

    const movies = await fetchMoviesFromTmdb({ genres, year, sort, providers });

    res.json({ movies });
  } catch (err) {
    if (err.tmdbError) {
      return res.status(err.statusCode).json({
        message: err.message,
        tmdbError: err.tmdbError,
      });
    }

    next(err);
  }
};

export const getMovieCredits = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const credits = await fetchMovieCreditsFromTmdb(movieId);

    res.json({ credits });
  } catch (err) {
    if (err.tmdbError) {
      return res.status(err.statusCode).json({
        message: err.message,
        tmdbError: err.tmdbError,
      });
    }

    next(err);
  }
};

export const getMovieWatchProviders = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { region } = req.query;
    const providers = await fetchMovieWatchProvidersFromTmdb(movieId, region);

    res.json({ providers });
  } catch (err) {
    if (err.tmdbError) {
      return res.status(err.statusCode).json({
        message: err.message,
        tmdbError: err.tmdbError,
      });
    }

    next(err);
  }
};

export async function getAvailableMovies(req, res, next) {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({ code: roomCode }).orFail();

    const swipes = await Swipe.find({ room: roomCode });

    const moviesSwipedByCurrentUser = swipes
      .filter((swipe) => swipe.user.toString() === userId.toString())
      .map((swipe) => swipe.movieId.toString());

    const dislikedMovies = swipes
      .filter((swipe) => swipe.liked === false)
      .map((swipe) => swipe.movieId.toString());

    const unavailableMovieIds = new Set([
      ...moviesSwipedByCurrentUser,
      ...dislikedMovies,
    ]);

    const availableMovies = room.movies.filter(
      (movie) => !unavailableMovieIds.has(movie.tmdbId.toString()),
    );

    res.send({ movies: availableMovies });
  } catch (err) {
    next(err);
  }
}
