import Room from "../models/room.js";
import Swipe from "../models/swipe.js";
import { fetchMoviesFromTmdb } from "../utils/tmdb.js";
import { broadcastRoomEvent } from "../utils/websocket.js";

const ROOM_MOVIE_LIMIT = 100;

const normalizeRoomFilters = (filters) => {
  if (!filters) {
    return filters;
  }

  const genres = Array.isArray(filters.genres)
    ? filters.genres
    : String(filters.genres || "")
        .split(",")
        .filter(Boolean)
        .map(Number)
        .filter(Number.isFinite);

  return {
    genres,
    year: filters.year || "any",
    sort: filters.sort || "popularity.desc",
  };
};

export const createRoom = async (req, res, next) => {
  try {
    const { code, movies = [], filters } = req.body;
    const roomFilters = normalizeRoomFilters(filters);
    const host = req.user._id;
    const roomCode =
      code || Math.random().toString(36).slice(2, 8).toUpperCase();
    const roomMovies = roomFilters
      ? await fetchMoviesFromTmdb({ ...roomFilters, limit: ROOM_MOVIE_LIMIT })
      : movies;

    const room = await Room.create({
      code: roomCode,
      host,
      participants: [host],
      movies: roomMovies,
      filters: roomFilters,
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
    if (err.tmdbError) {
      return res.status(err.statusCode).json({
        message: err.message,
        tmdbError: err.tmdbError,
      });
    }

    next(err);
  }
};

export const updateRoomFilters = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { filters } = req.body;
    const roomFilters = normalizeRoomFilters(filters);

    const room = await Room.findOne({ code: roomCode });

    if (!room) {
      return res.status(404).json({ message: "Sala não encontrada" });
    }

    const roomMovies = await fetchMoviesFromTmdb({
      ...roomFilters,
      limit: ROOM_MOVIE_LIMIT,
    });

    room.filters = roomFilters;
    room.movies = roomMovies;
    room.matchedMovie = null;
    room.status = "swiping";

    await Swipe.deleteMany({ room: roomCode });
    await room.save();
    broadcastRoomEvent(room.code, "room.updated", room);

    return res.json({
      message: "Filtros atualizados com sucesso",
      room: {
        code: room.code,
        _id: room._id,
        participants: room.participants,
        movies: room.movies,
        filters: room.filters,
        status: room.status,
      },
    });
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
      broadcastRoomEvent(room.code, "room.updated", room);
    }

    return res.json({
      message: "Entrou na sala com sucesso",
      room: {
        _id: room._id,
        code: room.code,
        participants: room.participants,
        movies: room.movies,
        status: room.status,
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
      broadcastRoomEvent(room.code, "room.updated", room);
    }

    return res.status(201).json({
      message: "Filme adicionado à sala",
      room,
    });
  } catch (err) {
    next(err);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ code: roomCode });

    if (!room) {
      return res.status(404).json({ message: "Sala não encontrada" });
    }

    return res.json({
      room: {
        _id: room._id,
        code: room.code,
        participants: room.participants,
        movies: room.movies,
        status: room.status,
        matchedMovie: room.matchedMovie,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const clearMatch = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOne({ code: roomCode });

    if (!room) {
      return res.status(404).json({ message: "Sala não encontrada" });
    }

    room.matchedMovie = null;
    room.status = "swiping";

    await room.save();
    broadcastRoomEvent(room.code, "match.cleared", room);

    return res.json({
      message: "Match removido",
      room,
    });
  } catch (err) {
    next(err);
  }
};
