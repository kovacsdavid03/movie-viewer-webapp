import request from 'supertest';
import express from 'express';
import genresRoutes from '../routes/genres';
import { Movie, Genre, sequelize } from '../db';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/genres', genresRoutes);

describe('Genres Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear tables
    await Promise.all([
      Genre.destroy({ where: {} }),
      Movie.destroy({ where: {} })
    ]);

    // Create test movie
    const movie = await Movie.create({
      id: 12345,
      imdbId: 'tt1234567',
      adult: 'false',
      original_title: 'Test Movie',
      popularity: 8.5,
      vote_average: 7.5,
      vote_count: 1000
    });

    const movieId = movie.get('id') as number;

    // Create test genres
    await Promise.all([
      Genre.create({ movieId, genre: 'Action' }),
      Genre.create({ movieId, genre: 'Drama' }),
      Genre.create({ movieId, genre: 'Action' }), // Duplicate to test grouping
      Genre.create({ movieId, genre: 'Comedy' })
    ]);
  });

  describe('GET /api/genres', () => {
    it('should return list of unique genres', async () => {
      const response = await request(app)
        .get('/api/genres')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3); // Should be unique: Action, Comedy, Drama
      expect(response.body).toContain('Action');
      expect(response.body).toContain('Drama');
      expect(response.body).toContain('Comedy');
    });

    it('should return genres in alphabetical order', async () => {
      const response = await request(app)
        .get('/api/genres')
        .expect(200);

      const genres = response.body;
      const sortedGenres = [...genres].sort();
      expect(genres).toEqual(sortedGenres);
    });

    it('should return empty array when no genres exist', async () => {
      // Clear all genres
      await Genre.destroy({ where: {} });

      const response = await request(app)
        .get('/api/genres')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(Genre, 'findAll').mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/genres')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch genres');
    });
  });
});