'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionInfoEachDay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TransactionInfoEachDay.init({
    date: DataTypes.INTEGER,
    stock_no: DataTypes.INTEGER,
    shares_traded: DataTypes.INTEGER,
    turnover: DataTypes.INTEGER,
    opening_price: DataTypes.INTEGER,
    max_price: DataTypes.INTEGER,
    min_price: DataTypes.INTEGER,
    closing_price: DataTypes.INTEGER,
    price_difference: DataTypes.STRING,
    transaction_number: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TransactionInfoEachDay',
    underscored: true,
  });
  return TransactionInfoEachDay;
};