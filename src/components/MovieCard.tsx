import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Chip, Rating, CardActionArea } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

export interface Movie {
  id: number;
  original_title: string;
  release_date: string;
  popularity: number;
  vote_average: number;
}

interface MovieCardProps {
  movie: Movie;
  isFavorited: boolean;
  userId: number | null;
  onFavoriteChange: (movieId: number, isFavorited: boolean) => void;
}

export default function MovieCard({ movie, isFavorited, userId, onFavoriteChange }: MovieCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when clicking favorite button
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const res = await fetch(`/api/favorites/${userId}/${movie.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          onFavoriteChange(movie.id, false);
        }
      } else {
        // Add to favorites
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, movieId: movie.id }),
        });
        if (res.ok) {
          onFavoriteChange(movie.id, true);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: 320, flexShrink: 0, position: 'relative' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
            border: '1px solid #e3f2fd',
            cursor: 'pointer',
          },
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <CardActionArea onClick={handleCardClick} sx={{ height: '100%' }}>
          <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  flex: 1,
                  mr: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  lineHeight: 1.3,
                  color: '#2c3e50',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {movie.original_title}
              </Typography>
              <Tooltip title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
                <IconButton
                  onClick={handleToggleFavorite}
                  disabled={isLoading || !userId}
                  sx={{
                    p: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: isFavorited ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    }
                  }}
                >
                  {isFavorited ? (
                    <Favorite sx={{ fontSize: '1.8rem', color: '#f44336' }} />
                  ) : (
                    <FavoriteBorder sx={{ fontSize: '1.8rem', color: '#757575' }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#666', mr: 1 }}>
                  Release:
                </Typography>
                <Chip
                  label={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : 'N/A'}
                  size="small"
                  sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 500,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#666', mr: 1 }}>
                  Rating:
                </Typography>
                <Rating
                  value={movie.vote_average ? movie.vote_average / 2 : 0}
                  readOnly
                  precision={0.1}
                  size="small"
                  sx={{ color: '#ffb400' }}
                />
                <Typography variant="body2" sx={{ color: '#666', ml: 1 }}>
                  ({movie.vote_average?.toFixed(1) || 'N/A'}/10)
                </Typography>
              </Box>
            </Box>

            {isLoading && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
              }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Updating...
                </Typography>
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}