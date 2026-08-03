// File xử lý giao diện & tương tác Quản lý Sách (books.html)

let currentEditBookId = null;
let bookModalInstance = null;

// Tải danh sách sách ngay khi trang web sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  // Kiểm tra xác thực (bắt buộc phải đăng nhập)
  checkAuth();
  renderUserInfo();

  // Khởi tạo Bootstrap Modal instance
  const modalEl = document.getElementById('bookModal');
  if (modalEl) {
    bookModalInstance = new bootstrap.Modal(modalEl);
  }

  // Tải dữ liệu ban đầu
  loadBooks();

  // Sự kiện Tìm kiếm
  const searchInput = document.getElementById('searchInput');
  const btnSearch = document.getElementById('btnSearch');
  
  if (btnSearch && searchInput) {
    btnSearch.addEventListener('click', () => {
      loadBooks(searchInput.value.trim());
    });

    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        loadBooks(searchInput.value.trim());
      }
    });
  }

  // Sự kiện Submit Form (Thêm / Sửa Sách)
  const bookForm = document.getElementById('bookForm');
  if (bookForm) {
    bookForm.addEventListener('submit', handleSaveBook);
  }
});

/**
 * 1. Hàm tải danh sách sách từ API và render ra bảng HTML
 * (Có hỗ trợ lọc theo từ khóa tìm kiếm)
 */
async function loadBooks(query = '') {
  const tableBody = document.getElementById('booksTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải danh sách sách...</p>
      </td>
    </tr>
  `;

  // Xác định endpoint API (toàn bộ hoặc tìm kiếm)
  const endpoint = query ? `/books/search?q=${encodeURIComponent(query)}` : '/books';
  const res = await apiFetch(endpoint);

  if (!res || !res.ok || !res.data.success) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-danger py-4">
          Không thể tải danh sách sách. Vui lòng thử lại!
        </td>
      </tr>
    `;
    return;
  }

  const books = res.data.data;

  if (books.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted py-4">
          🚀 Chưa có cuốn sách nào ${query ? 'phù hợp với từ khóa search' : 'trong hệ thống'}.
        </td>
      </tr>
    `;
    return;
  }

  // Render danh sách ra bảng
  tableBody.innerHTML = books.map((book, index) => `
    <tr>
      <td><strong>${index + 1}</strong></td>
      <td class="fw-semibold text-dark">${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td><span class="badge bg-info text-dark">${escapeHtml(book.category || 'Chưa phân loại')}</span></td>
      <td><code>${escapeHtml(book.isbn || 'N/A')}</code></td>
      <td><span class="badge bg-secondary">${book.quantity}</span></td>
      <td>
        <span class="badge ${book.available_quantity > 0 ? 'bg-success' : 'bg-danger'}">
          ${book.available_quantity} / ${book.quantity}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-warning me-1" onclick="openEditModal(${book.id}, '${escapeHtml(book.title)}', '${escapeHtml(book.author)}', '${escapeHtml(book.isbn || '')}', '${escapeHtml(book.category || '')}', ${book.quantity})">
          ✏️ Sửa
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBook(${book.id}, '${escapeHtml(book.title)}')">
          🗑️ Xóa
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * 2. Mở Modal ở chế độ Thêm mới
 */
function openAddModal() {
  currentEditBookId = null;
  document.getElementById('modalTitle').innerText = '➕ Thêm Sách Mới';
  document.getElementById('bookForm').reset();
  bookModalInstance.show();
}

/**
 * 3. Mở Modal ở chế độ Chỉnh sửa
 */
function openEditModal(id, title, author, isbn, category, quantity) {
  currentEditBookId = id;
  document.getElementById('modalTitle').innerText = '✏️ Chỉnh Sửa Thông Tin Sách';
  
  document.getElementById('bookTitle').value = title;
  document.getElementById('bookAuthor').value = author;
  document.getElementById('bookIsbn').value = isbn;
  document.getElementById('bookCategory').value = category;
  document.getElementById('bookQuantity').value = quantity;

  bookModalInstance.show();
}

/**
 * 4. Xử lý Thêm / Cập nhật Sách
 */
async function handleSaveBook(e) {
  e.preventDefault();

  const title = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const isbn = document.getElementById('bookIsbn').value.trim();
  const category = document.getElementById('bookCategory').value.trim();
  const quantity = parseInt(document.getElementById('bookQuantity').value) || 1;

  if (!title || !author) {
    alert('Vui lòng điền đầy đủ Tên sách và Tác giả!');
    return;
  }

  const payload = { title, author, isbn, category, quantity };
  let res;

  if (currentEditBookId) {
    // Gọi API Cập nhật (PUT)
    res = await apiFetch(`/books/${currentEditBookId}`, {
      method: 'PUT',
      body: payload
    });
  } else {
    // Gọi API Thêm mới (POST)
    res = await apiFetch('/books', {
      method: 'POST',
      body: payload
    });
  }

  if (res && res.ok && res.data.success) {
    alert(res.data.message || 'Thao tác thành công!');
    bookModalInstance.hide();
    
    // ĐẶC BIỆT LƯU Ý: Tải lại dữ liệu chủ động sau khi Thêm/Sửa
    loadBooks();
  } else {
    alert((res && res.data && res.data.message) || 'Có lỗi xảy ra khi lưu sách!');
  }
}

/**
 * 5. Xác nhận và Xóa Sách
 */
async function confirmDeleteBook(id, title) {
  if (confirm(`Bạn có chắc chắn muốn xóa cuốn sách "${title}" khỏi hệ thống?`)) {
    const res = await apiFetch(`/books/${id}`, {
      method: 'DELETE'
    });

    if (res && res.ok && res.data.success) {
      alert('Đã xóa sách thành công!');
      // ĐẶC BIỆT LƯU Ý: Tải lại dữ liệu chủ động sau khi Xóa
      loadBooks();
    } else {
      alert((res && res.data && res.data.message) || 'Không thể xóa sách này!');
    }
  }
}

// Helper escape ký tự đặc biệt phòng chống XSS
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
