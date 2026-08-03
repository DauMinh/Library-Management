// Model BorrowRecord - Đại diện cho bảng BorrowRecords trong CSDL
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BorrowRecord = sequelize.define('BorrowRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  borrow_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
    allowNull: false,
    defaultValue: 'borrowed'
  },
  late_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'BorrowRecords',
  timestamps: false
});

module.exports = BorrowRecord;
