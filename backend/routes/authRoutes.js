// Routes xử lý Xác thực (Authentication)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

// Route Đăng nhập (POST /api/auth/login)
router.post('/login', authController.login);

// Route Tự động tạo Admin ban đầu (POST /api/auth/seed-admin)
router.post('/seed-admin', authController.seedAdmin);

// Route Tạo tài khoản Admin mới (chỉ admin mới có quyền) (POST /api/auth/create-admin)
router.post('/create-admin', authenticateToken, authController.createAdmin);

module.exports = router;
