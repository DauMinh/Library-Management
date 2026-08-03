// Routes xử lý Xác thực (Authentication)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route Đăng nhập (POST /api/auth/login)
router.post('/login', authController.login);

// Route Tự động tạo Admin ban đầu (POST /api/auth/seed-admin)
router.post('/seed-admin', authController.seedAdmin);

module.exports = router;
