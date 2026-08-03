// Cấu hình URL cơ sở của Backend API
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Hàm dùng chung gửi Request tới API (tự động gắn JWT Token)
 * @param {string} endpoint - Đường dẫn API (vd: '/books', '/auth/login')
 * @param {object} options - Các thuộc tính fetch (method, body, headers,...)
 */
async function apiFetch(endpoint, options = {}) {
  // 1. Lấy JWT Token từ localStorage
  const token = localStorage.getItem('token');

  // 2. Chuẩn bị Headers
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  // Nếu có Token, tự động đính kèm vào Header Authorization
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Kết hợp headers mặc định và headers tùy chỉnh
  options.headers = {
    ...defaultHeaders,
    ...(options.headers || {})
  };

  // Nếu body là object Javascript, tự động stringify sang JSON
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Xử lý trường hợp Token hết hạn hoặc không hợp lệ (401 / 403)
    if (response.status === 401 || response.status === 403) {
      // Nếu không phải đang ở trang đăng nhập thì mới redirect
      if (!window.location.pathname.endsWith('login.html')) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return null;
      }
    }

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Lỗi kết nối API:', error);
    alert('Không thể kết nối đến máy chủ Backend! Vui lòng kiểm tra lại server.');
    return { ok: false, error: error.message };
  }
}
