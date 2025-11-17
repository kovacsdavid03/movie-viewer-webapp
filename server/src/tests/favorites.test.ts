import request from 'supertest';
import express from 'express';
import favoritesRoutes from '../routes/favorites';
import { User, Movie, Favorite, sequelize } from '../db';
import bcrypt from 'bcrypt';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/favorites', favoritesRoutes);

describe('Favorites Routes', () => {
  let testUserId: number;
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
      Favorite.destroy({ where: {} }),
      User.destroy({ where: {} }),
      Movie.destroy({ where: {} })
    ]);

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword
    });
    testUserId = user.get('id') as number;

    // Create test movie
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
  });

  describe('POST /api/favorites', () => {
    it('should add movie to favorites', async () => {
      const favoriteData = {
        userId: testUserId,
        movieId: testMovieId
      };

      const response = await request(app)
        .post('/api/favorites')
        .send(favoriteData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Movie added to favorites');
      expect(response.body).toHaveProperty('favorite');

      // Verify favorite was created in database
      const favorite = await Favorite.findOne({
        where: { user_id: testUserId, movie_id: testMovieId }
      });
      expect(favorite).toBeTruthy();
    });

    it('should return 409 if movie already in favorites', async () => {
      // Add movie to favorites first
      await Favorite.create({
        user_id: testUserId,
        movie_id: testMovieId
      });

      const favoriteData = {
        userId: testUserId,
        movieId: testMovieId
      };

      const response = await request(app)
        .post('/api/favorites')
        .send(favoriteData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Movie already in favorites');
    });

    it('should return 400 for missing userId', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({ movieId: testMovieId })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'userId and movieId are required');
    });

    it('should return 400 for missing movieId', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({ userId: testUserId })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'userId and movieId are required');
    });
  });

  describe('DELETE /api/favorites/:userId/:movieId', () => {
    beforeEach(async () => {
      // Add a favorite before each test
      await Favorite.create({
        user_id: testUserId,
        movie_id: testMovieId
      });
    });

    it('should remove movie from favorites', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${testUserId}/${testMovieId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Movie removed from favorites');

      // Verify favorite was removed from database
      const favorite = await Favorite.findOne({
        where: { user_id: testUserId, movie_id: testMovieId }
      });
      expect(favorite).toBeFalsy();
    });

    it('should return 404 if favorite not found', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${testUserId}/99999`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Favorite not found');
    });

    it('should return 400 for missing userId', async () => {
      const response = await request(app)
        .delete(`/api/favorites//${testMovieId}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'userId and movieId are required');
    });
  });

  describe('GET /api/favorites/:userId', () => {
    beforeEach(async () => {
      // Add multiple favorites for testing
      await Promise.all([
        Favorite.create({
          user_id: testUserId,
          movie_id: testMovieId
        })
      ]);
    });

    it('should return user favorites with pagination', async () => {
      const response = await request(app)
        .get(`/api/favorites/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('favorites');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');

      expect(Array.isArray(response.body.favorites)).toBe(true);
      expect(response.body.favorites.length).toBeGreaterThan(0);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get(`/api/favorites/${testUserId}?page=1&limit=5`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(5);
      expect(response.body.favorites.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array for user with no favorites', async () => {
      // Create new user without favorites
      const newUser = await User.create({
        email: 'newuser@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      const newUserId = newUser.get('id') as number;

      const response = await request(app)
        .get(`/api/favorites/${newUserId}`)
        .expect(200);

      expect(response.body.favorites).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });
});