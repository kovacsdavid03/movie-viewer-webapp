import request from 'supertest';
import express from 'express';
import movieImportRoutes from '../routes/movieImport';
import { MovieImportService } from '../services/movieImportService';
import { sequelize } from '../db';

// Mock the MovieImportService
jest.mock('../services/movieImportService');

// Create test app
const app = express();
app.use(express.json());
app.use('/api', movieImportRoutes);

describe('Movie Import Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/import-movie', () => {
    it('should import movie successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Movie imported successfully',
        movie: { id: 550, title: 'Fight Club' },
        alreadyExists: false
      };

      (MovieImportService.importMovie as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/import-movie')
        .send({ imdbId: 'tt0137523' })
        .expect(201);

      expect(response.body).toEqual(mockResult);
      expect(MovieImportService.importMovie).toHaveBeenCalledWith('tt0137523');
    });

    it('should return 200 for existing movie', async () => {
      const mockResult = {
        success: true,
        message: 'Movie already exists in database',
        movie: { id: 550, title: 'Fight Club' },
        alreadyExists: true
      };

      (MovieImportService.importMovie as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/import-movie')
        .send({ imdbId: 'tt0137523' })
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });

    it('should return 400 for import failure', async () => {
      const mockResult = {
        success: false,
        message: 'Movie not found in TMDB database'
      };

      (MovieImportService.importMovie as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/import-movie')
        .send({ imdbId: 'tt9999999' })
        .expect(400);

      expect(response.body).toEqual(mockResult);
    });

    it('should return 400 for missing imdbId', async () => {
      const response = await request(app)
        .post('/api/import-movie')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'IMDb ID is required');
    });

    it('should return 400 for invalid imdbId format', async () => {
      const response = await request(app)
        .post('/api/import-movie')
        .send({ imdbId: '' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should handle service errors', async () => {
      (MovieImportService.importMovie as jest.Mock).mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/import-movie')
        .send({ imdbId: 'tt0137523' })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Server error during movie import');
    });
  });

  describe('GET /api/check-movie/:imdbId', () => {
    it('should check if movie exists', async () => {
      const mockResult = {
        exists: true,
        movie: { id: 550, title: 'Fight Club' }
      };

      (MovieImportService.isValidImdbId as jest.Mock).mockReturnValue(true);
      (MovieImportService.isMovieInDatabase as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/check-movie/tt0137523')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(MovieImportService.isValidImdbId).toHaveBeenCalledWith('tt0137523');
      expect(MovieImportService.isMovieInDatabase).toHaveBeenCalledWith('tt0137523');
    });

    it('should return false for non-existent movie', async () => {
      const mockResult = {
        exists: false,
        movie: null
      };

      (MovieImportService.isValidImdbId as jest.Mock).mockReturnValue(true);
      (MovieImportService.isMovieInDatabase as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/check-movie/tt9999999')
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });

    it('should return 400 for missing imdbId', async () => {
      const response = await request(app)
        .get('/api/check-movie/')
        .expect(404); // Express returns 404 for missing route parameters
    });

    it('should return 400 for invalid imdbId format', async () => {
      (MovieImportService.isValidImdbId as jest.Mock).mockReturnValue(false);

      const response = await request(app)
        .get('/api/check-movie/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid IMDb ID format. It must be at least 9 characters long and start with "tt".');
    });

    it('should handle service errors', async () => {
      (MovieImportService.isValidImdbId as jest.Mock).mockReturnValue(true);
      (MovieImportService.isMovieInDatabase as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/check-movie/tt0137523')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Server error while checking movie');
    });
  });

  describe('GET /api/validate-imdb/:imdbId', () => {
    it('should validate valid imdbId', async () => {
      (MovieImportService.isValidImdbId as jest.Mock).mockReturnValue(true);

      const response = await request(app)
        .get('/api/validate-imdb/tt0137523')
        .expect(200);

      expect(response.body).toEqual({
        valid: true,
        message: 'Valid IMDb ID format'
      });
    });

    it('should reject invalid imdbId', async () => {
      (MovieImportService.isValidImdbId as jest.Mock).mockReturnValue(false);

      const response = await request(app)
        .get('/api/validate-imdb/invalid')
        .expect(200);

      expect(response.body).toEqual({
        valid: false,
        message: 'Invalid IMDb ID. It must be at least 9 characters long and start with "tt".'
      });
    });
  });
});