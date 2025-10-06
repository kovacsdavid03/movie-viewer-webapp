import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Movie as MovieIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface ImportedMovie {
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

interface ImportResult {
  success: boolean;
  message: string;
  movie?: ImportedMovie;
  alreadyExists?: boolean;
}



const MovieImport: React.FC = () => {
  const [imdbId, setImdbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);




  const importMovie = async (id: string): Promise<ImportResult> => {
    try {
      console.log('Importing movie:', id);
      const response = await fetch('/api/import-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imdbId: id }),
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage += ` - ${errorData.error}`;
          }
          if (errorData.details) {
            errorMessage += ` - Details: ${JSON.stringify(errorData.details)}`;
          }
        } catch (parseError) {
          // If JSON parsing fails, just use the basic error
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Import response:', data);
      return data;
    } catch (err) {
      console.error('Import error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Import failed: ${errorMessage}`
      };
    }
  };

  const handleImdbIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newId = event.target.value;
    setImdbId(newId);
    
    // Reset states when ID changes
    setResult(null);
    setError(null);
  };



  const handleImport = async () => {
    if (!imdbId.trim()) {
      setError('Please enter an IMDb ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const importResult = await importMovie(imdbId.trim());
      setResult(importResult);
      
      if (!importResult.success) {
        setError(importResult.message);
      }
    } catch (err) {
      setError('Error during import process');
    }
    
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AddIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Import Movie
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Enter an IMDb ID to import a movie from The Movie Database (TMDB). 
          Example: <code>tt1375666</code> (Inception)
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="IMDb ID"
            placeholder="e.g., tt1375666"
            value={imdbId}
            onChange={handleImdbIdChange}
            variant="outlined"
            helperText="IMDb ID must start with 'tt' and be at least 9 characters long"
            InputProps={{
              startAdornment: <MovieIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={loading || !imdbId.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            size="large"
          >
            {loading ? 'Importing...' : 'Import Movie'}
          </Button>
        </Box>



        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Success Result */}
        {result && result.success && result.movie && (
          <Box sx={{ mt: 4 }}>
            <Alert 
              severity={result.alreadyExists ? "info" : "success"} 
              sx={{ mb: 3 }}
            >
              {result.message}
            </Alert>
            
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {result.movie.original_title}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={`IMDb ID: ${result.movie.imdbId}`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={`Rating: ${result.movie.vote_average.toFixed(1)}/10`} 
                    color="secondary" 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={`${result.movie.vote_count.toLocaleString()} votes`} 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Box>

                <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Release Date:</strong> {result.movie.release_date ? formatDate(result.movie.release_date) : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Runtime:</strong> {result.movie.runtime ? `${result.movie.runtime} minutes` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Budget:</strong> {result.movie.budget ? formatCurrency(result.movie.budget) : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Revenue:</strong> {result.movie.revenue ? formatCurrency(result.movie.revenue) : 'N/A'}
                  </Typography>
                </Box>
                {result.movie.tagline && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2, gridColumn: '1 / -1' }}>
                    "{result.movie.tagline}"
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MovieImport;