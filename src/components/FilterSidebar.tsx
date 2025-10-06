import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Slider,
  Chip,
  Button,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon, FilterList as FilterIcon } from '@mui/icons-material';

export interface FilterOptions {
  genres: string[];
  minYear: number;
  maxYear: number;
  minRating: number;
  maxRating: number;
  minPopularity: number;
  maxPopularity: number;
}

interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;
  onFiltersChange: (filters: FilterOptions) => void;
  availableGenres: string[];
}

export default function FilterSidebar({ 
  open, 
  onClose, 
  onFiltersChange, 
  availableGenres 
}: FilterSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [filters, setFilters] = useState<FilterOptions>({
    genres: [],
    minYear: 1900,
    maxYear: new Date().getFullYear(),
    minRating: 0,
    maxRating: 10,
    minPopularity: 0,
    maxPopularity: 1000,
  });

  const [yearRange, setYearRange] = useState<number[]>([1900, new Date().getFullYear()]);
  const [ratingRange, setRatingRange] = useState<number[]>([0, 10]);
  const [popularityRange, setPopularityRange] = useState<number[]>([0, 1000]);

  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    
    const newFilters = { ...filters, genres: newGenres };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleYearChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number[];
    setYearRange(value);
    const newFilters = { ...filters, minYear: value[0], maxYear: value[1] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRatingChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number[];
    setRatingRange(value);
    const newFilters = { ...filters, minRating: value[0], maxRating: value[1] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePopularityChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number[];
    setPopularityRange(value);
    const newFilters = { ...filters, minPopularity: value[0], maxPopularity: value[1] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      genres: [],
      minYear: 1900,
      maxYear: new Date().getFullYear(),
      minRating: 0,
      maxRating: 10,
      minPopularity: 0,
      maxPopularity: 1000,
    };
    setFilters(defaultFilters);
    setYearRange([1900, new Date().getFullYear()]);
    setRatingRange([0, 10]);
    setPopularityRange([0, 1000]);
    onFiltersChange(defaultFilters);
  };

  const drawerContent = (
    <Box sx={{ width: 320, p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Genres Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Genres
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {availableGenres.map((genre) => (
            <Chip
              key={genre}
              label={genre}
              onClick={() => handleGenreToggle(genre)}
              color={filters.genres.includes(genre) ? 'primary' : 'default'}
              variant={filters.genres.includes(genre) ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Release Year Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Release Year
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {yearRange[0]} - {yearRange[1]}
        </Typography>
        <Slider
          value={yearRange}
          onChange={handleYearChange}
          valueLabelDisplay="auto"
          min={1900}
          max={new Date().getFullYear()}
          sx={{ color: 'primary.main' }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Rating Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Rating
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {ratingRange[0]} - {ratingRange[1]} stars
        </Typography>
        <Slider
          value={ratingRange}
          onChange={handleRatingChange}
          valueLabelDisplay="auto"
          min={0}
          max={10}
          step={0.1}
          sx={{ color: 'warning.main' }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Popularity Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Popularity
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {popularityRange[0]} - {popularityRange[1]}
        </Typography>
        <Slider
          value={popularityRange}
          onChange={handlePopularityChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          sx={{ color: 'success.main' }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Clear Filters Button */}
      <Button
        variant="outlined"
        fullWidth
        onClick={handleClearFilters}
        sx={{ mt: 2 }}
      >
        Clear All Filters
      </Button>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}