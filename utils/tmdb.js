const TMDB_DISCOVER_URL = "https://api.themoviedb.org/3/discover/movie";
const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_PAGE_SIZE = 20;

const formatGenres = (genres) => {
  if (Array.isArray(genres)) {
    return genres.filter(Boolean).join(",");
  }

  return genres;
};

const formatMovie = (movie) => ({
  tmdbId: movie.id,
  title: movie.title,
  year: movie.release_date?.slice(0, 4) || "",
  rating: String(movie.vote_average),
  overview: movie.overview,
  poster: movie.poster_path ? `${TMDB_POSTER_BASE_URL}${movie.poster_path}` : "",
});

export const fetchMoviesFromTmdb = async ({
  genres,
  year,
  sort = "popularity.desc",
  limit = TMDB_PAGE_SIZE,
} = {}) => {
  const pageCount = Math.ceil(limit / TMDB_PAGE_SIZE);
  const movieById = new Map();

  for (let page = 1; page <= pageCount; page += 1) {
    const params = new URLSearchParams({
      sort_by: sort,
      include_adult: "false",
      language: "en-US",
      page: String(page),
    });

    const formattedGenres = formatGenres(genres);

    if (formattedGenres) {
      params.append("with_genres", formattedGenres);
    }

    if (year && year !== "any") {
      params.append("primary_release_year", year);
    }

    const response = await fetch(`${TMDB_DISCOVER_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error("Erro ao buscar filmes na TMDB");
      error.statusCode = response.status;
      error.tmdbError = data;
      throw error;
    }

    data.results.forEach((movie) => {
      if (!movieById.has(movie.id)) {
        movieById.set(movie.id, formatMovie(movie));
      }
    });

    if (!data.results.length || movieById.size >= limit) {
      break;
    }
  }

  return Array.from(movieById.values()).slice(0, limit);
};
