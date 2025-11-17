import express from 'express';
import { Genre } from '../db';

const router = express.Router();

// Get available genres
router.get('/', async (req, res) => {
  try {
    const genres = await Genre.findAll({
      attributes: ['genre'],
      group: ['genre'],
      order: [['genre', 'ASC']],
    });

    const genreList = genres.map((g: any) => g.genre);
    res.json(genreList);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

export default router;