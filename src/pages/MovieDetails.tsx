import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Movie as MovieIcon
} from '@mui/icons-material';
import MovieStats from '../components/MovieStats';
import GenresSection from '../components/GenresSection';
import CastSection from '../components/CastSection';
import CrewSection from '../components/CrewSection';
import ProductionInfo from '../components/ProductionInfo';
import KeywordsSection from '../components/KeywordsSection';

interface MovieCast {
  character: string;
  name: string;
  gender: number;
}

interface MovieCrew {
  name: string;
  job: string;
  department: string;
  gender: number;
}

interface DetailedMovie {
  id: number;
  original_title: string;
  tagline: string;
  release_date: string;
  runtime: number;
  budget: number;
  revenue: number;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: string;
  imdbId: string;
  cast: MovieCast[];
  crew: MovieCrew[];
  genres: string[];
  keywords: string[];
  production_companies: string[];
  production_countries: string[];
  spoken_languages: string[];
}

export default function MovieDetails() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<DetailedMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    }
  }, []);

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/movies/${movieId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      const data = await response.json();
      setMovie(data);
    } catch (err) {
      setError('Failed to load movie details. Please try again.');
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  const checkIfFavorited = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/favorites/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const favoriteIds = data.favorites.map((fav: any) => fav.id);
        setIsFavorited(favoriteIds.includes(movie?.id));
      }
    } catch (err) {
      console.error('Error checking favorites:', err);
    }
  }, [userId, movie]);

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId, fetchMovieDetails]);

  useEffect(() => {
    if (userId && movie) {
      checkIfFavorited();
    }
  }, [userId, movie, checkIfFavorited]);

  const toggleFavorite = async () => {
    if (!userId || !movie) return;

    try {
      if (isFavorited) {
        const response = await fetch(`/api/favorites/${userId}/${movie.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setIsFavorited(false);
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, movieId: movie.id }),
        });
        if (response.ok) {
          setIsFavorited(true);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading movie details...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Movie not found'}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Go Back
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button and favorite */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2, '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' } }}
        >
          <ArrowBack />
        </IconButton>
        <MovieIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {movie.original_title}
        </Typography>
        {userId && (
          <Tooltip title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
            <IconButton
              onClick={toggleFavorite}
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: isFavorited ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                }
              }}
            >
              {isFavorited ? (
                <Favorite sx={{ fontSize: '2rem', color: '#f44336' }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: '2rem', color: '#757575' }} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Main movie info */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        {movie.tagline && (
          <Typography
            variant="h6"
            sx={{
              fontStyle: 'italic',
              color: 'text.secondary',
              mb: 3,
              textAlign: 'center',
              fontSize: '1.2rem'
            }}
          >
            "{movie.tagline}"
          </Typography>
        )}

        <MovieStats 
          movie={{
            runtime: movie.runtime,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            release_date: movie.release_date,
            popularity: movie.popularity,
            budget: movie.budget,
            revenue: movie.revenue,
            imdbId: movie.imdbId
          }}
        />
      </Paper>

      {/* Genres */}
      <GenresSection genres={movie.genres} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* Cast */}
        <CastSection cast={movie.cast} />

        {/* Key Crew */}
        <CrewSection crew={movie.crew} />

        {/* Production Info */}
        <ProductionInfo 
          production_companies={movie.production_companies}
          production_countries={movie.production_countries}
          spoken_languages={movie.spoken_languages}
        />

        {/* Keywords */}
        <KeywordsSection keywords={movie.keywords} />
      </Box>
    </Container>
  );
}