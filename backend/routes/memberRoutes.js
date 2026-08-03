// Routes Quản lý Thành viên
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authenticateToken = require('../middleware/auth');

// Routes công khai / lấy thông tin
router.get('/', memberController.getAllMembers);
router.get('/search', memberController.searchMembers);

// Routes cần đăng nhập JWT (Thêm, Sửa, Xóa)
router.post('/', authenticateToken, memberController.createMember);
router.put('/:id', authenticateToken, memberController.updateMember);
router.delete('/:id', authenticateToken, memberController.deleteMember);

module.exports = router;
