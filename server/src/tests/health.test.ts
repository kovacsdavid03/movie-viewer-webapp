import request from 'supertest';
import express from 'express';
import healthRoutes from '../routes/health';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/health', healthRoutes);

describe('Health Routes', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('time');
      
      // Verify time is a valid ISO string
      const time = new Date(response.body.time);
      expect(time instanceof Date && !isNaN(time.getTime())).toBe(true);
    });

    it('should return current timestamp', async () => {
      const beforeRequest = new Date();
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      const afterRequest = new Date();
      const responseTime = new Date(response.body.time);
      
      // Response time should be between before and after request
      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });

    it('should always return status ok', async () => {
      // Make multiple requests to ensure consistency
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/health')
          .expect(200);

        expect(response.body.status).toBe('ok');
      }
    });
  });
});