import express, { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Movie, Cast, Crew, Genre, Keyword, ProductionCompany, ProductionCountry, SpokenLanguage } from '../db';

const router = express.Router();

// Get single movie with all details
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    
    if (!movieId || isNaN(parseInt(movieId))) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    const movieIdInt = parseInt(movieId);

    // Get the main movie details
    const movie = await Movie.findOne({
      where: { id: movieIdInt }
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Get all related data in parallel
    const [cast, crew, genres, keywords, productionCompanies, productionCountries, spokenLanguages] = await Promise.all([
      Cast.findAll({
        where: { movieId: movieIdInt },
        order: [['name', 'ASC']]
      }),
      Crew.findAll({
        where: { movieId: movieIdInt },
        order: [['name', 'ASC']]
      }),
      Genre.findAll({
        where: { movieId: movieIdInt }
      }),
      Keyword.findAll({
        where: { movieId: movieIdInt },
        limit: 10 // Limit keywords
      }),
      ProductionCompany.findAll({
        where: { movieId: movieIdInt }
      }),
      ProductionCountry.findAll({
        where: { movieId: movieIdInt }
      }),
      SpokenLanguage.findAll({
        where: { movieId: movieIdInt }
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

// Get movies with filtering and pagination
router.get('/', async (req, res) => {
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
      order: [['vote_count', 'DESC'], ['vote_average', 'DESC']],
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

export default router;