import { DataTypes, Sequelize } from 'sequelize';

export const createSpokenLanguageModel = (sequelize: Sequelize) => {
  return sequelize.define('SpokenLanguage', {
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
        primaryKey: true,
    },
    language: {
      type: DataTypes.STRING(255),
      allowNull: true,
        primaryKey: true,
    },
  }, {
    tableName: 'spoken_languages',
    timestamps: false,
  });
};