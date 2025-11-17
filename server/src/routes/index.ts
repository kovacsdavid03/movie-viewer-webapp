import express from 'express';
import authRoutes from './auth';
import movieRoutes from './movies';
import movieImportRoutes from './movieImport';
import favoritesRoutes from './favorites';
import genresRoutes from './genres';
import recommendationsRoutes from './recommendations';
import healthRoutes from './health';

const router = express.Router();

// Mount all routes with their base paths
router.use('/', authRoutes);              // /api/register, /api/login
router.use('/movies', movieRoutes);       // /api/movies
router.use('/', movieImportRoutes);       // /api/import-movie, /api/check-movie, /api/validate-imdb
router.use('/favorites', favoritesRoutes);       // /api/favorites
router.use('/genres', genresRoutes);            // /api/genres
router.use('/recommendations', recommendationsRoutes); // /api/recommendations
router.use('/health', healthRoutes);            // /api/health

export default router;