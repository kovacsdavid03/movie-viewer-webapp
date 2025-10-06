// @ts-ignore
import msnodesqlv8Sequelize from 'msnodesqlv8/lib/sequelize';
import { Sequelize, DataTypes } from 'sequelize';
import { createUserModel } from './models/User';
import { createMovieModel } from './models/Movie';
import { createFavoriteModel } from './models/Favorite';
import { createCastModel } from './models/Cast';
import { createCrewModel } from './models/Crew';
import { createGenreModel } from './models/Genre';
import { createKeywordModel } from './models/Keyword';
import { createProductionCompanyModel } from './models/ProductionCompany';
import { createProductionCountryModel } from './models/ProductionCountry';
import { createSpokenLanguageModel } from './models/SpokenLanguage';

const sequelize = new Sequelize({
  dialect: 'mssql',
  dialectModule: msnodesqlv8Sequelize,
  logging: false,
  dialectOptions: {
    options: {
      connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(LocalDB)\\MSSQLLocalDB;Database=ONLAB;Trusted_Connection=yes;',
    },
  },
  define: {
    timestamps: false,
  },
});

export const User = createUserModel(sequelize);
export const Movie = createMovieModel(sequelize);
export const Favorite = createFavoriteModel(sequelize);
export const Cast = createCastModel(sequelize);
export const Crew = createCrewModel(sequelize);
export const Genre = createGenreModel(sequelize);
export const Keyword = createKeywordModel(sequelize);
export const ProductionCompany = createProductionCompanyModel(sequelize);
export const ProductionCountry = createProductionCountryModel(sequelize);
export const SpokenLanguage = createSpokenLanguageModel(sequelize);

// Set up associations
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