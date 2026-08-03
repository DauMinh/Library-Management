// Hàm gọi API lấy dữ liệu thống kê và render vào các card
async function loadDashboardStats() {
  try {
    // Gọi API endpoint /api/stats
    const result = await apiFetch('/stats');

    if (!result.ok || !result.data.success) {
      alert('Lỗi khi tải dữ liệu thống kê: ' + (result.data.message || 'Không xác định'));
      return;
    }

    const stats = result.data.data;

    // Render dữ liệu vào các card
    document.getElementById('totalBooksCard').textContent = stats.total_book_copies || 0;
    document.getElementById('totalMembersCard').textContent = stats.total_members || 0;
    document.getElementById('currentlyBorrowedCard').textContent = stats.currently_borrowed || 0;
    document.getElementById('overdueRecordsCard').textContent = stats.overdue_records || 0;

  } catch (error) {
    console.error('Lỗi loadDashboardStats:', error);
    alert('Có lỗi xảy ra khi tải dữ liệu thống kê');
  }
}

// Tự động gọi hàm khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardStats();
});
