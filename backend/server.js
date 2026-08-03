// File chính ứng dụng backend Express
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import sequelize instance, models, và controllers/routes
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware cho phép Frontend gọi API (CORS) & đọc dữ liệu JSON gửi lên
app.use(cors());
app.use(express.json());

// Phục vụ các file giao diện tĩnh (HTML, CSS, JS) từ thư mục frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Đăng ký các Routes của ứng dụng
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/stats', statsRoutes);

// Route mặc định khi vào http://localhost:5000 -> tự động mở login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// API Test đơn giản - Kiểm tra kết nối DB và tự động tạo bảng nếu chưa có
app.get('/api/test', async (req, res) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const reqMock = {};
    const resMock = { json: () => {}, status: () => ({ json: () => {} }) };
    await authController.seedAdmin(reqMock, resMock);
    
    res.json({
      success: true,
      message: 'Kết nối cơ sở dữ liệu MySQL thành công và đã đồng bộ hóa 4 bảng (kèm tài khoản admin)!'
    });
  } catch (error) {
    console.error('Lỗi kết nối CSDL:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kết nối cơ sở dữ liệu MySQL!',
      error: error.message
    });
  }
});

// Khởi động server Express
app.listen(PORT, async () => {
  console.log(`=== Server đang chạy tại: http://localhost:${PORT} ===`);
  console.log(`=== Giao diện đăng nhập: http://localhost:${PORT}/login.html ===`);

  try {
    await sequelize.sync();
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const count = await User.count();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await User.create({ username: 'admin', password_hash: hash, role: 'admin' });
      console.log('=== [Tự động] Đã tạo tài khoản admin mặc định: admin / admin123 ===');
    }
  } catch (e) {
    console.error('Lỗi khi tự động sync DB tại server startup:', e.message);
  }
});
