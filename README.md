# Website Quản lý Thư viện

Đồ án chuyên ngành — Xây dựng website quản lý thư viện dành cho vai trò quản lý/admin.

**Sinh viên thực hiện:** Đậu Quang Minh — MSSV 2023602456 — Lớp KTPM 02
**Giảng viên hướng dẫn:** Hoàng Quang Huy

## Giới thiệu

Hệ thống hỗ trợ số hóa quy trình quản lý thư viện: quản lý sách, quản lý thành viên, theo dõi mượn/trả sách (tự động tính phí trễ hạn), và thống kê tổng quan hoạt động thư viện.

## Công nghệ sử dụng

**Front-end:** HTML5, CSS3, JavaScript thuần, Bootstrap 5
**Back-end:** Node.js, Express.js
**Database:** MySQL (qua XAMPP), Sequelize ORM
**Xác thực:** JWT (jsonwebtoken), bcryptjs

## Chức năng chính

- Đăng nhập hệ thống (JWT, tài khoản admin mặc định tự tạo khi khởi động lần đầu)
- Quản lý sách: thêm / sửa / xóa / tìm kiếm
- Quản lý thành viên: thêm / sửa / xóa / tìm kiếm
- Lập phiếu mượn sách, kiểm tra tồn kho
- Ghi nhận trả sách, tự động tính phí trễ hạn (5.000đ/ngày trễ)
- Thống kê: tổng số sách, tổng bản sao, tổng thành viên, số đang mượn, số quá hạn, tổng phí trễ hạn đã thu

## Cấu trúc thư mục

```
├── backend/
│   ├── config/          # Cấu hình kết nối database
│   ├── controllers/     # Xử lý logic nghiệp vụ
│   ├── middleware/       # Middleware xác thực JWT
│   ├── models/           # Định nghĩa model Sequelize (User, Book, Member, BorrowRecord)
│   ├── routes/            # Định nghĩa API routes
│   ├── .env               # Biến môi trường (không commit lên git)
│   └── server.js           # File khởi động ứng dụng
└── frontend/
    ├── css/
    ├── js/
    ├── login.html
    ├── books.html
    ├── members.html
    ├── borrow.html
    └── stats.html
```

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js (bản LTS)
- MySQL (khuyến nghị dùng XAMPP)

### Các bước

1. Clone repository:
   ```bash
   git clone <đường-link-repository-này>
   cd <tên-thư-mục>
   ```

2. Cài đặt các package cho backend:
   ```bash
   cd backend
   npm install
   ```

3. Tạo database MySQL tên `library_db` (bật MySQL qua XAMPP trước).

4. Tạo file `.env` trong thư mục `backend/` với nội dung:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=<mật_khẩu_MySQL_của_bạn>
   DB_NAME=library_db
   DB_PORT=3306
   JWT_SECRET=<chuỗi_bí_mật_tùy_ý>
   PORT=5000
   ```

5. Khởi động server:
   ```bash
   node server.js
   ```
   Server tự động đồng bộ tạo bảng và tạo tài khoản admin mặc định nếu bảng Users đang rỗng.

6. Mở trình duyệt vào [http://localhost:5000](http://localhost:5000) — hệ thống sẽ tự chuyển tới trang đăng nhập.

### Tài khoản mặc định

```
Username: admin
Password: admin123
```

## API chính

| Phương thức | Endpoint | Yêu cầu JWT |
|---|---|---|
| POST | `/api/auth/login` | Không |
| GET | `/api/books` | Không |
| POST/PUT/DELETE | `/api/books` | Có |
| GET | `/api/members` | Không |
| POST/PUT/DELETE | `/api/members` | Có |
| GET/POST/PUT | `/api/borrow` | Có |
| GET | `/api/stats` | Có |

## Giấy phép

Đồ án phục vụ mục đích học tập.
