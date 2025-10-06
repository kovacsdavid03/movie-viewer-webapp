import { DataTypes, Sequelize } from 'sequelize';

export const createProductionCountryModel = (sequelize: Sequelize) => {
  return sequelize.define('ProductionCountry', {
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
        primaryKey: true,
    },
    production_country: {
      type: DataTypes.STRING(255),
      allowNull: true,
        primaryKey: true,
    },
  }, {
    tableName: 'production_countries',
    timestamps: false,
  });
};