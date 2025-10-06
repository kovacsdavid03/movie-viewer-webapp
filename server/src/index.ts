import express, { Request, Response } from 'express';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { User, Movie, Favorite, Cast, Crew, Genre, Keyword, ProductionCompany, ProductionCountry, SpokenLanguage, sequelize } from './db';
import { MovieImportService } from './services/movieImportService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5001;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Sync database
sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => console.error('Database sync failed:', err));

// Register endpoint
app.post(
  '/api/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).trim().escape(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hash = await bcrypt.hash(password, saltRounds);
      const user = await User.create({ email, password: hash });
      return res.status(201).json({ message: 'User registered', userId: user.get('id') });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login endpoint
app.post(
  '/api/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).trim().escape(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const match = await bcrypt.compare(password, user.get('password') as string);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.json({ message: 'Login successful', userId: user.get('id') });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Movie Import endpoints
app.post(
  '/api/import-movie',
  [
    body('imdbId').isString().trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { imdbId } = req.body;
    console.log('Received imdbId:', imdbId, 'Type:', typeof imdbId);

    if (!imdbId) {
      return res.status(400).json({ 
        success: false, 
        error: 'IMDb ID is required' 
      });
    }

    try {
      const result = await MovieImportService.importMovie(imdbId);
      
      if (result.success) {
        const statusCode = result.alreadyExists ? 200 : 201;
        return res.status(statusCode).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (err) {
      console.error('Import movie error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error during movie import' 
      });
    }
  }
);

// Check if movie exists by IMDb ID
app.get('/api/check-movie/:imdbId', async (req: Request, res: Response) => {
  try {
    const { imdbId } = req.params;

    if (!imdbId) {
      return res.status(400).json({ error: 'IMDb ID is required' });
    }

    // Validate IMDb ID format
    if (!MovieImportService.isValidImdbId(imdbId)) {
      return res.status(400).json({ 
        error: 'Invalid IMDb ID format. It must be at least 9 characters long and start with "tt".' 
      });
    }

    const result = await MovieImportService.isMovieInDatabase(imdbId);
    
    return res.json({
      exists: result.exists,
      movie: result.movie || null
    });
  } catch (err) {
    console.error('Check movie error:', err);
    return res.status(500).json({ error: 'Server error while checking movie' });
  }
});

// Validate IMDb ID format endpoint
app.get('/api/validate-imdb/:imdbId', (req, res) => {
  const { imdbId } = req.params;
  
  const isValid = MovieImportService.isValidImdbId(imdbId);
  
  res.json({
    valid: isValid,
    message: isValid 
      ? 'Valid IMDb ID format' 
      : 'Invalid IMDb ID. It must be at least 9 characters long and start with "tt".'
  });
});

// Favorites endpoints
app.post('/api/favorites', async (req: Request, res: Response) => {
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

app.delete('/api/favorites/:userId/:movieId', async (req: Request, res: Response) => {
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

app.get('/api/favorites/:userId', async (req, res) => {
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

app.get('/api/movies/:movieId', async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    
    if (!movieId) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    // Get the main movie details
    const movie = await Movie.findOne({
      where: { id: parseInt(movieId) }
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Get all related data in parallel
    const [cast, crew, genres, keywords, productionCompanies, productionCountries, spokenLanguages] = await Promise.all([
      Cast.findAll({
        where: { movieId: parseInt(movieId) },
        //limit: 10, // Limit cast to top 10
        order: [['name', 'ASC']]
      }),
      Crew.findAll({
        where: { movieId: parseInt(movieId) },
       // limit: 20, // Limit crew to top 20
        order: [['name', 'ASC']]
      }),
      Genre.findAll({
        where: { movieId: parseInt(movieId) }
      }),
      Keyword.findAll({
        where: { movieId: parseInt(movieId) },
        limit: 10 // Limit keywords
      }),
      ProductionCompany.findAll({
        where: { movieId: parseInt(movieId) }
      }),
      ProductionCountry.findAll({
        where: { movieId: parseInt(movieId) }
      }),
      SpokenLanguage.findAll({
        where: { movieId: parseInt(movieId) }
      })
    ]);

    // Structure the response
    const movieDetails = {
      ...movie.toJSON(),
      cast: cast.map(c => c.toJSON()),
      crew: crew.map(c => c.toJSON()),
      genres: genres.map(g => g.get('genre')),
      keywords: keywords.map(k => k.get('keyword')),
      production_companies: productionCompanies.map(pc => pc.get('production_company')),
      production_countries: productionCountries.map(pc => pc.get('production_country')),
      spoken_languages: spokenLanguages.map(sl => sl.get('language'))
    };

    return res.json(movieDetails);
  } catch (err) {
    console.error('Error fetching movie details:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/movies', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 18;
    const offset = (page - 1) * limit;

    // Extract filter parameters
    const search = req.query.search as string;
    const genres = req.query.genres ? (req.query.genres as string).split(',') : [];
    const minYear = req.query.minYear ? parseInt(req.query.minYear as string) : undefined;
    const maxYear = req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const maxRating = req.query.maxRating ? parseFloat(req.query.maxRating as string) : undefined;
    const minPopularity = req.query.minPopularity ? parseFloat(req.query.minPopularity as string) : undefined;
    const maxPopularity = req.query.maxPopularity ? parseFloat(req.query.maxPopularity as string) : undefined;

    // Build where conditions
    const whereConditions: any = {};

    // Search filter
    if (search && search.trim()) {
      whereConditions.original_title = {
        [Op.like]: `%${search.trim()}%`
      };
    }

    // Year filter
    if (minYear || maxYear) {
      whereConditions.release_date = {};
      if (minYear) {
        whereConditions.release_date[Op.gte] = new Date(`${minYear}-01-01`);
      }
      if (maxYear) {
        whereConditions.release_date[Op.lte] = new Date(`${maxYear}-12-31`);
      }
    }

    // Rating filter
    if (minRating !== undefined || maxRating !== undefined) {
      whereConditions.vote_average = {};
      if (minRating !== undefined) {
        whereConditions.vote_average[Op.gte] = minRating;
      }
      if (maxRating !== undefined) {
        whereConditions.vote_average[Op.lte] = maxRating;
      }
    }

    // Popularity filter
    if (minPopularity !== undefined || maxPopularity !== undefined) {
      whereConditions.popularity = {};
      if (minPopularity !== undefined) {
        whereConditions.popularity[Op.gte] = minPopularity;
      }
      if (maxPopularity !== undefined) {
        whereConditions.popularity[Op.lte] = maxPopularity;
      }
    }

    // Genre filter (requires a join with genres table)
    const includeGenres = genres.length > 0 ? [{
      model: Genre,
      as: 'genres',
      attributes: [],
      where: {
        genre: {
          [Op.in]: genres
        }
      },
      required: true
    }] : [];

    const { rows: movies, count } = await Movie.findAndCountAll({
      where: whereConditions,
      include: includeGenres,
      limit,
      offset,
      order: [ ['vote_count', 'DESC'], ['vote_average', 'DESC']],
      distinct: true, // Important when using joins
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      movies,
      totalPages,
      currentPage: page,
      totalMovies: count,
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get available genres
app.get('/api/genres', async (req, res) => {
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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${PORT}`);
});
