import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default router;