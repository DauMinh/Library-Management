// Controller xử lý Thống kê số liệu hệ thống (Statistics Dashboard)
const { Op } = require('sequelize');
const { Book, Member, BorrowRecord } = require('../models');

// Lấy tổng quan các số liệu thống kê (GET /api/stats)
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Tổng số đầu sách & tổng số bản sao sách
    const totalBookTitles = await Book.count();
    const totalBookQuantity = await Book.sum('quantity') || 0;

    // 2. Tổng số thành viên
    const totalMembers = await Member.count();

    // 3. Số phiếu đang được mượn
    const currentlyBorrowed = await BorrowRecord.count({
      where: { status: 'borrowed' }
    });

    // 4. Số phiếu mượn đã quá hạn (đang mượn và quá ngày hẹn trả)
    const overdueRecords = await BorrowRecord.count({
      where: {
        status: 'borrowed',
        due_date: { [Op.lt]: todayStr }
      }
    });

    // 5. Tổng tiền phí phạt đã thu
    const totalLateFees = await BorrowRecord.sum('late_fee') || 0;

    res.json({
      success: true,
      data: {
        total_books: totalBookTitles,
        total_book_copies: totalBookQuantity,
        total_members: totalMembers,
        currently_borrowed: currentlyBorrowed,
        overdue_records: overdueRecords,
        total_late_fees: totalLateFees
      }
    });
  } catch (error) {
    console.error('Lỗi getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy dữ liệu thống kê!',
      error: error.message
    });
  }
};
