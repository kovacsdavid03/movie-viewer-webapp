import { DataTypes, Sequelize } from 'sequelize';

export const createKeywordModel = (sequelize: Sequelize) => {
  return sequelize.define('Keyword', {
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
        primaryKey: true,
    },
    keyword: {
      type: DataTypes.STRING(100),
      allowNull: true,
        primaryKey: true,
    },
  }, {
    tableName: 'keywords',
    timestamps: false,

  });
};