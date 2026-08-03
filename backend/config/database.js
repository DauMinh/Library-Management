// Cấu hình kết nối Cơ sở dữ liệu MySQL bằng Sequelize
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Nạp biến môi trường từ file .env

// Tạo đối tượng Sequelize kết nối tới MySQL database
const sequelize = new Sequelize(
  process.env.DB_NAME, // Tên database: library_db
  process.env.DB_USER, // User MySQL: root
  process.env.DB_PASS, // Mật khẩu MySQL: 07112005
  {
    host: process.env.DB_HOST, // Host: localhost
    port: process.env.DB_PORT || 3306, // Port: 3306
    dialect: 'mysql', // Loại CSDL: mysql (tương thích MariaDB trong XAMPP)
    logging: console.log, // In câu lệnh SQL ra terminal để dễ debug (có thể tắt bằng false)
    timezone: '+07:00', // Đặt múi giờ Việt Nam
    define: {
      timestamps: false // Ẩn mặc định createdAt/updatedAt tự sinh của Sequelize (mình tự quản lý nếu cần)
    }
  }
);

module.exports = sequelize;
