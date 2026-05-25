document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:8000';
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');
  const box = document.querySelector('.status-box');

  if (!orderId) {
    box.innerHTML = '<h3>❌ Order ID tidak ditemukan.</h3>';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/payment-detail/${orderId}`, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });

    const data = await res.json();

    const badge = {
      settlement: '<span class="status-success">✅ Sudah Dibayar</span>',
      capture: '<span class="status-success">✅ Sudah Dibayar</span>',
      pending: '<span class="status-pending">⏳ Menunggu Pembayaran</span>',
      expire: '<span class="status-failed">❌ Kadaluarsa</span>',
      cancel: '<span class="status-failed">❌ Dibatalkan</span>',
      deny: '<span class="status-failed">❌ Ditolak</span>'
    };

    const shippingBadge = status => {
      const label = {
        belum_dikirim: '📦 Belum Dikirim',
        dikirim: '🚚 Dalam Pengiriman',
        selesai: '✅ Selesai'
      }[status] || status;

      const cssClass = {
        belum_dikirim: 'status-pending',
        dikirim: 'status-success',
        selesai: 'status-success'
      }[status] || 'status-pending';

      return `<span class="${cssClass}">${label}</span>`;
    };

    box.innerHTML = `
      <p><strong>Order ID:</strong> ${data.order_id}</p>
      <p><strong>Status Transaksi:</strong> ${badge[data.transaction_status] || data.transaction_status}</p>
      <p><strong>Status Fraud:</strong> ${data.fraud_status || '-'}</p>
      <p><strong>Status Pengiriman:</strong> ${shippingBadge(data.shipping_status)}</p>
      <p><strong>Nomor Resi:</strong> ${data.resi || '-'}</p>
    `;
  } catch (err) {
    box.innerHTML = `<h3>❌ Gagal ambil status pembayaran</h3><p>${err.message}</p>`;
  }
});
