// Controller xử lý Quản lý Thành viên / Độc giả (Member Management)
const { Op } = require('sequelize');
const { Member, BorrowRecord } = require('../models');

// 1. Lấy danh sách thành viên (GET /api/members)
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.findAll({
      order: [['id', 'DESC']]
    });
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Lỗi getAllMembers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách thành viên!',
      error: error.message
    });
  }
};

// 2. Tìm kiếm thành viên (GET /api/members/search?q=...)
exports.searchMembers = async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query.trim()) {
      const members = await Member.findAll({ order: [['id', 'DESC']] });
      return res.json({ success: true, data: members });
    }

    const members = await Member.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { phone: { [Op.like]: `%${query}%` } },
          { address: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Lỗi searchMembers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tìm kiếm thành viên!',
      error: error.message
    });
  }
};

// 3. Thêm thành viên mới (POST /api/members)
exports.createMember = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Họ và tên thành viên không được để trống!'
      });
    }

    const newMember = await Member.create({
      name: name.trim(),
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      join_date: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: 'Thêm thành viên mới thành công!',
      data: newMember
    });
  } catch (error) {
    console.error('Lỗi createMember:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thêm thành viên!',
      error: error.message
    });
  }
};

// 4. Cập nhật thông tin thành viên (PUT /api/members/:id)
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành viên với ID tương ứng!'
      });
    }

    await member.update({
      name: name ? name.trim() : member.name,
      email: email !== undefined ? (email ? email.trim() : null) : member.email,
      phone: phone !== undefined ? (phone ? phone.trim() : null) : member.phone,
      address: address !== undefined ? (address ? address.trim() : null) : member.address
    });

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành viên thành công!',
      data: member
    });
  } catch (error) {
    console.error('Lỗi updateMember:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật thành viên!',
      error: error.message
    });
  }
};

// 5. Xóa thành viên (DELETE /api/members/:id)
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành viên cần xóa!'
      });
    }

    // Kiểm tra xem thành viên có đang mượn sách chưa trả không
    const activeBorrow = await BorrowRecord.findOne({
      where: {
        member_id: id,
        status: 'borrowed'
      }
    });

    if (activeBorrow) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa thành viên này vì đang mượn sách chưa trả!'
      });
    }

    await member.destroy();

    res.json({
      success: true,
      message: 'Đã xóa thành viên thành công!'
    });
  } catch (error) {
    console.error('Lỗi deleteMember:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa thành viên!',
      error: error.message
    });
  }
};
