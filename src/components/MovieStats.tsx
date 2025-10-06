import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Rating } from '@mui/material';
import { Star, AccessTime, AttachMoney } from '@mui/icons-material';

interface MovieStatsProps {
  movie: {
    runtime: number;
    vote_average: number;
    vote_count: number;
    release_date: string;
    popularity: number;
    budget: number;
    revenue: number;
    imdbId: string;
  };
}

export default function MovieStats({ movie }: MovieStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      {/* Key Stats */}
      <Box>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Star sx={{ mr: 1, color: '#ffb400' }} />
              Movie Statistics
            </Typography>
            <List dense>
              <ListItem>
                <AccessTime sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="Runtime"
                  secondary={movie.runtime ? formatRuntime(movie.runtime) : 'Not available'}
                />
              </ListItem>
              <ListItem>
                <Star sx={{ mr: 2, color: '#ffb400' }} />
                <ListItemText
                  primary="Rating"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating
                        value={movie.vote_average ? movie.vote_average / 2 : 0}
                        readOnly
                        precision={0.1}
                        size="small"
                      />
                      <Typography variant="body2">
                        {movie.vote_average?.toFixed(1) || 'N/A'} ({movie.vote_count || 0} votes)
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <Typography variant="body2" color="text.secondary">
                  Release Date: {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body2" color="text.secondary">
                  Popularity: {movie.popularity?.toFixed(1) || 'N/A'}
                </Typography>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Financial Info */}
      <Box>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
              Box Office
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Budget"
                  secondary={movie.budget ? formatCurrency(movie.budget) : 'Not disclosed'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Revenue"
                  secondary={movie.revenue ? formatCurrency(movie.revenue) : 'Not available'}
                />
              </ListItem>
              {movie.budget && movie.revenue && (
                <ListItem>
                  <ListItemText
                    primary="Profit"
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: movie.revenue > movie.budget ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}
                      >
                        {formatCurrency(movie.revenue - movie.budget)}
                      </Typography>
                    }
                  />
                </ListItem>
              )}
              {movie.imdbId && (
                <ListItem>
                  <ListItemText
                    primary="IMDB ID"
                    secondary={movie.imdbId}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}