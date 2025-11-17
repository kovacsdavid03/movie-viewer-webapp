import express, { Request, Response } from 'express';
import { Favorite, Movie } from '../db';

const router = express.Router();

// Add movie to favorites
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, movieId } = req.body;

    if (!userId || !movieId) {
      return res.status(400).json({ error: 'userId and movieId are required' });
    }

    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({
      where: { user_id: parseInt(userId), movie_id: parseInt(movieId) }
    });

    if (existingFavorite) {
      return res.status(409).json({ error: 'Movie already in favorites' });
    }

    // Create new favorite
    const favorite = await Favorite.create({
      user_id: parseInt(userId),
      movie_id: parseInt(movieId)
    });

    return res.status(201).json({ message: 'Movie added to favorites', favorite });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Remove movie from favorites
router.delete('/:userId/:movieId', async (req: Request, res: Response) => {
  try {
    const { userId, movieId } = req.params;

    if (!userId || !movieId) {
      return res.status(400).json({ error: 'userId and movieId are required' });
    }

    const deleted = await Favorite.destroy({
      where: { user_id: parseInt(userId), movie_id: parseInt(movieId) }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    return res.json({ message: 'Movie removed from favorites' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get user's favorite movies
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { user_id: parseInt(userId) },
      include: [{
        model: Movie,
        as: 'movie',
        required: true
      }],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      favorites: rows.map(fav => fav.get('movie')),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;