import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment BEFORE any other imports
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock the main database module to return the test database
jest.mock('../db', () => {
  return require('../testDb');
});