// File xử lý giao diện & tương tác Mượn / Trả Sách (borrow.html)

let borrowModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  renderUserInfo();

  const modalEl = document.getElementById('borrowModal');
  if (modalEl) {
    borrowModalInstance = new bootstrap.Modal(modalEl);
  }

  loadBorrowRecords();

  const borrowForm = document.getElementById('borrowForm');
  if (borrowForm) {
    borrowForm.addEventListener('submit', handleCreateBorrow);
  }
});

/**
 * 1. Tải danh sách phiếu mượn từ API và render bảng HTML
 */
async function loadBorrowRecords() {
  const tableBody = document.getElementById('borrowTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="9" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải danh sách phiếu mượn...</p>
      </td>
    </tr>
  `;

  const res = await apiFetch('/borrow');

  if (!res || !res.ok || !res.data.success) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-danger py-4">
          Không thể tải danh sách phiếu mượn. Vui lòng kiểm tra lại!
        </td>
      </tr>
    `;
    return;
  }

  const records = res.data.data;

  if (records.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted py-4">
          📑 Chưa có lượt mượn sách nào trong hệ thống.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = records.map((record, index) => {
    const bookTitle = record.book ? record.book.title : 'Sách đã bị xóa';
    const memberName = record.member ? record.member.name : 'Độc giả đã bị xóa';
    const memberPhone = record.member ? (record.member.phone || '') : '';

    // Trạng thái & Thẻ Badge
    let statusBadge = '';
    if (record.status === 'returned') {
      statusBadge = `<span class="badge bg-success">Đã trả</span>`;
    } else if (record.isOverdue) {
      statusBadge = `<span class="badge bg-danger">Quá hạn</span>`;
    } else {
      statusBadge = `<span class="badge bg-warning text-dark">Đang mượn</span>`;
    }

    // Phí phạt
    const lateFeeDisplay = record.late_fee > 0 
      ? `<strong class="text-danger">${parseInt(record.late_fee).toLocaleString('vi-VN')} VNĐ</strong>` 
      : '<span class="text-muted">0 VNĐ</span>';

    return `
      <tr class="${record.isOverdue ? 'table-danger' : ''}">
        <td><strong>#${record.id}</strong></td>
        <td class="fw-semibold text-dark">${escapeHtml(bookTitle)}</td>
        <td>
          <div>${escapeHtml(memberName)}</div>
          <small class="text-muted">${escapeHtml(memberPhone)}</small>
        </td>
        <td>${formatDate(record.borrow_date)}</td>
        <td><strong class="${record.isOverdue ? 'text-danger' : 'text-primary'}">${formatDate(record.due_date)}</strong></td>
        <td>${record.return_date ? formatDate(record.return_date) : '<span class="text-muted">--</span>'}</td>
        <td>${statusBadge}</td>
        <td>${lateFeeDisplay}</td>
        <td>
          ${record.status === 'borrowed' ? `
            <button class="btn btn-sm btn-success fw-bold" onclick="confirmReturnBook(${record.id}, '${escapeHtml(bookTitle)}')">
              ↩️ Trả Sách
            </button>
          ` : `
            <span class="text-muted small">✓ Đã hoàn tất</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 2. Tải danh sách Sách và Thành viên nạp vào 2 thẻ Dropdown Select trong Modal
 */
async function loadDropdownData() {
  const selectBook = document.getElementById('selectBook');
  const selectMember = document.getElementById('selectMember');

  selectBook.innerHTML = '<option value="">-- Đang tải danh sách sách --</option>';
  selectMember.innerHTML = '<option value="">-- Đang tải danh sách thành viên --</option>';

  // Lấy danh sách Sách & Thành viên đồng thời
  const [resBooks, resMembers] = await Promise.all([
    apiFetch('/books'),
    apiFetch('/members')
  ]);

  // Load Dropdown Sách (chỉ hiển thị các cuốn có available_quantity > 0)
  if (resBooks && resBooks.ok && resBooks.data.success) {
    const availableBooks = resBooks.data.data.filter(b => b.available_quantity > 0);
    if (availableBooks.length === 0) {
      selectBook.innerHTML = '<option value="">❌ Không còn sách nào khả dụng trong kho</option>';
    } else {
      selectBook.innerHTML = '<option value="">-- Chọn cuốn sách mượn --</option>' + 
        availableBooks.map(b => `<option value="${b.id}">${escapeHtml(b.title)} (Còn: ${b.available_quantity}/${b.quantity})</option>`).join('');
    }
  }

  // Load Dropdown Thành viên
  if (resMembers && resMembers.ok && resMembers.data.success) {
    const members = resMembers.data.data;
    if (members.length === 0) {
      selectMember.innerHTML = '<option value="">❌ Chưa có thành viên nào trong hệ thống</option>';
    } else {
      selectMember.innerHTML = '<option value="">-- Chọn thành viên mượn --</option>' + 
        members.map(m => `<option value="${m.id}">${escapeHtml(m.name)} ${m.phone ? `(${m.phone})` : ''}</option>`).join('');
    }
  }
}

/**
 * 3. Mở Modal Tạo Phiếu Mượn Sách
 */
async function openCreateBorrowModal() {
  document.getElementById('borrowForm').reset();
  
  // Tự động tính ngày hẹn trả mặc định (14 ngày tính từ hôm nay)
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 14);
  document.getElementById('inputDueDate').value = defaultDue.toISOString().split('T')[0];

  await loadDropdownData();
  borrowModalInstance.show();
}

/**
 * 4. Xử lý Submit Tạo phiếu mượn
 */
async function handleCreateBorrow(e) {
  e.preventDefault();

  const book_id = document.getElementById('selectBook').value;
  const member_id = document.getElementById('selectMember').value;
  const due_date = document.getElementById('inputDueDate').value;

  if (!book_id || !member_id) {
    alert('Vui lòng chọn đầy đủ Sách và Thành viên mượn!');
    return;
  }

  const res = await apiFetch('/borrow', {
    method: 'POST',
    body: { book_id, member_id, due_date }
  });

  if (res && res.ok && res.data.success) {
    alert('Tạo phiếu mượn sách thành công!');
    borrowModalInstance.hide();
    
    // ĐẶC BIỆT LƯU Ý: Tải lại danh sách phiếu mượn chủ động sau khi Thêm
    loadBorrowRecords();
  } else {
    alert((res && res.data && res.data.message) || 'Lỗi khi tạo phiếu mượn!');
  }
}

/**
 * 5. Xử lý Trả sách & Tính phí phạt
 */
async function confirmReturnBook(id, bookTitle) {
  if (confirm(`Xác nhận độc giả đã trả cuốn sách "${bookTitle}"?`)) {
    const res = await apiFetch(`/borrow/${id}/return`, {
      method: 'PUT'
    });

    if (res && res.ok && res.data.success) {
      alert(res.data.message || 'Xử lý trả sách thành công!');
      // ĐẶC BIỆT LƯU Ý: Tải lại danh sách phiếu mượn chủ động sau khi Trả sách
      loadBorrowRecords();
    } else {
      alert((res && res.data && res.data.message) || 'Lỗi khi xử lý trả sách!');
    }
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
