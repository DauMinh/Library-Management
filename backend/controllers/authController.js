// Controller xử lý Đăng nhập & Tạo tài khoản Admin mặc định
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 1. Khởi tạo tài khoản Admin mặc định (dùng khi mới chạy project)
exports.seedAdmin = async (req, res) => {
  try {
    // Kiểm tra xem đã có tài khoản admin nào chưa
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Tài khoản Admin đã tồn tại từ trước.',
        username: existingAdmin.username
      });
    }

    // Hash mật khẩu mặc định "admin123"
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    // Tạo tài khoản admin mới
    const newAdmin = await User.create({
      username: 'admin',
      password_hash: password_hash,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Khởi tạo tài khoản Admin thành công!',
      account: {
        username: newAdmin.username,
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Lỗi seedAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi khởi tạo tài khoản Admin!',
      error: error.message
    });
  }
};

// 2. Đăng nhập hệ thống (POST /api/auth/login)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ Username và Password!'
      });
    }

    // Tìm user theo username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
      });
    }

    // So sánh mật khẩu bằng bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
      });
    }

    // Tạo JWT Token có thời hạn 24 giờ
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi login:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi xử lý đăng nhập!',
      error: error.message
    });
  }
};

// 3. Tạo tài khoản admin mới (chỉ admin mới có quyền) (POST /api/auth/create-admin)
exports.createAdmin = async (req, res) => {
  try {
    // Kiểm tra xem user hiện tại có phải admin không
    const currentUser = await User.findByPk(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Admin mới có quyền tạo tài khoản Admin mới!'
      });
    }

    const { username, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ Username và Password!'
      });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác!'
      });
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Tạo tài khoản admin mới
    const newAdmin = await User.create({
      username: username.trim(),
      password_hash: password_hash,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản Admin mới thành công!',
      account: {
        id: newAdmin.id,
        username: newAdmin.username,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Lỗi createAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tạo tài khoản Admin!',
      error: error.message
    });
  }
};
