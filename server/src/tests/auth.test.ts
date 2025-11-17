import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import authRoutes from '../routes/auth';
import { User, sequelize } from '../db';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', authRoutes);

describe('Authentication Routes', () => {
  beforeAll(async () => {
    // Sync database for testing
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear users table before each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered');
      expect(response.body).toHaveProperty('userId');
      expect(typeof response.body.userId).toBe('number');

      // Verify user was created in database
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeTruthy();
      expect(user?.get('email')).toBe(userData.email);
    });

    it('should hash the password correctly', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ where: { email: userData.email } });
      const storedPassword = user?.get('password') as string;
      
      // Verify password is hashed
      expect(storedPassword).not.toBe(userData.password);
      
      // Verify password can be verified
      const isValid = await bcrypt.compare(userData.password, storedPassword);
      expect(isValid).toBe(true);
    });

    it('should return 409 if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Email already registered');
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return 400 for short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      await request(app)
        .post('/api/register')
        .send({})
        .expect(400);

      await request(app)
        .post('/api/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      await request(app)
        .post('/api/register')
        .send({ password: 'password123' })
        .expect(400);
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        email: 'test@example.com',
        password: hashedPassword
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('userId');
      expect(typeof response.body.userId).toBe('number');
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for missing fields', async () => {
      await request(app)
        .post('/api/login')
        .send({})
        .expect(400);

      await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      await request(app)
        .post('/api/login')
        .send({ password: 'password123' })
        .expect(400);
    });
  });
});