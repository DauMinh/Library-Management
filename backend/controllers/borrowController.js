// Controller xử lý Mượn / Trả Sách (Borrow & Return Tracking)
const { BorrowRecord, Book, Member } = require('../models');

// 1. Lấy danh sách tất cả các phiếu mượn (GET /api/borrow)
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const records = await BorrowRecord.findAll({
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn'] },
        { model: Member, as: 'member', attributes: ['id', 'name', 'phone', 'email'] }
      ],
      order: [['id', 'DESC']]
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // Tự động kiểm tra cập nhật trạng thái trễ hạn (overdue) trên giao diện nếu chưa trả sách
    const formattedRecords = records.map(record => {
      const recData = record.toJSON();
      if (recData.status === 'borrowed' && recData.due_date < todayStr) {
        recData.isOverdue = true;
      } else {
        recData.isOverdue = false;
      }
      return recData;
    });

    res.json({
      success: true,
      data: formattedRecords
    });
  } catch (error) {
    console.error('Lỗi getAllBorrowRecords:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách phiếu mượn!',
      error: error.message
    });
  }
};

// 2. Tạo phiếu mượn sách mới (POST /api/borrow)
exports.createBorrowRecord = async (req, res) => {
  try {
    const { book_id, member_id, due_date } = req.body;

    if (!book_id || !member_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn Sách và Thành viên mượn!'
      });
    }

    // 1. Kiểm tra sự tồn tại và số lượng khả dụng của Sách
    const book = await Book.findByPk(book_id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin cuốn sách này!'
      });
    }

    if (book.available_quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `Sách "${book.title}" hiện đã hết trong kho (Số lượng khả dụng: 0)!`
      });
    }

    // 2. Kiểm tra sự tồn tại của Thành viên
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin thành viên này!'
      });
    }

    // 3. Tính ngày hẹn trả (mặc định +14 ngày nếu không truyền)
    let dueDateStr = due_date;
    if (!dueDateStr) {
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14);
      dueDateStr = defaultDue.toISOString().split('T')[0];
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 4. Tạo phiếu mượn
    const newRecord = await BorrowRecord.create({
      book_id: parseInt(book_id),
      member_id: parseInt(member_id),
      borrow_date: todayStr,
      due_date: dueDateStr,
      status: 'borrowed',
      late_fee: 0
    });

    // 5. Giảm số lượng khả dụng (available_quantity) của sách đi 1
    await book.update({
      available_quantity: book.available_quantity - 1
    });

    res.status(201).json({
      success: true,
      message: 'Tạo phiếu mượn sách thành công!',
      data: newRecord
    });
  } catch (error) {
    console.error('Lỗi createBorrowRecord:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo phiếu mượn sách!',
      error: error.message
    });
  }
};

// 3. Trả sách & Tính phí phạt quá hạn (PUT /api/borrow/:id/return)
exports.returnBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm phiếu mượn
    const record = await BorrowRecord.findByPk(id, {
      include: [{ model: Book, as: 'book' }]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin phiếu mượn!'
      });
    }

    if (record.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Phiếu mượn này đã được trả từ trước!'
      });
    }

    const today = new Date();
    const returnDateStr = today.toISOString().split('T')[0];

    // Tính số ngày quá hạn (nếu có)
    const dueDate = new Date(record.due_date);
    const returnDate = new Date(returnDateStr);

    let lateFee = 0;
    const timeDiff = returnDate.getTime() - dueDate.getTime();
    const overdueDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (overdueDays > 0) {
      // Mỗi ngày quá hạn phạt 5.000 VNĐ
      lateFee = overdueDays * 5000;
    }

    // Cập nhật phiếu mượn
    await record.update({
      return_date: returnDateStr,
      status: 'returned',
      late_fee: lateFee
    });

    // Tăng lại số lượng khả dụng của sách lên 1
    if (record.book) {
      await record.book.update({
        available_quantity: record.book.available_quantity + 1
      });
    }

    res.json({
      success: true,
      message: overdueDays > 0 
        ? `Trả sách thành công! Sách quá hạn ${overdueDays} ngày, phí phạt: ${lateFee.toLocaleString('vi-VN')} VNĐ`
        : 'Trả sách đúng hạn thành công!',
      data: {
        record: record,
        overdue_days: Math.max(0, overdueDays),
        late_fee: lateFee
      }
    });
  } catch (error) {
    console.error('Lỗi returnBook:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xử lý trả sách!',
      error: error.message
    });
  }
};
