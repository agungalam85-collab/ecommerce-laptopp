document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:8000';
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');
  const box = document.getElementById('payment-box');

  console.log('Token:', token);
  console.log('Order ID:', orderId);

  if (!orderId) {
    box.innerHTML = '<h3>❌ Order ID tidak ditemukan di URL.</h3>';
    return;
  }

  if (!token) {
    box.innerHTML = '<h3>❌ Anda belum login. Token tidak ditemukan.</h3><p>Silakan login terlebih dahulu untuk melihat detail pembayaran.</p>';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/payment-detail/${orderId}`, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });

    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType.includes('application/json')) {
      const errorText = await res.text();
      throw new Error(`Gagal ambil data dari server: ${res.status} ${errorText}`);
    }

    const data = await res.json();

    const badge = {
      settlement: '<span class="badge badge-success">✅ Sudah Dibayar</span>',
      capture: '<span class="badge badge-success">✅ Sudah Dibayar</span>',
      pending: '<span class="badge badge-warning">⏳ Menunggu Pembayaran</span>',
      expire: '<span class="badge badge-danger">❌ Kadaluarsa</span>',
      cancel: '<span class="badge badge-danger">❌ Dibatalkan</span>',
      deny: '<span class="badge badge-danger">❌ Ditolak</span>'
    };

    box.innerHTML = `
      <p><strong>Order ID:</strong> ${data.order_id}</p>
      <p><strong>Waktu Transaksi:</strong> ${data.transaction_time}</p>
      <p><strong>Total Bayar:</strong> Rp${parseInt(data.gross_amount).toLocaleString('id-ID')}</p>
      <p><strong>Metode Pembayaran:</strong> ${data.payment_type?.toUpperCase() || '-'} (${data.bank?.toUpperCase() || '-'})</p>
      <p><strong>Nomor Virtual Account:</strong> <span id="va">${data.va_number || '-'}</span></p>
      ${data.va_number ? '<button class="btn-copy" onclick="copyVA()">📋 Salin VA</button>' : ''}
      <p><strong>Status Transaksi:</strong> ${badge[data.transaction_status] || data.transaction_status}</p>
      ${data.pdf_url ? `<p><strong>PDF Instruksi:</strong> <a href="${data.pdf_url}" target="_blank">🔗 Lihat PDF</a></p>` : ''}
      ${data.finish_redirect_url ? `<p><strong>Kembali ke Toko:</strong> <a href="${data.finish_redirect_url}" target="_blank">🔗 Klik di sini</a></p>` : ''}
    `;
  } catch (err) {
    box.innerHTML = `<h3>❌ Gagal ambil detail pembayaran</h3><p>${err.message}</p>`;
    console.error(err);
  }
});

window.copyVA = () => {
  const va = document.getElementById('va').textContent;
  navigator.clipboard.writeText(va).then(() => {
    alert('✅ Nomor VA berhasil disalin!');
  });
};
