import express, { Request, Response } from 'express';

const router = express.Router();

// Recommendation proxy endpoint to handle CORS
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Make request to the recommendation service
    const response = await fetch(`http://localhost:8000/recommend/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Recommendation service responded with status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;