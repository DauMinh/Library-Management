// Model Member - Đại diện cho bảng Members trong CSDL
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  join_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Members',
  timestamps: false
});

module.exports = Member;
