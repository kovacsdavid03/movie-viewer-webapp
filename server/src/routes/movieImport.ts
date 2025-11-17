import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { MovieImportService } from '../services/movieImportService';

const router = express.Router();

// Import movie by IMDb ID
router.post(
  '/import-movie',
  [
    body('imdbId').isString().trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { imdbId } = req.body;
    console.log('Received imdbId:', imdbId, 'Type:', typeof imdbId);

    if (!imdbId) {
      return res.status(400).json({ 
        success: false, 
        error: 'IMDb ID is required' 
      });
    }

    try {
      const result = await MovieImportService.importMovie(imdbId);
      
      if (result.success) {
        const statusCode = result.alreadyExists ? 200 : 201;
        return res.status(statusCode).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (err) {
      console.error('Import movie error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error during movie import' 
      });
    }
  }
);

// Check if movie exists by IMDb ID
router.get('/check-movie/:imdbId', async (req: Request, res: Response) => {
  try {
    const { imdbId } = req.params;

    if (!imdbId) {
      return res.status(400).json({ error: 'IMDb ID is required' });
    }

    // Validate IMDb ID format
    if (!MovieImportService.isValidImdbId(imdbId)) {
      return res.status(400).json({ 
        error: 'Invalid IMDb ID format. It must be at least 9 characters long and start with "tt".' 
      });
    }

    const result = await MovieImportService.isMovieInDatabase(imdbId);
    
    return res.json({
      exists: result.exists,
      movie: result.movie || null
    });
  } catch (err) {
    console.error('Check movie error:', err);
    return res.status(500).json({ error: 'Server error while checking movie' });
  }
});

// Validate IMDb ID format endpoint
router.get('/validate-imdb/:imdbId', (req, res) => {
  const { imdbId } = req.params;
  
  const isValid = MovieImportService.isValidImdbId(imdbId);
  
  res.json({
    valid: isValid,
    message: isValid 
      ? 'Valid IMDb ID format' 
      : 'Invalid IMDb ID. It must be at least 9 characters long and start with "tt".'
  });
});

export default router;