// Routes Thống kê Dashboard
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authenticateToken = require('../middleware/auth');

// Route lấy dữ liệu thống kê (yêu cầu xác thực JWT)
router.get('/', authenticateToken, statsController.getDashboardStats);

module.exports = router;
