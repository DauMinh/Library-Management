// Routes Quản lý Sách
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authenticateToken = require('../middleware/auth');

// Route công khai hoặc cần đăng nhập (Lấy danh sách & Tìm kiếm)
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);

// Routes yêu cầu xác thực JWT (Thêm, Sửa, Xóa)
router.post('/', authenticateToken, bookController.createBook);
router.put('/:id', authenticateToken, bookController.updateBook);
router.delete('/:id', authenticateToken, bookController.deleteBook);

module.exports = router;
