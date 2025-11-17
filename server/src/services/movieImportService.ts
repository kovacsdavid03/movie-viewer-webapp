import { Op } from 'sequelize';
import { Movie, Cast, Crew, Genre, Keyword, ProductionCompany, ProductionCountry, SpokenLanguage, sequelize } from '../db';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

interface TMDBFindResponse {
  movie_results: Array<{
    adult: boolean;
    backdrop_path: string;
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string;
    media_type: string;
    original_language: string;
    genre_ids: number[];
    popularity: number;
    release_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
  }>;
  person_results: any[];
  tv_results: any[];
  tv_episode_results: any[];
  tv_season_results: any[];
}

interface TMDBMovieDetails {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: any;
  budget: number;
  genres: Array<{
    id: number;
    name: string;
  }>;
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: Array<{
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TMDBCredits {
  id: number;
  cast: Array<{
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string;
    cast_id: number;
    character: string;
    credit_id: string;
    order: number;
  }>;
  crew: Array<{
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string;
    credit_id: string;
    department: string;
    job: string;
  }>;
}

interface TMDBKeywords {
  id: number;
  keywords: Array<{
    id: number;
    name: string;
  }>;
}

export class MovieImportService {
  private static readonly TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
  private static readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  /**
   * Validates if the provided string is a valid IMDb ID
   */
  static isValidImdbId(imdbId: string): boolean {
    if (!imdbId || typeof imdbId !== 'string') {
      return false;
    }
    
    // IMDb ID must be at least 9 characters long and start with "tt"
    return imdbId.length >= 9 && imdbId.startsWith('tt') && /^tt\d{7,}$/.test(imdbId);
  }

  /**
   * Checks if a movie with the given IMDb ID already exists in the database
   */
  static async isMovieInDatabase(imdbId: string): Promise<{ exists: boolean; movie?: any }> {
    try {
      const movie = await Movie.findOne({
        where: { imdbId }
      });
      
      return {
        exists: !!movie,
        movie: movie ? movie.toJSON() : undefined
      };
    } catch (error) {
      console.error('Error checking if movie exists in database:', error);
      throw new Error('Database error while checking movie existence');
    }
  }

  /**
   * Finds a movie by IMDb ID using TMDB API
   */
  static async findMovieByImdbId(imdbId: string): Promise<number | null> {
    if (!this.TMDB_BEARER_TOKEN) {
      throw new Error('TMDB Bearer token is not configured');
    }

    try {
      const response = await fetch(
        `${this.TMDB_BASE_URL}/find/${imdbId}?external_source=imdb_id`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${this.TMDB_BEARER_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as TMDBFindResponse;
      
      if (data.movie_results && data.movie_results.length > 0) {
        return data.movie_results[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding movie by IMDb ID:', error);
      throw new Error('Failed to find movie in TMDB');
    }
  }

  /**
   * Fetches movie details from TMDB API
   */
  static async fetchMovieDetails(tmdbId: number): Promise<TMDBMovieDetails> {
    if (!this.TMDB_BEARER_TOKEN) {
      throw new Error('TMDB Bearer token is not configured');
    }

    try {
      const response = await fetch(
        `${this.TMDB_BASE_URL}/movie/${tmdbId}?language=en-US`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${this.TMDB_BEARER_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as TMDBMovieDetails;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw new Error('Failed to fetch movie details from TMDB');
    }
  }

  /**
   * Fetches movie credits from TMDB API
   */
  static async fetchMovieCredits(tmdbId: number): Promise<TMDBCredits> {
    if (!this.TMDB_BEARER_TOKEN) {
      throw new Error('TMDB Bearer token is not configured');
    }

    try {
      const response = await fetch(
        `${this.TMDB_BASE_URL}/movie/${tmdbId}/credits?language=en-US`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${this.TMDB_BEARER_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as TMDBCredits;
    } catch (error) {
      console.error('Error fetching movie credits:', error);
      throw new Error('Failed to fetch movie credits from TMDB');
    }
  }

  /**
   * Fetches movie keywords from TMDB API
   */
  static async fetchMovieKeywords(tmdbId: number): Promise<TMDBKeywords> {
    if (!this.TMDB_BEARER_TOKEN) {
      throw new Error('TMDB Bearer token is not configured');
    }

    try {
      const response = await fetch(
        `${this.TMDB_BASE_URL}/movie/${tmdbId}/keywords`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${this.TMDB_BEARER_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as TMDBKeywords;
    } catch (error) {
      console.error('Error fetching movie keywords:', error);
      throw new Error('Failed to fetch movie keywords from TMDB');
    }
  }

  /**
   * Saves movie and all related data to the database
   */
  static async saveMovieToDatabase(
    movieDetails: TMDBMovieDetails, 
    credits: TMDBCredits,
    keywords: TMDBKeywords
  ): Promise<any> {
    const transaction = await sequelize.transaction();

    try {
      // Create the main movie record
      console.log('Creating movie with data:', {
        imdbId: movieDetails.imdb_id,
        original_title: movieDetails.original_title,
        adult: movieDetails.adult ? 'true' : 'false',
      });
      
      const movie = await Movie.create({
        id: movieDetails.id, // Use the TMDB movie ID as the primary key
        imdbId: movieDetails.imdb_id,
        adult: movieDetails.adult ? 'true' : 'false',
        budget: movieDetails.budget || null,
        original_title: movieDetails.original_title,
        popularity: movieDetails.popularity,
        release_date: movieDetails.release_date || null,
        revenue: movieDetails.revenue || null,
        runtime: movieDetails.runtime || null,
        tagline: movieDetails.tagline || null,
        vote_average: movieDetails.vote_average,
        vote_count: movieDetails.vote_count
      }, { transaction });

      console.log('Movie created successfully with TMDB ID:', movieDetails.id);
      
      // Use the TMDB movie ID that we just inserted
      const movieId = movieDetails.id;
      console.log('Using movie ID:', movieId, 'Type:', typeof movieId);
      
      if (!movieId || movieId === null || movieId === undefined || isNaN(movieId)) {
        throw new Error(`Invalid TMDB movie ID: ${movieId} (type: ${typeof movieId})`);
      }

      // Save genres
      if (movieDetails.genres && movieDetails.genres.length > 0) {
        const genrePromises = movieDetails.genres.map(genre =>
          Genre.create({
            movieId,
            genre: genre.name
          }, { transaction })
        );
        await Promise.all(genrePromises);
      }

      // Save production companies
      if (movieDetails.production_companies && movieDetails.production_companies.length > 0) {
        const companyPromises = movieDetails.production_companies.map(company =>
          ProductionCompany.create({
            movieId,
            production_company: company.name
          }, { transaction })
        );
        await Promise.all(companyPromises);
      }

      // Save production countries
      if (movieDetails.production_countries && movieDetails.production_countries.length > 0) {
        const countryPromises = movieDetails.production_countries.map(country =>
          ProductionCountry.create({
            movieId,
            production_country: country.name
          }, { transaction })
        );
        await Promise.all(countryPromises);
      }

      // Save spoken languages
      if (movieDetails.spoken_languages && movieDetails.spoken_languages.length > 0) {
        const languagePromises = movieDetails.spoken_languages.map(language =>
          SpokenLanguage.create({
            movieId,
            language: language.name
          }, { transaction })
        );
        await Promise.all(languagePromises);
      }

      // Save all cast members
      if (credits.cast && credits.cast.length > 0) {
        const castPromises = credits.cast.map(castMember =>
          Cast.create({
            movieId,
            name: castMember.name,
            character: castMember.character || null,
            gender: castMember.gender || null, // TMDB gender codes: 0=unspecified, 1=female, 2=male, 3=non-binary
            order: castMember.order || 0
          }, { transaction })
        );
        await Promise.all(castPromises);
      }

      // Save all crew members
      if (credits.crew && credits.crew.length > 0) {
        const crewPromises = credits.crew.map(crewMember =>
          Crew.create({
            movieId,
            name: crewMember.name,
            job: crewMember.job || null,
            department: crewMember.department || null,
            gender: crewMember.gender || null // TMDB gender codes: 0=unspecified, 1=female, 2=male, 3=non-binary
          }, { transaction })
        );
        await Promise.all(crewPromises);
      }

      // Save all keywords
      if (keywords.keywords && keywords.keywords.length > 0) {
        const keywordPromises = keywords.keywords.map(keyword =>
          Keyword.create({
            movieId,
            keyword: keyword.name
          }, { transaction })
        );
        await Promise.all(keywordPromises);
      }

      await transaction.commit();
      
      // Return the complete movie data
      return movie.toJSON();

    } catch (error) {
      await transaction.rollback();
      console.error('Error saving movie to database:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Movie data being saved:', {
        movieId: movieDetails.id,
        imdbId: movieDetails.imdb_id,
        adult: movieDetails.adult,
        budget: movieDetails.budget,
        original_title: movieDetails.original_title,
        popularity: movieDetails.popularity,
        release_date: movieDetails.release_date,
        revenue: movieDetails.revenue,
        runtime: movieDetails.runtime,
        tagline: movieDetails.tagline,
        vote_average: movieDetails.vote_average,
        vote_count: movieDetails.vote_count
      });
      throw new Error(`Failed to save movie to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete movie import workflow
   */
  static async importMovie(imdbId: string): Promise<{
    success: boolean;
    message: string;
    movie?: any;
    alreadyExists?: boolean;
  }> {
    try {
      // Step 1: Validate IMDb ID
      if (!this.isValidImdbId(imdbId)) {
        return {
          success: false,
          message: 'Invalid IMDb ID. It must be at least 9 characters long and start with "tt".'
        };
      }

      // Step 2: Check if movie already exists in database
      const existingMovie = await this.isMovieInDatabase(imdbId);
      if (existingMovie.exists) {
        return {
          success: true,
          message: 'Movie already exists in database',
          movie: existingMovie.movie,
          alreadyExists: true
        };
      }

      // Step 3: Find movie in TMDB by IMDb ID
      const tmdbId = await this.findMovieByImdbId(imdbId);
      if (!tmdbId) {
        return {
          success: false,
          message: 'Movie not found in TMDB database'
        };
      }

      // Step 4: Fetch movie details, credits, and keywords from TMDB
      const [movieDetails, credits, keywords] = await Promise.all([
        this.fetchMovieDetails(tmdbId),
        this.fetchMovieCredits(tmdbId),
        this.fetchMovieKeywords(tmdbId)
      ]);

      // Step 5: Save movie to database
      const savedMovie = await this.saveMovieToDatabase(movieDetails, credits, keywords);

      return {
        success: true,
        message: 'Movie imported successfully',
        movie: savedMovie,
        alreadyExists: false
      };

    } catch (error) {
      console.error('Movie import error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred during import'
      };
    }
  }
}