'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TransactionInfoEachDays', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      stock_no: {
        type: Sequelize.INTEGER
      },
      shares_traded: {
        type: Sequelize.INTEGER
      },
      turnover: {
        type: Sequelize.INTEGER
      },
      opening_price: {
        type: Sequelize.INTEGER
      },
      max_price: {
        type: Sequelize.INTEGER
      },
      min_price: {
        type: Sequelize.INTEGER
      },
      closing_price: {
        type: Sequelize.INTEGER
      },
      price_difference: {
        type: Sequelize.STRING
      },
      transaction_number: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TransactionInfoEachDays');
  }
};