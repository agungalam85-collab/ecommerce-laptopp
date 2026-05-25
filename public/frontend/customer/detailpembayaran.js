document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:8000';
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');
  const box = document.getElementById('payment-box');

  if (!orderId) {
    box.innerHTML = '<h3>❌ Order ID tidak ditemukan di URL.</h3>';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/payment-detail/${orderId}`, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Gagal ambil data dari server');

    const data = await res.json();

    const badge = {
      settlement: '<span class="badge badge-success">✅ Sudah Dibayar</span>',
      pending: '<span class="badge badge-warning">⏳ Menunggu Pembayaran</span>',
      expire: '<span class="badge badge-danger">❌ Kadaluarsa</span>',
      cancel: '<span class="badge badge-danger">❌ Dibatalkan</span>',
      deny: '<span class="badge badge-danger">❌ Ditolak</span>'
    };

    box.innerHTML = `
      <p><strong>Order ID:</strong> ${data.order_id}</p>
      <p><strong>Waktu Transaksi:</strong> ${data.transaction_time}</p>
      <p><strong>Total Bayar:</strong> Rp${parseInt(data.gross_amount).toLocaleString('id-ID')}</p>
      <p><strong>Metode Pembayaran:</strong> ${data.payment_type.toUpperCase()} (${data.va_numbers?.[0]?.bank?.toUpperCase() || '-'})</p>
      <p><strong>Nomor Virtual Account:</strong> <span id="va">${data.va_numbers?.[0]?.va_number || '-'}</span></p>
      <button class="btn-copy" onclick="copyVA()">📋 Salin VA</button>
      <p><strong>Status Transaksi:</strong> ${badge[data.transaction_status] || data.transaction_status}</p>
      ${data.pdf_url ? `<p><strong>PDF Instruksi:</strong> <a href="${data.pdf_url}" target="_blank">🔗 Lihat PDF</a></p>` : ''}
      ${data.finish_redirect_url ? `<p><strong>Kembali ke Toko:</strong> <a href="${data.finish_redirect_url}" target="_blank">🔗 Klik di sini</a></p>` : ''}
    `;
  } catch (err) {
    box.innerHTML = `<h3>❌ Gagal ambil detail pembayaran</h3><p>${err.message}</p>`;
  }
});

window.copyVA = () => {
  const va = document.getElementById('va').textContent;
  navigator.clipboard.writeText(va).then(() => {
    alert('✅ Nomor VA berhasil disalin!');
  });
};
