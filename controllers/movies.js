export const getMovies = async (req, res, next) => {
  try {
    const { genres, year, sort = "popularity.desc" } = req.query;

    const params = new URLSearchParams({
      sort_by: sort,
      include_adult: "false",
      language: "en-US",
      page: "1",
    });

    if (genres) {
      params.append("with_genres", genres);
    }

    if (year && year !== "any") {
      params.append("primary_release_year", year);
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
          accept: "application/json",
        },
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        message: "Erro ao buscar filmes na TMDB",
        tmdbError: errorData,
      });
    }

    const data = await response.json();

    const movies = data.results.map((movie) => ({
      tmdbId: movie.id,
      title: movie.title,
      year: movie.release_date?.slice(0, 4) || "",
      rating: String(movie.vote_average),
      overview: movie.overview,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "",
    }));

    res.json({ movies });
  } catch (err) {
    next(err);
  }
};
