import { DataTypes, Sequelize } from 'sequelize';

export const createProductionCompanyModel = (sequelize: Sequelize) => {
  return sequelize.define('ProductionCompany', {
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
        primaryKey: true,
    },
    production_company: {
      type: DataTypes.STRING(255),
      allowNull: true,
        primaryKey: true,
    },
  }, {
    tableName: 'production_companies',
    timestamps: false,
  });
};