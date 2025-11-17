# Backend Test Suite

This directory contains comprehensive tests for the movie viewer backend API.

## Test Structure

```
src/tests/
├── setup.ts                    # Test configuration and setup
├── auth.test.ts               # Authentication routes tests
├── movies.test.ts             # Movie routes tests
├── favorites.test.ts          # Favorites routes tests
├── movieImport.test.ts        # Movie import routes tests
├── movieImportService.test.ts # Movie import service tests
├── genres.test.ts             # Genres routes tests
├── health.test.ts             # Health check tests
├── integration.test.ts        # Full integration tests
└── README.md                  # This file
```

## Test Categories

### Unit Tests
- **Authentication**: Registration, login, validation
- **Movies**: CRUD operations, filtering, pagination
- **Favorites**: Add/remove favorites, user-specific queries
- **Movie Import**: TMDB API integration, validation
- **Genres**: Genre listing and management
- **Health**: Basic health check endpoint

### Integration Tests
- **Complete user flows**: Registration → Login → Favorites → Movies
- **API consistency**: Error handling, response formats
- **CORS functionality**: Cross-origin request handling

## Test Configuration

### Environment Setup
- Uses `.env.test` for test-specific configuration
- Separate test database: `MovieDB_Test`
- Mocked TMDB API calls for isolated testing

### Database Strategy
- Each test suite uses `force: true` to reset schema
- `beforeEach` hooks clear data for test isolation
- Transactions used where appropriate

## Running Tests

### Prerequisites
```bash
# Install test dependencies (already done)
npm install --save-dev jest @types/jest supertest @types/supertest ts-jest
```

### Available Commands
```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-restart on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci
```

### Running Specific Tests
```bash
# Run specific test file
npx jest auth.test.ts

# Run tests matching pattern
npx jest --testNamePattern="should register"

# Run tests for specific route
npx jest movies.test.ts --verbose
```

## Test Coverage

The test suite covers:

✅ **Authentication (auth.test.ts)**
- User registration with validation
- Password hashing verification
- Login with credentials
- Error handling for invalid data

✅ **Movies (movies.test.ts)**
- Movie listing with pagination
- Filtering by search, rating, year, genres
- Individual movie details with relations
- Error handling for invalid IDs

✅ **Favorites (favorites.test.ts)**
- Adding movies to favorites
- Removing movies from favorites
- User-specific favorite queries
- Duplicate prevention

✅ **Movie Import (movieImport.test.ts & movieImportService.test.ts)**
- IMDb ID validation
- TMDB API integration (mocked)
- Movie data parsing and storage
- Error handling for API failures

✅ **Genres (genres.test.ts)**
- Genre listing with deduplication
- Alphabetical sorting
- Empty state handling

✅ **Health Check (health.test.ts)**
- Basic health endpoint
- Timestamp accuracy

✅ **Integration (integration.test.ts)**
- Complete user workflows
- API consistency across endpoints
- CORS functionality
- Error response formats

## Mocking Strategy

### External APIs
- TMDB API calls are mocked using Jest
- Prevents external dependencies in tests
- Allows testing error scenarios

### Database Operations
- Real database operations for integration testing
- Isolated test database prevents data conflicts
- Schema reset between test suites

## Best Practices Implemented

1. **Test Isolation**: Each test can run independently
2. **Data Cleanup**: Tables cleared between tests
3. **Comprehensive Coverage**: All routes and services tested
4. **Error Scenarios**: Both success and failure cases
5. **Realistic Data**: Test data mimics real application usage
6. **Performance**: Fast test execution with proper mocking
7. **Documentation**: Clear test descriptions and expectations

## Adding New Tests

When adding new features:

1. Create test file following naming pattern: `feature.test.ts`
2. Include both unit and integration tests
3. Test success and error scenarios
4. Mock external dependencies
5. Update this README if needed

Example test structure:
```typescript
describe('New Feature', () => {
  beforeEach(async () => {
    // Setup test data
  });

  describe('POST /api/new-endpoint', () => {
    it('should handle valid data', async () => {
      // Test implementation
    });

    it('should handle invalid data', async () => {
      // Error case testing
    });
  });
});
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure test database exists and is accessible
2. **Environment Variables**: Check `.env.test` file exists and is properly configured
3. **Port Conflicts**: Test uses different port (5002) to avoid conflicts
4. **Timeout Issues**: Increase Jest timeout if database operations are slow

### Debug Mode
```bash
# Run tests with detailed output
npm test -- --verbose

# Run single test with full error details
npx jest auth.test.ts --verbose --no-coverage
```

## Coverage Goals

Target coverage metrics:
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

View coverage report:
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```