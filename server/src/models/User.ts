import { DataTypes, Sequelize } from 'sequelize';

export const createUserModel = (sequelize: Sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('GETDATE()'),
    },
  }, {
    tableName: 'Users',
    timestamps: false,
  });
};