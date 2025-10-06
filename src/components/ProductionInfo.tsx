import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { Business, Public, Language } from '@mui/icons-material';

interface ProductionInfoProps {
  production_companies: string[];
  production_countries: string[];
  spoken_languages: string[];
}

export default function ProductionInfo({
  production_companies,
  production_countries,
  spoken_languages
}: ProductionInfoProps) {
  const hasAnyData = production_companies.length > 0 || 
                     production_countries.length > 0 || 
                     spoken_languages.length > 0;

  if (!hasAnyData) return null;

  return (
    <Paper sx={{ p: 3, height: 'fit-content' }}>
      <Typography variant="h6" gutterBottom>
        <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
        Production Details
      </Typography>
      
      {production_companies.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Production Companies
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {production_companies.map((company, index) => (
              <Chip
                key={index}
                label={company}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: '#fff3e0', color: '#f57c00' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {production_countries.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <Public sx={{ mr: 1, fontSize: '1rem', verticalAlign: 'middle' }} />
            Production Countries
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {production_countries.map((country, index) => (
              <Chip
                key={index}
                label={country}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {spoken_languages.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            <Language sx={{ mr: 1, fontSize: '1rem', verticalAlign: 'middle' }} />
            Languages
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {spoken_languages.map((language, index) => (
              <Chip
                key={index}
                label={language}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: '#fce4ec', color: '#c2185b' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}