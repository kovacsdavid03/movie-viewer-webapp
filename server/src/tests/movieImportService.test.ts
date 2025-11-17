import { MovieImportService } from '../services/movieImportService';
import { Movie, sequelize } from '../db';

// Mock fetch for TMDB API calls
global.fetch = jest.fn();

describe('MovieImportService', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear movies table
    Movie.destroy({ where: {} });
  });

  describe('isValidImdbId', () => {
    it('should return true for valid IMDb IDs', () => {
      expect(MovieImportService.isValidImdbId('tt1234567')).toBe(true);
      expect(MovieImportService.isValidImdbId('tt12345678')).toBe(true);
      expect(MovieImportService.isValidImdbId('tt0111161')).toBe(true);
    });

    it('should return false for invalid IMDb IDs', () => {
      expect(MovieImportService.isValidImdbId('')).toBe(false);
      expect(MovieImportService.isValidImdbId('tt123')).toBe(false);
      expect(MovieImportService.isValidImdbId('1234567')).toBe(false);
      expect(MovieImportService.isValidImdbId('nm1234567')).toBe(false);
      expect(MovieImportService.isValidImdbId('tt12345a')).toBe(false);
      expect(MovieImportService.isValidImdbId(null as any)).toBe(false);
      expect(MovieImportService.isValidImdbId(undefined as any)).toBe(false);
    });
  });

  describe('isMovieInDatabase', () => {
    it('should return false for non-existent movie', async () => {
      const result = await MovieImportService.isMovieInDatabase('tt1234567');
      
      expect(result.exists).toBe(false);
      expect(result.movie).toBeUndefined();
    });

    it('should return true for existing movie', async () => {
      // Create a movie first
      await Movie.create({
        id: 12345,
        imdbId: 'tt1234567',
        adult: 'false',
        original_title: 'Test Movie',
        popularity: 8.5,
        vote_average: 7.5,
        vote_count: 1000
      });

      const result = await MovieImportService.isMovieInDatabase('tt1234567');
      
      expect(result.exists).toBe(true);
      expect(result.movie).toBeTruthy();
      expect(result.movie.imdbId).toBe('tt1234567');
    });

    it('should handle database errors', async () => {
      // Mock database error
      jest.spyOn(Movie, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      await expect(MovieImportService.isMovieInDatabase('tt1234567'))
        .rejects.toThrow('Database error while checking movie existence');
    });
  });

  describe('findMovieByImdbId', () => {
    beforeEach(() => {
      process.env.TMDB_BEARER_TOKEN = 'test-token';
    });

    it('should return TMDB ID for existing movie', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          movie_results: [{ id: 550 }]
        })
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const tmdbId = await MovieImportService.findMovieByImdbId('tt0137523');
      
      expect(tmdbId).toBe(550);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/find/tt0137523?external_source=imdb_id',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
    });

    it('should return null for non-existent movie', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          movie_results: []
        })
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const tmdbId = await MovieImportService.findMovieByImdbId('tt9999999');
      
      expect(tmdbId).toBe(null);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(MovieImportService.findMovieByImdbId('tt1234567'))
        .rejects.toThrow('Failed to find movie in TMDB');
    });

    it('should throw error if TMDB token not configured', async () => {
      delete process.env.TMDB_BEARER_TOKEN;

      await expect(MovieImportService.findMovieByImdbId('tt1234567'))
        .rejects.toThrow('TMDB Bearer token is not configured');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(MovieImportService.findMovieByImdbId('tt1234567'))
        .rejects.toThrow('Failed to find movie in TMDB');
    });
  });

  describe('fetchMovieDetails', () => {
    beforeEach(() => {
      process.env.TMDB_BEARER_TOKEN = 'test-token';
    });

    it('should fetch movie details successfully', async () => {
      const mockMovieDetails = {
        id: 550,
        title: 'Fight Club',
        original_title: 'Fight Club',
        imdb_id: 'tt0137523',
        adult: false,
        budget: 63000000,
        genres: [{ id: 18, name: 'Drama' }],
        popularity: 61.416,
        release_date: '1999-10-15',
        revenue: 100853753,
        runtime: 139,
        tagline: 'Mischief. Mayhem. Soap.',
        vote_average: 8.433,
        vote_count: 26280,
        production_companies: [],
        production_countries: [],
        spoken_languages: []
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockMovieDetails)
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const details = await MovieImportService.fetchMovieDetails(550);
      
      expect(details).toEqual(mockMovieDetails);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/550?language=en-US',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(MovieImportService.fetchMovieDetails(999999))
        .rejects.toThrow('Failed to fetch movie details from TMDB');
    });
  });

  describe('fetchMovieCredits', () => {
    beforeEach(() => {
      process.env.TMDB_BEARER_TOKEN = 'test-token';
    });

    it('should fetch movie credits successfully', async () => {
      const mockCredits = {
        id: 550,
        cast: [
          {
            name: 'Brad Pitt',
            character: 'Tyler Durden',
            gender: 2,
            order: 0,
            adult: false,
            id: 287,
            known_for_department: 'Acting',
            original_name: 'Brad Pitt',
            popularity: 30.171,
            profile_path: '/cckcYc2v0yh1tc9QjRelptcOBko.jpg',
            cast_id: 4,
            credit_id: '52fe4250c3a36847f800b579'
          }
        ],
        crew: [
          {
            name: 'David Fincher',
            job: 'Director',
            department: 'Directing',
            gender: 2,
            adult: false,
            id: 7467,
            known_for_department: 'Directing',
            original_name: 'David Fincher',
            popularity: 6.906,
            profile_path: '/tpEczFclQZeKAiCeKZZ0adRvtfz.jpg',
            credit_id: '52fe4250c3a36847f800b571'
          }
        ]
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCredits)
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const credits = await MovieImportService.fetchMovieCredits(550);
      
      expect(credits).toEqual(mockCredits);
      expect(credits.cast).toHaveLength(1);
      expect(credits.crew).toHaveLength(1);
      expect(credits.cast[0].gender).toBe(2);
      expect(credits.crew[0].gender).toBe(2);
    });
  });

  describe('fetchMovieKeywords', () => {
    beforeEach(() => {
      process.env.TMDB_BEARER_TOKEN = 'test-token';
    });

    it('should fetch movie keywords successfully', async () => {
      const mockKeywords = {
        id: 550,
        keywords: [
          { id: 825, name: 'support group' },
          { id: 1562, name: 'dual identity' }
        ]
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockKeywords)
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const keywords = await MovieImportService.fetchMovieKeywords(550);
      
      expect(keywords).toEqual(mockKeywords);
      expect(keywords.keywords).toHaveLength(2);
    });
  });

  describe('importMovie', () => {
    it('should return error for invalid IMDb ID', async () => {
      const result = await MovieImportService.importMovie('invalid');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid IMDb ID');
    });

    it('should return existing movie if already in database', async () => {
      // Create existing movie
      const existingMovie = await Movie.create({
        id: 12345,
        imdbId: 'tt1234567',
        adult: 'false',
        original_title: 'Existing Movie',
        popularity: 8.5,
        vote_average: 7.5,
        vote_count: 1000
      });

      const result = await MovieImportService.importMovie('tt1234567');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Movie already exists in database');
      expect(result.alreadyExists).toBe(true);
      expect(result.movie).toBeTruthy();
    });
  });
});