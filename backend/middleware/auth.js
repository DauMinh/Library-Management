// Middleware xác thực JWT Token cho các routes cần bảo mật
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Lấy chuỗi Authorization từ Header (định dạng: "Bearer <TOKEN>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Nếu không có Token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Truy cập bị từ chối! Bạn chưa đăng nhập hoặc thiếu Token.'
    });
  }

  // Kiểm tra tính hợp lệ của Token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn!'
      });
    }

    // Đính kèm thông tin user đã mã hóa trong token vào đối tượng req để sử dụng ở controller
    req.user = user;
    next(); // Cho phép tiếp tục đến controller chính
  });
};

module.exports = authenticateToken;
