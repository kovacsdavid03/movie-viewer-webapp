import { DataTypes, Sequelize } from 'sequelize';

export const createMovieModel = (sequelize: Sequelize) => {
  return sequelize.define('Movie', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: 'movieId', // Map to the actual database column
    },
    imdbId: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    adult: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    budget: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    original_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    popularity: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    revenue: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    runtime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tagline: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    vote_average: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    vote_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'movies',
    timestamps: false,
  });
};