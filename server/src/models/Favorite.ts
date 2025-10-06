import { DataTypes, Sequelize } from 'sequelize';

export const createFavoriteModel = (sequelize: Sequelize) => {
  return sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Movies',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('GETDATE()'),
    },
  }, {
    tableName: 'Favorites',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_id']
      }
    ]
  });
};