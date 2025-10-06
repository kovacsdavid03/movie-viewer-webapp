import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';

interface GenresSectionProps {
  genres: string[];
}

export default function GenresSection({ genres }: GenresSectionProps) {
  if (genres.length === 0) return null;

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Genres
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {genres.map((genre, index) => (
          <Chip
            key={index}
            label={genre}
            variant="outlined"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              fontWeight: 500,
              '&:hover': { backgroundColor: '#bbdefb' }
            }}
          />
        ))}
      </Box>
    </Paper>
  );
}