import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { LocalOffer } from '@mui/icons-material';

interface KeywordsSectionProps {
  keywords: string[];
}

export default function KeywordsSection({ keywords }: KeywordsSectionProps) {
  if (!keywords.length) return null;

  return (
    <Paper sx={{ p: 3, height: 'fit-content' }}>
      <Typography variant="h6" gutterBottom>
        <LocalOffer sx={{ mr: 1, verticalAlign: 'middle' }} />
        Keywords
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {keywords.map((keyword, index) => (
          <Chip
            key={index}
            label={keyword}
            size="small"
            variant="outlined"
            sx={{ 
              backgroundColor: '#f3e5f5', 
              color: '#7b1fa2',
              '&:hover': {
                backgroundColor: '#e1bee7'
              }
            }}
          />
        ))}
      </Box>
    </Paper>
  );
}