import { Sequelize, DataTypes } from 'sequelize';

// Create in-memory SQLite database for testing
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  define: {
    timestamps: false,
  },
});

// Define simplified models for testing (SQLite compatible)
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Users',
  timestamps: false,
});

export const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  imdbId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  adult: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  budget: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  original_title: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  popularity: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  release_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  revenue: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  runtime: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tagline: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  vote_average: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  vote_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'Movies',
  timestamps: false,
});

export const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Favorites',
  timestamps: false,
});

export const Cast = sequelize.define('Cast', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  character: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'Cast',
  timestamps: false,
});

export const Crew = sequelize.define('Crew', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  job: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'Crew',
  timestamps: false,
});

export const Genre = sequelize.define('Genre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'Genres',
  timestamps: false,
});

export const Keyword = sequelize.define('Keyword', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  keyword: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'Keywords',
  timestamps: false,
});

export const ProductionCompany = sequelize.define('ProductionCompany', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'ProductionCompanies',
  timestamps: false,
});

export const ProductionCountry = sequelize.define('ProductionCountry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'ProductionCountries',
  timestamps: false,
});

export const SpokenLanguage = sequelize.define('SpokenLanguage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'SpokenLanguages',
  timestamps: false,
});

// Set up associations (same as main db.ts)
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Movie.hasMany(Favorite, { foreignKey: 'movie_id', as: 'favorites' });
Favorite.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

// Movie relationships with other tables
Movie.hasMany(Cast, { foreignKey: 'movieId', as: 'cast' });
Cast.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Movie.hasMany(Crew, { foreignKey: 'movieId', as: 'crew' });
Crew.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Movie.hasMany(Genre, { foreignKey: 'movieId', as: 'genres' });
Genre.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Movie.hasMany(Keyword, { foreignKey: 'movieId', as: 'keywords' });
Keyword.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Movie.hasMany(ProductionCompany, { foreignKey: 'movieId', as: 'productionCompanies' });
ProductionCompany.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Movie.hasMany(ProductionCountry, { foreignKey: 'movieId', as: 'productionCountries' });
ProductionCountry.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Movie.hasMany(SpokenLanguage, { foreignKey: 'movieId', as: 'spokenLanguages' });
SpokenLanguage.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

export { sequelize };