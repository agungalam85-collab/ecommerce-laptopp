document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:8000';
  const token = localStorage.getItem('token');
  const orderList = document.getElementById('orderList');

  if (!token) {
    orderList.innerHTML = '<p>Token tidak ditemukan. Silakan login ulang.</p>';
    return;
  }

  // 🔹 Tampilkan nama dan avatar
  try {
    const res = await fetch(`${BASE_URL}/api/customer/info`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const user = await res.json();
    document.getElementById('customerName').textContent = user.full_name || user.name || 'Customer';
    document.getElementById('avatarPreview').src = user.avatar_url || '/images/default.jpg';
  } catch (err) {
    console.error('❌ Gagal ambil info customer:', err);
  }

  // 🔹 Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }

  // 🔹 Ambil dan render riwayat pesanan
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (res.status === 401) {
      alert('Sesi kadaluarsa. Silakan login ulang.');
      localStorage.clear();
      window.location.href = 'login.html';
      return;
    }

    const result = await res.json();
    const orders = Array.isArray(result.data) ? result.data : [];

    if (orders.length === 0) {
      orderList.innerHTML = '<p>Belum ada pesanan.</p>';
      return;
    }

    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const statusBadge = status => ({
      menunggu_konfirmasi: '<span class="badge orange">⏳ Menunggu Konfirmasi</span>',
      pending: '<span class="badge blue">📦 Diproses</span>',
      settlement: '<span class="badge green">✅ Sudah Dibayar</span>',
      belum_dibayar: '<span class="badge gray">💤 Belum Dibayar</span>',
      completed: '<span class="badge green">✅ Selesai</span>',
      cancelled: '<span class="badge red">❌ Dibatalkan</span>'
    }[status] || `<span class="badge gray">${status}</span>`);

    const renderOrderCard = order => {
      const items = Array.isArray(order.details)
        ? order.details.map(detail => {
            const color = detail.color?.name ? ` (${detail.color.name})` : '';
            return `<li>${detail.product.name}${color} × ${detail.quantity} - Rp${parseFloat(detail.price).toLocaleString('id-ID')}</li>`;
          }).join('')
        : '<li><em>Detail produk tidak tersedia</em></li>';

      const bayarBtn = (order.status === 'belum_dibayar' && order.snap_token)
        ? `<button class="bayar-btn" onclick="bayarSekarang('${order.snap_token}')">💳 Bayar Sekarang</button>`
        : '';

      return `
        <div class="order-card">
          <h4>Pesanan #${order.id}</h4>
          <p><strong>Status:</strong> ${statusBadge(order.status)}</p>
          <p><strong>Alamat:</strong> ${order.address}</p>
          <p><strong>Metode:</strong> ${order.payment_method}</p>
          <p><strong>Total:</strong> Rp${parseFloat(order.total_price).toLocaleString('id-ID')}</p>
          <ul>${items}</ul>
          ${bayarBtn}
          <hr>
        </div>
      `;
    };

    orderList.innerHTML = orders.map(renderOrderCard).join('');
  } catch (err) {
    console.error('❌ Gagal ambil pesanan:', err);
    orderList.innerHTML = '<p>Gagal memuat riwayat pesanan.</p>';
  }

  // 🔧 Fungsi bayar ulang via Midtrans
  window.bayarSekarang = function(snapToken) {
    if (typeof snap === 'undefined') {
      alert('Midtrans belum siap.');
      return;
    }

    snap.pay(snapToken, {
      onSuccess: function(result) {
        alert('✅ Pembayaran berhasil');
        window.location.reload();
      },
      onPending: function(result) {
        alert('⏳ Menunggu pembayaran');
        window.location.reload();
      },
      onError: function(result) {
        alert('❌ Gagal bayar');
      },
      onClose: function() {
        alert('⚠️ Popup ditutup sebelum bayar');
      }
    });
  };
});
