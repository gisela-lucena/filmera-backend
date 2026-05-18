import Room from "../models/room.js";
import Swipe from "../models/swipe.js";

export const createRoom = async (req, res, next) => {
  try {
    const { code, movies = [], filters } = req.body;
    const host = req.user._id;
    const roomCode =
      code || Math.random().toString(36).slice(2, 8).toUpperCase();

    const room = await Room.create({
      code: roomCode,
      host,
      participants: [host],
      movies,
      filters,
      status: "waiting",
      matchedMovie: null,
    });
    res.status(201).json({
      message: "Sala criada com sucesso",
      room: {
        code: room.code,
        _id: room._id,
        participants: room.participants,
        movies: room.movies,
        status: room.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({ code: roomCode });
    if (!room) {
      return res.status(404).json({ message: "Sala não encontrada" });
    }

    const alreadyInRoom = room.participants.some(
      (participant) => participant.toString() === userId.toString(),
    );

    if (!alreadyInRoom) {
      room.participants.push(userId);
      await room.save();
    }

    return res.json({
      message: "Entrou na sala com sucesso",
      room: {
        _id: room._id,
        code: room.code,
        participants: room.participants,
      },
    });
  } catch (err) {
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

    const blockedMovieIds = new Set([
      ...moviesSwipedByCurrentUser,
      ...dislikedMovies,
    ]);

    const availableMovies = room.movies.filter(
      (movie) => !blockedMovieIds.has(movie.tmdbId.toString()),
    );

    res.send({ movies: availableMovies });
  } catch (err) {
    next(err);
  }
}

export const addMovieToRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { movie } = req.body;

    const room = await Room.findOne({ code: roomCode });

    if (!room) {
      return res.status(404).json({ message: "Sala não encontrada" });
    }

    const alreadyExists = room.movies.some(
      (item) => item.tmdbId.toString() === movie.id?.toString(),
    );

    if (!alreadyExists) {
      room.movies.push({
        tmdbId: movie.id,
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        overview: movie.overview,
        poster: movie.poster,
      });

      await room.save();
    }

    return res.status(201).json({
      message: "Filme adicionado à sala",
      room,
    });
  } catch (err) {
    next(err);
  }
};
