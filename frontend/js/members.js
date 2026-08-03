// File xử lý giao diện & tương tác Quản lý Thành viên (members.html)

let currentEditMemberId = null;
let memberModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  renderUserInfo();

  const modalEl = document.getElementById('memberModal');
  if (modalEl) {
    memberModalInstance = new bootstrap.Modal(modalEl);
  }

  loadMembers();

  // Sự kiện Tìm kiếm
  const searchInput = document.getElementById('searchInput');
  const btnSearch = document.getElementById('btnSearch');

  if (btnSearch && searchInput) {
    btnSearch.addEventListener('click', () => {
      loadMembers(searchInput.value.trim());
    });

    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        loadMembers(searchInput.value.trim());
      }
    });
  }

  // Sự kiện Submit Form
  const memberForm = document.getElementById('memberForm');
  if (memberForm) {
    memberForm.addEventListener('submit', handleSaveMember);
  }
});

/**
 * 1. Tải danh sách thành viên từ API và render bảng HTML
 */
async function loadMembers(query = '') {
  const tableBody = document.getElementById('membersTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải danh sách thành viên...</p>
      </td>
    </tr>
  `;

  const endpoint = query ? `/members/search?q=${encodeURIComponent(query)}` : '/members';
  const res = await apiFetch(endpoint);

  if (!res || !res.ok || !res.data.success) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger py-4">
          Không thể tải danh sách thành viên. Vui lòng thử lại!
        </td>
      </tr>
    `;
    return;
  }

  const members = res.data.data;

  if (members.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          👥 Chưa có thành viên nào ${query ? 'phù hợp với từ khóa search' : 'trong hệ thống'}.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = members.map((member, index) => `
    <tr>
      <td><strong>${index + 1}</strong></td>
      <td class="fw-semibold text-dark">${escapeHtml(member.name)}</td>
      <td>${escapeHtml(member.email || 'N/A')}</td>
      <td><code>${escapeHtml(member.phone || 'N/A')}</code></td>
      <td>${escapeHtml(member.address || 'N/A')}</td>
      <td><span class="badge bg-secondary">${formatDate(member.join_date)}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-warning me-1" onclick="openEditMemberModal(${member.id}, '${escapeHtml(member.name)}', '${escapeHtml(member.email || '')}', '${escapeHtml(member.phone || '')}', '${escapeHtml(member.address || '')}')">
          ✏️ Sửa
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteMember(${member.id}, '${escapeHtml(member.name)}')">
          🗑️ Xóa
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * 2. Mở Modal Thêm mới thành viên
 */
function openAddMemberModal() {
  currentEditMemberId = null;
  document.getElementById('memberModalTitle').innerText = '➕ Thêm Thành Viên Mới';
  document.getElementById('memberForm').reset();
  memberModalInstance.show();
}

/**
 * 3. Mở Modal Chỉnh sửa thành viên
 */
function openEditMemberModal(id, name, email, phone, address) {
  currentEditMemberId = id;
  document.getElementById('memberModalTitle').innerText = '✏️ Chỉnh Sửa Thông Tin Thành Viên';

  document.getElementById('memberName').value = name;
  document.getElementById('memberEmail').value = email;
  document.getElementById('memberPhone').value = phone;
  document.getElementById('memberAddress').value = address;

  memberModalInstance.show();
}

/**
 * 4. Xử lý Lưu thông tin thành viên (Thêm / Sửa)
 */
async function handleSaveMember(e) {
  e.preventDefault();

  const name = document.getElementById('memberName').value.trim();
  const email = document.getElementById('memberEmail').value.trim();
  const phone = document.getElementById('memberPhone').value.trim();
  const address = document.getElementById('memberAddress').value.trim();

  if (!name) {
    alert('Vui lòng nhập Họ và tên thành viên!');
    return;
  }

  const payload = { name, email, phone, address };
  let res;

  if (currentEditMemberId) {
    res = await apiFetch(`/members/${currentEditMemberId}`, {
      method: 'PUT',
      body: payload
    });
  } else {
    res = await apiFetch('/members', {
      method: 'POST',
      body: payload
    });
  }

  if (res && res.ok && res.data.success) {
    alert(res.data.message || 'Thao tác thành công!');
    memberModalInstance.hide();
    
    // ĐẶC BIỆT LƯU Ý: Tải lại danh sách chủ động sau khi Thêm/Sửa
    loadMembers();
  } else {
    alert((res && res.data && res.data.message) || 'Lỗi khi lưu thông tin thành viên!');
  }
}

/**
 * 5. Xác nhận Xóa thành viên
 */
async function confirmDeleteMember(id, name) {
  if (confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}"?`)) {
    const res = await apiFetch(`/members/${id}`, {
      method: 'DELETE'
    });

    if (res && res.ok && res.data.success) {
      alert('Đã xóa thành viên thành công!');
      // ĐẶC BIỆT LƯU Ý: Tải lại danh sách chủ động sau khi Xóa
      loadMembers();
    } else {
      alert((res && res.data && res.data.message) || 'Không thể xóa thành viên này!');
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
