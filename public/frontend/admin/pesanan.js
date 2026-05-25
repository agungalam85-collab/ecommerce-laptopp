document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('admin_token');
  const orderContainer = document.getElementById('orderContainer');

  if (!token) {
    console.error("Token tidak ditemukan.");
    orderContainer.innerHTML = "<p>Token tidak ditemukan. Silakan login ulang.</p>";
    return;
  }

  try {
    const res = await fetch('http://localhost:8000/api/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (res.status === 401) {
      alert("Sesi kadaluarsa. Silakan login ulang.");
      localStorage.removeItem("admin_token");
      window.location.href = "login.html";
      return;
    }

    const result = await res.json();
    const orders = result.data || [];

    if (orders.length === 0) {
      orderContainer.innerHTML = '<p>Tidak ada pesanan.</p>';
      return;
    }

    orderContainer.innerHTML = orders.map(order => {
      const items = order.details.map(detail => `
        <li>${detail.product.name} x${detail.quantity}</li>
      `).join('');

      return `
        <div class="order-card">
          <h3>Order #${order.id}</h3>
          <p><strong>Alamat:</strong><br>${order.address}</p>
          <p><strong>Metode:</strong> ${order.payment_method}</p>
          <p><strong>Total:</strong> Rp${parseFloat(order.total_price).toLocaleString('id-ID')}</p>
          <p><strong>Produk:</strong></p>
          <ul>${items}</ul>
          <p><strong>Tanggal:</strong> ${new Date(order.created_at).toLocaleDateString('id-ID')}</p>
          <button onclick="window.location.href='pesanan-detail.html?order_id=${order.order_id}'">Lihat Detail</button>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Gagal ambil pesanan:', err);
    orderContainer.innerHTML = '<p>Gagal memuat pesanan.</p>';
  }
});
