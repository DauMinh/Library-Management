// Controller xử lý các chức năng Quản lý Sách (Book Management)
const { Op } = require('sequelize');
const { Book, BorrowRecord } = require('../models');

// 1. Lấy danh sách tất cả sách (GET /api/books)
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['id', 'DESC']]
    });
    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Lỗi getAllBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách sách!',
      error: error.message
    });
  }
};

// 2. Tìm kiếm sách theo tiêu đề, tác giả hoặc thể loại (GET /api/books/search?q=...)
exports.searchBooks = async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query.trim()) {
      // Nếu không nhập từ khóa thì trả về toàn bộ danh sách
      const books = await Book.findAll({ order: [['id', 'DESC']] });
      return res.json({ success: true, data: books });
    }

    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { author: { [Op.like]: `%${query}%` } },
          { category: { [Op.like]: `%${query}%` } },
          { isbn: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Lỗi searchBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tìm kiếm sách!',
      error: error.message
    });
  }
};

// 3. Thêm sách mới (POST /api/books)
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;

    // Kiểm tra trường bắt buộc
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Tên sách và Tác giả không được để trống!'
      });
    }

    const numQuantity = parseInt(quantity) || 1;

    const newBook = await Book.create({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn ? isbn.trim() : null,
      category: category ? category.trim() : null,
      quantity: numQuantity,
      available_quantity: numQuantity
    });

    res.status(201).json({
      success: true,
      message: 'Thêm sách mới thành công!',
      data: newBook
    });
  } catch (error) {
    console.error('Lỗi createBook:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thêm sách!',
      error: error.message
    });
  }
};

// 4. Cập nhật thông tin sách (PUT /api/books/:id)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, category, quantity } = req.body;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách với ID tương ứng!'
      });
    }

    const oldQuantity = book.quantity;
    const newQuantity = parseInt(quantity) || book.quantity;
    
    // Tính toán lại số lượng có sẵn (available_quantity) khi thay đổi tổng số lượng
    const diff = newQuantity - oldQuantity;
    let newAvailable = book.available_quantity + diff;
    if (newAvailable < 0) newAvailable = 0;

    await book.update({
      title: title ? title.trim() : book.title,
      author: author ? author.trim() : book.author,
      isbn: isbn !== undefined ? (isbn ? isbn.trim() : null) : book.isbn,
      category: category !== undefined ? (category ? category.trim() : null) : book.category,
      quantity: newQuantity,
      available_quantity: newAvailable
    });

    res.json({
      success: true,
      message: 'Cập nhật thông tin sách thành công!',
      data: book
    });
  } catch (error) {
    console.error('Lỗi updateBook:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật sách!',
      error: error.message
    });
  }
};

// 5. Xóa sách (DELETE /api/books/:id)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách cần xóa!'
      });
    }

    // Kiểm tra xem sách có phiếu mượn đang hoạt động không (status = 'borrowed')
    const activeBorrow = await BorrowRecord.findOne({
      where: {
        book_id: id,
        status: 'borrowed'
      }
    });

    if (activeBorrow) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa cuốn sách này vì đang được cho mượn. Vui lòng chờ độc giả trả sách trước!'
      });
    }

    // Xóa sách
    await book.destroy();

    res.json({
      success: true,
      message: 'Đã xóa sách thành công!'
    });
  } catch (error) {
    console.error('Lỗi deleteBook:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa sách!',
      error: error.message
    });
  }
};
