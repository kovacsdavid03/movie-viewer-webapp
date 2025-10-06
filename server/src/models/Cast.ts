import { DataTypes, Sequelize } from 'sequelize';

export const createCastModel = (sequelize: Sequelize) => {
  return sequelize.define('Cast', {
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    character: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      primaryKey: true,
    },
  }, {
    tableName: 'cast',
    timestamps: false,
  });
};