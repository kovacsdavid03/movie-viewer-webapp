import { DataTypes, Sequelize } from 'sequelize';

export const createGenreModel = (sequelize: Sequelize) => {
  return sequelize.define('Genre', {
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
        primaryKey: true,
    },
    genre: {
      type: DataTypes.STRING(50),
      allowNull: true,
        primaryKey: true,
    },
  }, {
    tableName: 'genres',
    timestamps: false,
  });
};