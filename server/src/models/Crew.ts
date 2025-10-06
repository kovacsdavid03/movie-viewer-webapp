import { DataTypes, Sequelize } from 'sequelize';

export const createCrewModel = (sequelize: Sequelize) => {
  return sequelize.define('Crew', {
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    job: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
        primaryKey: true,
    },
  }, {
    tableName: 'crew',
    timestamps: false,
  });
};