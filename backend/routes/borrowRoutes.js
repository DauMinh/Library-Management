// Routes Quản lý Mượn / Trả Sách
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const authenticateToken = require('../middleware/auth');

// Tất cả thao tác mượn/trả sách đều yêu cầu xác thực JWT của Admin
router.use(authenticateToken);

router.get('/', borrowController.getAllBorrowRecords);
router.post('/', borrowController.createBorrowRecord);
router.put('/:id/return', borrowController.returnBook);

module.exports = router;
