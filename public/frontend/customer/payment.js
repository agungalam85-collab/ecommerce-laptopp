export function initPayment(snapToken = null) {
  const orderId = localStorage.getItem('orderId');
  const token = localStorage.getItem('token'); // konsisten dengan login.js

  if (!orderId || !token) {
    alert('Order ID atau token tidak ditemukan.');
    return;
  }

  // Kalau token Snap sudah dikirim dari backend saat checkout, langsung pakai
  if (snapToken) {
    return snap.pay(snapToken, snapCallbacks());
  }

  // Kalau belum, ambil dari endpoint Laravel
  fetch(`http://localhost:8000/api/payment-token?order_id=${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.token) {
        alert('Gagal mendapatkan token pembayaran.');
        return;
      }

      snap.pay(data.token, snapCallbacks());
    })
    .catch(err => {
      console.error('Gagal ambil token:', err);
      alert('Terjadi kesalahan saat memulai pembayaran.');
    });
}

// ✅ Callback Snap modular
function snapCallbacks() {
  return {
    onSuccess: function (result) {
      alert('Pembayaran sukses!');
      console.log('Success:', result);
      location.reload();
    },
    onPending: function (result) {
      alert('Menunggu pembayaran...');
      console.log('Pending:', result);
    },
    onError: function (result) {
      alert('Pembayaran gagal!');
      console.error('Error:', result);
    }
  };
}
