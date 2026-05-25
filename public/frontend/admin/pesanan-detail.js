document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('admin_token');
  const orderContainer = document.getElementById('orderContainer');

  console.log("📦 Token admin:", token);

  if (!token) {
    orderContainer.innerHTML = "<p>Token tidak ditemukan. Silakan login ulang.</p>";
    console.warn("⚠️ Token kosong, redirect disarankan");
    return;
  }

  try {
    console.log("📡 Fetching orders from API...");

    const res = await fetch('http://localhost:8000/api/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log("📊 Status:", res.status);
    const result = await res.json();
    console.log("✅ Response JSON:", result);

    const orders = result.data || [];
    console.log("🧾 Jumlah pesanan:", orders.length);

    if (orders.length === 0) {
      orderContainer.innerHTML = '<p>Tidak ada pesanan.</p>';
      console.info("ℹ️ Tidak ada data pesanan");
      return;
    }

    orderContainer.innerHTML = orders.map(order => {
      console.log("📦 Order:", order);

      const items = (order.details || []).map(d => {
        console.log("🛒 Item:", d);
        const name = d.product?.name || 'Produk tidak ditemukan';
        return `<li>${name} x${d.quantity}</li>`;
      }).join('');

      const statusBadge = status => ({
        settlement: '<span class="badge green">✅ Sudah Dibayar</span>',
        pending: '<span class="badge orange">⏳ Menunggu Pembayaran</span>',
        expire: '<span class="badge gray">⚠️ Kadaluarsa</span>',
        cancel: '<span class="badge red">❌ Dibatalkan</span>',
        deny: '<span class="badge red">❌ Ditolak</span>'
      }[status] || `<span class="badge gray">${status}</span>`);

      const shippingOptions = [
  'belum_dikonfirmasi',
  'telah_dikonfirmasi',
  'belum_dikirim',
  'dikirim',
  'selesai',
  'dibatalkan'
].map(opt => {
  const selected = order.shipping_status === opt ? 'selected' : '';
  return `<option value="${opt}" ${selected}>${opt.replace(/_/g, ' ')}</option>`;
}).join('');

      return `
        <div class="order-card">
          <h3>Order #${order.id}</h3>
          <p><strong>Customer:</strong> ${order.user?.name || 'Tidak diketahui'}</p>
          <p><strong>Alamat:</strong><br>${order.address}</p>
          <p><strong>Total:</strong> Rp${parseFloat(order.total_price).toLocaleString('id-ID')}</p>
          <p><strong>Status Pembayaran:</strong> ${statusBadge(order.transaction_status)}</p>
          <p><strong>Status Pengiriman:</strong>
            <select data-id="${order.id}" class="shipping-status">
              ${shippingOptions}
            </select>
          </p>
          <p><strong>Nomor Resi:</strong>
            <input type="text" class="input-resi" data-id="${order.id}" value="${order.resi || ''}" placeholder="Masukkan resi">
            <button class="btn-simpan-resi" data-id="${order.id}">💾 Simpan</button>
          </p>
          <ul>${items}</ul>
        </div>
      `;
    }).join('');

    // Event: Update shipping status
    document.querySelectorAll('.shipping-status').forEach(select => {
      select.addEventListener('change', async e => {
        const orderId = e.target.dataset.id;
        const status = e.target.value;
        console.log(`🚚 Update status pengiriman: Order #${orderId} → ${status}`);

        try {
          const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/shipping-status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ status })
          });

          const result = await res.json();
          console.log("✅ Status update response:", result);
          alert(result.message || 'Status diperbarui');
        } catch (err) {
          console.error("❌ Gagal update status:", err);
          alert('Gagal memperbarui status pengiriman');
        }
      });
    });

    // Event: Simpan resi
    document.querySelectorAll('.btn-simpan-resi').forEach(button => {
      button.addEventListener('click', async e => {
        const orderId = e.target.dataset.id;
        const input = document.querySelector(`.input-resi[data-id="${orderId}"]`);
        const resi = input.value.trim();

        console.log(`📮 Simpan resi: Order #${orderId} → ${resi}`);

        if (!resi) return alert('❗ Nomor resi tidak boleh kosong');

        try {
          const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/resi`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ resi })
          });

          const result = await res.json();
          console.log("✅ Resi update response:", result);
          alert(result.message || 'Resi berhasil disimpan');
        } catch (err) {
          console.error('🔥 Error simpan resi:', err);
          alert('❌ Gagal menyimpan resi');
        }
      });
    });

  } catch (err) {
    console.error("🔥 Error ambil pesanan:", err);
    orderContainer.innerHTML = '<p>Gagal memuat pesanan.</p>';
  }
});
