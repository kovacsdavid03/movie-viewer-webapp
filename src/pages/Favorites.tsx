import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, Pagination, CircularProgress, Paper } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MovieCard, { Movie } from '../components/MovieCard';

export default function Favorites() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  const limit = 21;

  const fetchFavorites = useCallback(async (pageNum: number) => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/favorites/${userId}?page=${pageNum}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const data = await res.json();
      setFavorites(data.favorites);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/login');
      return;
    }
    setUserId(parseInt(storedUserId));
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchFavorites(page);
    }
  }, [userId, page, fetchFavorites]);

  const handleFavoriteChange = (movieId: number, isFavorited: boolean) => {
    if (!isFavorited) {
      // Remove from local state when unfavorited
      setFavorites(prev => prev.filter(movie => movie.id !== movieId));
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FavoriteIcon sx={{ mr: 2, color: '#f44336', fontSize: '2rem' }} />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #f44336 30%, #ff9800 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            My Favorite Movies
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Your personal collection of beloved movies.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading your favorites...
            </Typography>
          </Box>
        </Box>
      ) : favorites.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
            border: '2px dashed #e91e63',
          }}
        >
          <FavoriteIcon sx={{ fontSize: '4rem', color: '#e91e63', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" sx={{ mb: 1, color: '#c2185b' }}>
            No favorites yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start exploring movies and click the heart icon to add them to your favorites!
          </Typography>
        </Paper>
      ) : (
        <>
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
            {favorites.map(movie => (
              <MovieCard
                movie={movie}
                key={movie.id}
                isFavorited={true}
                userId={userId}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="secondary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }
              }}
            />
          </Box>
        </>
      )}
    </Container>
  );
}