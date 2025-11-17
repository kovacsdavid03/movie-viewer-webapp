import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Recommend as RecommendIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import MovieCard from '../components/MovieCard';

interface Movie {
  id: number;
  imdbId: string;
  original_title: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  popularity: number;
  budget: number;
  revenue: number;
  tagline: string;
  adult: string;
}

interface RecommendationResponse {
  user_id: number;
  favorite_movies_count: number;
  recommended_movie_ids: number[];
}

const Recommended: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<number | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [cachedUserId, setCachedUserId] = useState<number | null>(null);
  const [usingCache, setUsingCache] = useState<boolean>(false);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isCacheValid = () => {
    return (
      lastFetchTime && 
      cachedUserId === userId && 
      Date.now() - lastFetchTime < CACHE_DURATION &&
      movies.length > 0
    );
  };

  const fetchRecommendations = async (forceRefresh: boolean = false) => {
    // Check if we can use cached data
    if (!forceRefresh && isCacheValid()) {
      console.log('Using cached recommendations');
      setUsingCache(true);
      setTimeout(() => setUsingCache(false), 2000); // Show cache message for 2 seconds
      return;
    }

    setUsingCache(false);
    if (!userId) {
      setError('User not logged in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching recommendations for user ${userId}`);
      
      // Step 1: Get recommended movie IDs from the recommendation service
      console.log('Making request to:', `http://localhost:8000/recommend/${userId}`);
      
      let recommendationResponse;
      try {
        // Try direct API call first
        recommendationResponse = await fetch(`http://localhost:8000/recommend/${userId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
      } catch (corsError) {
        console.log('CORS error, trying proxy route...', corsError);
        // Fallback to proxy route if CORS fails
        recommendationResponse = await fetch(`/api/recommendations/${userId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
      }

      if (!recommendationResponse.ok) {
        throw new Error(`HTTP ${recommendationResponse.status}: ${recommendationResponse.statusText}`);
      }

      const recommendationData: RecommendationResponse = await recommendationResponse.json();
      console.log('Recommendations received:', recommendationData);

      const movieIds = recommendationData.recommended_movie_ids || [];
      
      if (movieIds.length === 0) {
        setMovies([]);
        return;
      }

      // Step 2: Fetch full movie details for each recommended ID
      const moviePromises = movieIds.map(async (movieId: number) => {
        try {
          const movieResponse = await fetch(`/api/movies/${movieId}`);
          if (movieResponse.ok) {
            return await movieResponse.json();
          } else {
            console.warn(`Failed to fetch movie ${movieId}`);
            return null;
          }
        } catch (err) {
          console.warn(`Error fetching movie ${movieId}:`, err);
          return null;
        }
      });

      const movieResults = await Promise.all(moviePromises);
      const validMovies = movieResults.filter(movie => movie !== null);
      
      console.log('Fetched movie details:', validMovies);
      setMovies(validMovies);
      
      // Update cache information
      const now = Date.now();
      setLastFetchTime(now);
      setCachedUserId(userId);
      
      // Save to localStorage for persistence across page refreshes
      if (userId) {
        const cacheKey = `recommendations_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify(validMovies));
        localStorage.setItem(`${cacheKey}_time`, now.toString());
      }

    } catch (err) {
      console.error('Error fetching recommendations:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        type: typeof err,
        name: err instanceof Error ? err.name : 'Unknown',
      });
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError(`Cannot connect to recommendation service at http://localhost:8000. Error: ${errorMessage}. Check if the API is running and CORS is configured.`);
      } else {
        setError(`Failed to fetch recommendations: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (movieId: number, isFavorited: boolean) => {
    // MovieCard handles the API calls, we just update local state
    console.log(`Favorite changed for movie ${movieId}: ${isFavorited}`);
    
    if (isFavorited) {
      setFavorites(prev => {
        const newFavorites = new Set(prev).add(movieId);
        console.log('Updated favorites (added):', Array.from(newFavorites));
        return newFavorites;
      });
    } else {
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(movieId);
        console.log('Updated favorites (removed):', Array.from(newFavorites));
        return newFavorites;
      });
    }
  };

  const fetchUserFavorites = async () => {
    if (!userId) return;
    
    try {
      console.log(`Fetching favorites for user ${userId}`);
      const response = await fetch(`/api/favorites/${userId}`);
      if (response.ok) {
        const responseData = await response.json();
        console.log('Fetched favorites response:', responseData);
        const favoriteMovies = responseData.favorites || [];
        console.log('Favorite movies array:', favoriteMovies);
        const favoriteIds = new Set<number>(favoriteMovies.map((movie: Movie) => Number(movie.id)));
        console.log('Initial favorites set:', Array.from(favoriteIds));
        setFavorites(favoriteIds);
      }
    } catch (err) {
      console.error('Error fetching user favorites:', err);
    }
  };

  // Get userId and cached data from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
      
      // Try to load cached recommendations
      const cacheKey = `recommendations_${storedUserId}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      
      if (cachedData && cacheTime) {
        const parsedTime = parseInt(cacheTime, 10);
        if (Date.now() - parsedTime < CACHE_DURATION) {
          try {
            const parsedMovies = JSON.parse(cachedData);
            setMovies(parsedMovies);
            setLastFetchTime(parsedTime);
            setCachedUserId(parseInt(storedUserId, 10));
            console.log('Loaded cached recommendations from localStorage');
          } catch (err) {
            console.error('Failed to parse cached recommendations:', err);
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_time`);
          }
        } else {
          // Cache expired, clean it up
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_time`);
        }
      }
    } else {
      setError('User not logged in. Please log in to see recommendations.');
    }
  }, []);

  // Fetch recommendations and favorites when userId is available
  useEffect(() => {
    if (userId) {
      // If userId changed, force refresh (don't use cache)
      const forceRefresh = cachedUserId !== userId;
      fetchRecommendations(forceRefresh);
      fetchUserFavorites();
    }
  }, [userId]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <RecommendIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Recommended Movies
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchRecommendations(true)}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Personalized movie recommendations based on your preferences and viewing history.
      </Typography>

      {usingCache && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Showing cached recommendations to improve performance. Click "Refresh" to get new recommendations.
        </Alert>
      )}

      {lastFetchTime && !loading && movies.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: {new Date(lastFetchTime).toLocaleString()}
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && movies.length === 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No recommendations available at the moment. Try refreshing or check back later.
        </Alert>
      )}

      {movies.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 4,
            justifyContent: 'center',
            maxWidth: '1200px',
            mx: 'auto',
          }}
        >
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id}
              movie={movie} 
              isFavorited={favorites.has(movie.id)}
              userId={userId || 0}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Recommended;