document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:8000';
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');
  const box = document.querySelector('.payment-box');

  // ✅ Validasi order_id
  if (!orderId) {
    box.innerHTML = '<h3>❌ Order ID tidak ditemukan.</h3>';
    return;
  }

  try {
    // ✅ Fetch detail pembayaran
    const res = await fetch(`${BASE_URL}/api/payment-detail/${orderId}`, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      const errorText = await res.text();
      throw new Error(`Gagal ambil data dari server: ${res.status} ${errorText}`);
    }

    const data = await res.json();

    // ✅ Render detail pembayaran
    box.innerHTML = `
      <p><strong>Order ID:</strong> ${data.order_id}</p>
      <p><strong>Waktu Transaksi:</strong> ${data.transaction_time || '-'}</p>
      <p><strong>Total Bayar:</strong> Rp${parseInt(data.gross_amount || 0).toLocaleString('id-ID')}</p>
      <p><strong>Metode Pembayaran:</strong> ${data.payment_type?.toUpperCase() || '-'} (${data.bank?.toUpperCase() || '-'})</p>
      <p><strong>Nomor Virtual Account:</strong>
        <span id="va">${data.va_number || '-'}</span>
        ${data.va_number ? '<button class="btn-copy" onclick="copyVA()">📋 Salin VA</button>' : ''}
      </p>
      ${data.pdf_url ? `<p><strong>PDF Instruksi:</strong> <a href="${data.pdf_url}" target="_blank">🔗 Lihat PDF</a></p>` : ''}
      ${data.finish_redirect_url ? `<p><strong>Kembali ke Toko:</strong> <a href="${data.finish_redirect_url}" target="_blank">🔗 Klik di sini</a></p>` : ''}
      <p><a href="status.html?order_id=${data.order_id}" class="btn-status">📊 Lihat Status Pembayaran</a></p>
    `;
  } catch (err) {
    box.innerHTML = `<h3>❌ Gagal ambil detail pembayaran</h3><p>${err.message}</p>`;
  }
});

// ✅ Fungsi salin VA
window.copyVA = () => {
  const va = document.getElementById('va').textContent;
  navigator.clipboard.writeText(va).then(() => {
    alert('✅ Nomor VA berhasil disalin!');
  });
};
