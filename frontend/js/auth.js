// File quản lý Trạng thái Đăng nhập & Xác thực ở Frontend

/**
 * Kiểm tra xem người dùng đã đăng nhập chưa
 * Nếu chưa đăng nhập mà truy cập trang protected -> chuyển về login.html
 */
function checkAuth() {
  const token = localStorage.getItem('token');
  const isLoginPage = window.location.pathname.endsWith('login.html');

  if (!token && !isLoginPage) {
    window.location.href = 'login.html';
  } else if (token && isLoginPage) {
    // Nếu đã đăng nhập mà truy cập trang login -> chuyển đến trang danh sách sách
    window.location.href = 'books.html';
  }
}

/**
 * Lấy thông tin User hiện tại từ localStorage
 */
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Đăng xuất khỏi hệ thống
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

/**
 * Render thông tin admin lên góc giao diện (nếu có element)
 */
function renderUserInfo() {
  const user = getCurrentUser();
  const userElement = document.getElementById('currentUserDisplay');
  if (userElement && user) {
    userElement.innerText = `Xin chào, ${user.username} (${user.role})`;
  }
}
