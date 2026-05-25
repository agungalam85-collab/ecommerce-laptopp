document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:8000';
  const token = localStorage.getItem('admin_token');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');
  const box = document.getElementById('orderDetail');

  console.log("📦 Token:", token);
  console.log("🔍 Order ID dari URL:", orderId);

  if (!orderId) {
    box.innerHTML = '<h3>❌ Order ID tidak ditemukan.</h3>';
    console.warn("⚠️ Order ID tidak tersedia di URL");
    return;
  }

  try {
    console.log(`📡 Fetching order detail from ${BASE_URL}/api/admin/orders/${orderId}`);

    const res = await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json'
      }
    });

    const contentType = res.headers.get('content-type') || '';
    console.log("📄 Content-Type:", contentType);
    console.log("📊 Status Code:", res.status);

    if (!res.ok || !contentType.includes('application/json')) {
      const errorText = await res.text();
      console.error("❌ Response error:", errorText);
      throw new Error(`Gagal ambil data: ${res.status} ${errorText}`);
    }

    const result = await res.json();
    console.log("✅ Response JSON:", result);

    const order = result.data;
    console.log("🧾 Order Data:", order);

    const badge = {
      settlement: '<span class="badge badge-success">✅ Sudah Dibayar</span>',
      capture: '<span class="badge badge-success">✅ Sudah Dibayar</span>',
      pending: '<span class="badge badge-warning">⏳ Menunggu Pembayaran</span>',
      expire: '<span class="badge badge-danger">❌ Kadaluarsa</span>',
      cancel: '<span class="badge badge-danger">❌ Dibatalkan</span>',
      deny: '<span class="badge badge-danger">❌ Ditolak</span>'
    };

    const items = order.details.map(item => {
      console.log("🛒 Item:", item);
      return `<li>${item.product.name} - Rp${parseInt(item.price).toLocaleString('id-ID')} x ${item.quantity}</li>`;
    }).join('');

    box.innerHTML = `
      <p><strong>Order ID:</strong> ${order.order_id}</p>
      <p><strong>Customer:</strong> ${order.user.name}</p>
      <p><strong>Waktu Transaksi:</strong> ${order.transaction_time || '-'}</p>
      <p><strong>Total Bayar:</strong> Rp${parseInt(order.total_price || 0).toLocaleString('id-ID')}</p>
      <p><strong>Metode Pembayaran:</strong> ${order.payment_type?.toUpperCase() || '-'} (${order.bank?.toUpperCase() || '-'})</p>
      <p><strong>Nomor Virtual Account:</strong> ${order.va_number || '-'}</p>
      <p><strong>Status Transaksi:</strong> ${badge[order.transaction_status] || order.transaction_status}</p>
      <p><strong>Status Fraud:</strong> ${order.fraud_status || '-'}</p>
      ${order.pdf_url ? `<p><strong>PDF Instruksi:</strong> <a href="${order.pdf_url}" target="_blank">🔗 Lihat PDF</a></p>` : ''}
      ${order.finish_redirect_url ? `<p><strong>Redirect URL:</strong> <a href="${order.finish_redirect_url}" target="_blank">🔗 Klik di sini</a></p>` : ''}
      <h4>Item Pesanan:</h4>
      <ul>${items}</ul>
    `;
  } catch (err) {
    console.error("🔥 Catch error:", err);
    box.innerHTML = `<h3>❌ Gagal ambil detail pesanan</h3><p>${err.message}</p>`;
  }
});
