import request from 'supertest';
import express from 'express';
import moviesRoutes from '../routes/movies';
import { Movie, Cast, Crew, Genre, Keyword, sequelize } from '../db';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/movies', moviesRoutes);

describe('Movies Routes', () => {
  let testMovieId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear all tables
    await Promise.all([
      Cast.destroy({ where: {} }),
      Crew.destroy({ where: {} }),
      Genre.destroy({ where: {} }),
      Keyword.destroy({ where: {} }),
      Movie.destroy({ where: {} })
    ]);

    // Create a test movie
    const movie = await Movie.create({
      id: 12345,
      imdbId: 'tt1234567',
      adult: 'false',
      budget: 1000000,
      original_title: 'Test Movie',
      popularity: 8.5,
      release_date: '2023-01-01',
      revenue: 2000000,
      runtime: 120,
      tagline: 'A test movie',
      vote_average: 7.5,
      vote_count: 1000
    });

    testMovieId = movie.get('id') as number;

    // Add related data
    await Promise.all([
      Cast.create({
        movieId: testMovieId,
        name: 'Test Actor',
        character: 'Test Character',
        gender: 1,
        order: 1
      }),
      Crew.create({
        movieId: testMovieId,
        name: 'Test Director',
        job: 'Director',
        department: 'Directing',
        gender: 2
      }),
      Genre.create({
        movieId: testMovieId,
        genre: 'Action'
      }),
      Keyword.create({
        movieId: testMovieId,
        keyword: 'test'
      })
    ]);
  });

  describe('GET /api/movies', () => {
    it('should return paginated movies', async () => {
      const response = await request(app)
        .get('/api/movies')
        .expect(200);

      expect(response.body).toHaveProperty('movies');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage');
      expect(response.body).toHaveProperty('totalMovies');
      
      expect(Array.isArray(response.body.movies)).toBe(true);
      expect(response.body.movies.length).toBeGreaterThan(0);
      expect(response.body.currentPage).toBe(1);
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/movies?page=1&limit=5')
        .expect(200);

      expect(response.body.currentPage).toBe(1);
      expect(response.body.movies.length).toBeLessThanOrEqual(5);
    });

    it('should filter by search term', async () => {
      const response = await request(app)
        .get('/api/movies?search=Test')
        .expect(200);

      expect(response.body.movies.length).toBeGreaterThan(0);
      expect(response.body.movies[0].original_title).toContain('Test');
    });

    it('should filter by rating range', async () => {
      const response = await request(app)
        .get('/api/movies?minRating=7&maxRating=8')
        .expect(200);

      expect(response.body.movies.length).toBeGreaterThan(0);
      response.body.movies.forEach((movie: any) => {
        expect(movie.vote_average).toBeGreaterThanOrEqual(7);
        expect(movie.vote_average).toBeLessThanOrEqual(8);
      });
    });

    it('should filter by year range', async () => {
      const response = await request(app)
        .get('/api/movies?minYear=2020&maxYear=2024')
        .expect(200);

      expect(response.body.movies.length).toBeGreaterThan(0);
      response.body.movies.forEach((movie: any) => {
        const year = new Date(movie.release_date).getFullYear();
        expect(year).toBeGreaterThanOrEqual(2020);
        expect(year).toBeLessThanOrEqual(2024);
      });
    });

    it('should return empty result for no matches', async () => {
      const response = await request(app)
        .get('/api/movies?search=NonexistentMovie')
        .expect(200);

      expect(response.body.movies).toHaveLength(0);
      expect(response.body.totalMovies).toBe(0);
    });
  });

  describe('GET /api/movies/:movieId', () => {
    it('should return movie details with all related data', async () => {
      const response = await request(app)
        .get(`/api/movies/${testMovieId}`)
        .expect(200);

      // Check main movie data
      expect(response.body).toHaveProperty('id', testMovieId);
      expect(response.body).toHaveProperty('original_title', 'Test Movie');
      expect(response.body).toHaveProperty('imdbId', 'tt1234567');

      // Check related data
      expect(response.body).toHaveProperty('cast');
      expect(response.body).toHaveProperty('crew');
      expect(response.body).toHaveProperty('genres');
      expect(response.body).toHaveProperty('keywords');

      expect(Array.isArray(response.body.cast)).toBe(true);
      expect(Array.isArray(response.body.crew)).toBe(true);
      expect(Array.isArray(response.body.genres)).toBe(true);
      expect(Array.isArray(response.body.keywords)).toBe(true);

      // Verify cast data
      expect(response.body.cast.length).toBeGreaterThan(0);
      expect(response.body.cast[0]).toHaveProperty('name', 'Test Actor');
      expect(response.body.cast[0]).toHaveProperty('character', 'Test Character');
      expect(response.body.cast[0]).toHaveProperty('gender', 1);

      // Verify crew data
      expect(response.body.crew.length).toBeGreaterThan(0);
      expect(response.body.crew[0]).toHaveProperty('name', 'Test Director');
      expect(response.body.crew[0]).toHaveProperty('job', 'Director');
      expect(response.body.crew[0]).toHaveProperty('gender', 2);

      // Verify genres and keywords
      expect(response.body.genres).toContain('Action');
      expect(response.body.keywords).toContain('test');
    });

    it('should return 404 for non-existent movie', async () => {
      const response = await request(app)
        .get('/api/movies/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Movie not found');
    });

    it('should return 400 for invalid movie ID', async () => {
      const response = await request(app)
        .get('/api/movies/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Movie ID is required');
    });
  });
});