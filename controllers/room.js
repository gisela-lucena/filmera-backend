import Room from "../models/room.js";
import Swipe from "../models/swipe.js";

export const createRoom = async (req, res, next) => {
  try {
    const { code, movies, filters } = req.body;
    const host = req.user._id;

    const room = await Room.create({
      code,
      host,
      participants: [host],
      movies,
      filters,
      status: "waiting",
      matchedMovie: null,
    });
    res.status(201).json({
      message: "Sala criada com sucesso",
      room: { code: room.code, _id: room._id },
    });
  } catch (err) {
    next(err);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId).orFail();

    const alreadyInRoom = room.participants.some(
      (participant) => participant.toString() === userId.toString(),
    );

    if (alreadyInRoom) {
      return res.status(400).json({
        message: "Usuário já está na sala",
      });
    }
    room.participants.push(userId);
    await room.save();

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
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId).orFail();

    const swipes = await Swipe.find({ room: roomId });

    const moviesSwipedByCurrentUser = swipes.filter((swipe) =>
      swipe.user.toString() === userId.toString())
      .map((swipe) => swipe.movieId.toString());

    const dislikedMovies = swipes.filter((swipe) =>
      swipe.liked === false)
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
