import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, Pagination, CircularProgress, IconButton, TextField, InputAdornment } from '@mui/material';
import { FilterList as FilterIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import MovieCard, { Movie } from '../components/MovieCard';
import FilterSidebar, { FilterOptions } from '../components/FilterSidebar';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    genres: [],
    minYear: 1900,
    maxYear: new Date().getFullYear(),
    minRating: 0,
    maxRating: 10,
    minPopularity: 0,
    maxPopularity: 1000,
  });

  const limit = 18;

  // Fetch available genres
  const fetchGenres = useCallback(async () => {
    try {
      const response = await fetch('/api/genres');
      if (response.ok) {
        const genres = await response.json();
        setAvailableGenres(genres);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  }, []);

  // Fetch movies with filters
  const fetchMovies = useCallback(async (currentPage: number, currentFilters: FilterOptions, searchTerm: string = '') => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Add search parameter
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      // Add filters to query parameters
      if (currentFilters.genres.length > 0) {
        params.append('genres', currentFilters.genres.join(','));
      }
      if (currentFilters.minYear > 1900) {
        params.append('minYear', currentFilters.minYear.toString());
      }
      if (currentFilters.maxYear < new Date().getFullYear()) {
        params.append('maxYear', currentFilters.maxYear.toString());
      }
      if (currentFilters.minRating > 0) {
        params.append('minRating', currentFilters.minRating.toString());
      }
      if (currentFilters.maxRating < 10) {
        params.append('maxRating', currentFilters.maxRating.toString());
      }
      if (currentFilters.minPopularity > 0) {
        params.append('minPopularity', currentFilters.minPopularity.toString());
      }
      if (currentFilters.maxPopularity < 1000) {
        params.append('maxPopularity', currentFilters.maxPopularity.toString());
      }

      const response = await fetch(`/api/movies?${params}`);
      if (!response.ok) throw new Error('Failed to fetch movies');
      
      const data = await response.json();
      setMovies(data.movies);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/favorites/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const favoriteIds: Set<number> = new Set(data.favorites.map((movie: Movie) => movie.id as number));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [userId]);

  // Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchGenres();
    fetchMovies(page, filters, searchQuery);
  }, [fetchGenres, fetchMovies, page, filters, searchQuery]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteChange = (movieId: number, isFavorited: boolean) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFavorited) {
        newFavorites.add(movieId);
      } else {
        newFavorites.delete(movieId);
      }
      return newFavorites;
    });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  return (
    <Box>
      <FilterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onFiltersChange={handleFiltersChange}
        availableGenres={availableGenres}
      />
      
      <Box
        component="main"
        sx={{
          width: '100%',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header with Filter Button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              p: 3,
              color: 'white',
            }}
          >
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Discover Movies
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Explore a wide range of movies. Click the heart to add to your favorites!
              </Typography>
            </Box>
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <FilterIcon />
            </IconButton>
          </Box>

          {/* Search Bar */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <TextField
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search movies by title..."
              variant="outlined"
              sx={{
                width: { xs: '100%', sm: '500px' },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <ClearIcon sx={{ color: '#666' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Loading movies...
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              {/* Movies Grid */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                  justifyContent: 'center',
                  mb: 4,
                }}
              >
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isFavorited={favorites.has(movie.id)}
                    userId={userId}
                    onFavoriteChange={handleFavoriteChange}
                  />
                ))}
              </Box>

              {/* No Results */}
              {movies.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No movies found matching your filters
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your filter criteria
                  </Typography>
                </Box>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}