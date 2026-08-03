// Khởi tạo các models và định nghĩa mối quan hệ (Associations) giữa các bảng
const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');
const Member = require('./Member');
const BorrowRecord = require('./BorrowRecord');

// Định nghĩa quan hệ (Foreign Keys)
// 1. Một phiếu mượn (BorrowRecord) thuộc về một Cuốn sách (Book)
BorrowRecord.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });
Book.hasMany(BorrowRecord, { foreignKey: 'book_id', as: 'borrowRecords' });

// 2. Một phiếu mượn (BorrowRecord) thuộc về một Thành viên (Member)
BorrowRecord.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
Member.hasMany(BorrowRecord, { foreignKey: 'member_id', as: 'borrowRecords' });

// Xuất sequelize instance và tất cả các models để dễ dàng import ở controllers
module.exports = {
  sequelize,
  User,
  Book,
  Member,
  BorrowRecord
};
