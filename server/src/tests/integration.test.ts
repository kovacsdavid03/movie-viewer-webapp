import request from 'supertest';
import express from 'express';
import cors from 'cors';
import routes from '../routes';
import { sequelize } from '../db';

// Create test app similar to main app
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', routes);

describe('Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Complete User Flow', () => {
    let userId: number;
    let movieId: number = 12345; // Test movie ID

    it('should complete full user registration and login flow', async () => {
      // 1. Register new user
      const registerResponse = await request(app)
        .post('/api/register')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('userId');
      userId = registerResponse.body.userId;

      // 2. Login with registered user
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('userId', userId);
    });

    it('should handle movie operations flow', async () => {
      // 1. Check initial movies list (should be empty)
      const initialMoviesResponse = await request(app)
        .get('/api/movies')
        .expect(200);

      expect(initialMoviesResponse.body.movies).toHaveLength(0);

      // 2. Check genres (should be empty)
      const genresResponse = await request(app)
        .get('/api/genres')
        .expect(200);

      expect(genresResponse.body).toHaveLength(0);

      // 3. Check health endpoint
      const healthResponse = await request(app)
        .get('/api/health')
        .expect(200);

      expect(healthResponse.body).toHaveProperty('status', 'ok');
    });

    it('should handle favorites operations flow', async () => {
      // Create a test movie first for favorites testing
      // This would normally be done through movie import, but we'll create directly for testing
      const { Movie } = require('../db');
      await Movie.create({
        id: movieId,
        imdbId: 'tt9999999',
        adult: 'false',
        original_title: 'Integration Test Movie',
        popularity: 5.0,
        vote_average: 6.0,
        vote_count: 100
      });

      // 1. Check initial empty favorites
      const initialFavoritesResponse = await request(app)
        .get(`/api/favorites/${userId}`)
        .expect(200);

      expect(initialFavoritesResponse.body.favorites).toHaveLength(0);
      expect(initialFavoritesResponse.body.total).toBe(0);

      // 2. Add movie to favorites
      const addFavoriteResponse = await request(app)
        .post('/api/favorites')
        .send({
          userId: userId,
          movieId: movieId
        })
        .expect(201);

      expect(addFavoriteResponse.body).toHaveProperty('message', 'Movie added to favorites');

      // 3. Verify movie is in favorites
      const favoritesAfterAddResponse = await request(app)
        .get(`/api/favorites/${userId}`)
        .expect(200);

      expect(favoritesAfterAddResponse.body.favorites).toHaveLength(1);
      expect(favoritesAfterAddResponse.body.total).toBe(1);
      expect(favoritesAfterAddResponse.body.favorites[0].id).toBe(movieId);

      // 4. Try to add same movie again (should fail)
      await request(app)
        .post('/api/favorites')
        .send({
          userId: userId,
          movieId: movieId
        })
        .expect(409);

      // 5. Remove movie from favorites
      const removeFavoriteResponse = await request(app)
        .delete(`/api/favorites/${userId}/${movieId}`)
        .expect(200);

      expect(removeFavoriteResponse.body).toHaveProperty('message', 'Movie removed from favorites');

      // 6. Verify favorites is empty again
      const finalFavoritesResponse = await request(app)
        .get(`/api/favorites/${userId}`)
        .expect(200);

      expect(finalFavoritesResponse.body.favorites).toHaveLength(0);
      expect(finalFavoritesResponse.body.total).toBe(0);

      // 7. Try to remove non-existent favorite (should fail)
      await request(app)
        .delete(`/api/favorites/${userId}/${movieId}`)
        .expect(404);
    });

    it('should handle movie details flow', async () => {
      // 1. Get movie details
      const movieDetailsResponse = await request(app)
        .get(`/api/movies/${movieId}`)
        .expect(200);

      expect(movieDetailsResponse.body).toHaveProperty('id', movieId);
      expect(movieDetailsResponse.body).toHaveProperty('original_title', 'Integration Test Movie');
      expect(movieDetailsResponse.body).toHaveProperty('cast');
      expect(movieDetailsResponse.body).toHaveProperty('crew');
      expect(movieDetailsResponse.body).toHaveProperty('genres');
      expect(movieDetailsResponse.body).toHaveProperty('keywords');

      // 2. Try to get non-existent movie
      await request(app)
        .get('/api/movies/99999999')
        .expect(404);
    });

    it('should handle error cases gracefully', async () => {
      // 1. Invalid registration data
      await request(app)
        .post('/api/register')
        .send({
          email: 'invalid-email',
          password: '123'
        })
        .expect(400);

      // 2. Login with invalid credentials
      await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        })
        .expect(401);

      // 3. Invalid favorite operations
      await request(app)
        .post('/api/favorites')
        .send({
          userId: 'invalid',
          movieId: 'invalid'
        })
        .expect(400);

      // 4. Invalid movie search
      await request(app)
        .get('/api/movies/invalid')
        .expect(400);
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(204);

      // Should include CORS headers
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('API Response Format Consistency', () => {
    it('should return consistent error format', async () => {
      const responses = await Promise.all([
        request(app).post('/api/register').send({}).expect(400),
        request(app).post('/api/login').send({}).expect(400),
        request(app).get('/api/movies/invalid').expect(400),
        request(app).post('/api/favorites').send({}).expect(400)
      ]);

      responses.forEach(response => {
        expect(response.body).toHaveProperty('error');
      });
    });

    it('should return consistent success format', async () => {
      // Test various successful operations
      const healthResponse = await request(app).get('/api/health').expect(200);
      expect(healthResponse.body).toHaveProperty('status');

      const moviesResponse = await request(app).get('/api/movies').expect(200);
      expect(moviesResponse.body).toHaveProperty('movies');
      expect(moviesResponse.body).toHaveProperty('totalPages');

      const genresResponse = await request(app).get('/api/genres').expect(200);
      expect(Array.isArray(genresResponse.body)).toBe(true);
    });
  });
});