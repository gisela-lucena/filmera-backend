const TMDB_DISCOVER_URL = "https://api.themoviedb.org/3/discover/movie";
const TMDB_MOVIE_URL = "https://api.themoviedb.org/3/movie";
const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_PROVIDER_LOGO_BASE_URL = "https://image.tmdb.org/t/p/w92";
const TMDB_PAGE_SIZE = 20;
const DEFAULT_WATCH_REGION = process.env.TMDB_WATCH_REGION || "US";
const DEFAULT_WATCH_MONETIZATION_TYPES = "flatrate|free|ads";

const getToday = () => new Date().toISOString().slice(0, 10);

const formatGenres = (genres) => {
  if (Array.isArray(genres)) {
    return genres.filter(Boolean).join(",");
  }

  return genres;
};

const formatProviders = (providers) => {
  if (Array.isArray(providers)) {
    return providers.filter(Boolean).join("|");
  }

  return String(providers || "")
    .split(",")
    .filter(Boolean)
    .join("|");
};

const formatRatingPercent = (voteAverage) => {
  const rating = Number(voteAverage);

  if (!Number.isFinite(rating)) {
    return "N/A";
  }

  return `${Math.round(Math.max(0, Math.min(rating, 10)) * 10)}%`;
};

const formatMovie = (movie) => ({
  tmdbId: movie.id,
  title: movie.title,
  year: movie.release_date?.slice(0, 4) || "",
  rating: formatRatingPercent(movie.vote_average),
  overview: movie.overview,
  poster: movie.poster_path ? `${TMDB_POSTER_BASE_URL}${movie.poster_path}` : "",
});

export const fetchMoviesFromTmdb = async ({
  genres,
  year,
  sort = "popularity.desc",
  limit = TMDB_PAGE_SIZE,
  streamingOnly = true,
  watchRegion = DEFAULT_WATCH_REGION,
  watchMonetizationTypes = DEFAULT_WATCH_MONETIZATION_TYPES,
  providers,
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
    const formattedProviders = formatProviders(providers);

    if (formattedGenres) {
      params.append("with_genres", formattedGenres);
    }

    if (year && year !== "any") {
      params.append("primary_release_year", year);
    }

    if (streamingOnly) {
      params.append("release_date.lte", getToday());
      params.append("watch_region", watchRegion);
      params.append(
        "with_watch_monetization_types",
        formattedProviders ? "flatrate" : watchMonetizationTypes,
      );
    }

    if (formattedProviders) {
      params.append("watch_region", watchRegion);
      params.append("with_watch_providers", formattedProviders);
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

const requestTmdb = async (url) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error("Erro ao buscar dados na TMDB");
    error.statusCode = response.status;
    error.tmdbError = data;
    throw error;
  }

  return data;
};

export const fetchMovieCreditsFromTmdb = async (movieId) => {
  const data = await requestTmdb(`${TMDB_MOVIE_URL}/${movieId}/credits`);
  const director = data.crew?.find((member) => member.job === "Director")?.name;
  const cast = (data.cast || [])
    .slice(0, 5)
    .map((member) => member.name)
    .filter(Boolean);

  return {
    director: director || "Unknown",
    cast,
  };
};

export const fetchMovieWatchProvidersFromTmdb = async (
  movieId,
  watchRegion = DEFAULT_WATCH_REGION,
) => {
  const data = await requestTmdb(`${TMDB_MOVIE_URL}/${movieId}/watch/providers`);
  const regionData = data.results?.[watchRegion] || {};
  const providersById = new Map();

  ["flatrate", "free", "ads", "rent", "buy"].forEach((category) => {
    (regionData[category] || []).forEach((provider) => {
      if (providersById.has(provider.provider_id)) return;

      providersById.set(provider.provider_id, {
        id: provider.provider_id,
        name: provider.provider_name,
        logo: provider.logo_path
          ? `${TMDB_PROVIDER_LOGO_BASE_URL}${provider.logo_path}`
          : "",
        link: regionData.link || "",
        displayPriority: provider.display_priority ?? 999,
      });
    });
  });

  return Array.from(providersById.values())
    .sort((a, b) => a.displayPriority - b.displayPriority)
    .slice(0, 5);
};
