// Model Book - Đại diện cho bảng Books trong CSDL
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isbn: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  available_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Books',
  timestamps: false
});

module.exports = Book;
