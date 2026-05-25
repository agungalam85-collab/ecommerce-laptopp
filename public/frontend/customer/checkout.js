document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://localhost:8000';
  const token = localStorage.getItem('token');

  // 🔥 Tambahin nama dan avatar customer
  fetch(`${BASE_URL}/api/customer/info`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })
  .then(res => res.json())
  .then(user => {
    document.getElementById('customerName').textContent = user.full_name || user.name || 'Customer';
    document.getElementById('avatarPreview').src = user.avatar_url || '/images/default.jpg';
  })
  .catch(err => {
    console.error('❌ Gagal ambil info customer:', err.message);
  });

  const provinceSelect = document.getElementById('province');
  const citySelect = document.getElementById('city');
  const districtSelect = document.getElementById('district');
  const courierSelect = document.getElementById('courier');
  const weightInput = document.getElementById('weight');
  const shippingCostDiv = document.getElementById('shipping-cost');
  const grandTotalDiv = document.getElementById('grand-total');
  const productTotalDiv = document.getElementById('product-total');
  const resultBox = document.getElementById('result');
  const checkoutBtn = document.querySelector('#checkoutForm button[type="submit"]');

  let shippingCost = 0;
  let layananOngkir = '';
  let currentOrderId = null;

  const productData = JSON.parse(localStorage.getItem('checkout_products') || '[]');
  const selectedIds = JSON.parse(localStorage.getItem('checkout_product_ids') || '[]');
  const selectedProducts = productData.filter(p => selectedIds.includes(p.id));
  const totalHargaProduk = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  // 🔥 Render produk + warna
  const productList = document.createElement('ul');
  productList.className = 'checkout-product-list';

  selectedProducts.forEach(p => {
    const li = document.createElement('li');
    li.className = 'product-item';

    const colorPreview = p.color_name
      ? `<div class="color-preview"><span class="color-label">${p.color_name}</span></div>`
      : '';

    li.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-thumb" />
      <div class="product-info">
        <strong>${p.name}</strong><br />
        ${colorPreview}
        Jumlah: ${p.quantity}<br />
        Harga: Rp${(p.price * p.quantity).toLocaleString('id-ID')}
      </div>
    `;

    productList.appendChild(li);
  });

  const productInput = document.getElementById('product_ids');
  productInput.replaceWith(productList);

  productTotalDiv.innerText = `Total Produk: Rp${totalHargaProduk.toLocaleString()}`;
  grandTotalDiv.innerText = `Total Bayar: Rp${(totalHargaProduk + shippingCost).toLocaleString()}`;

  // Load provinsi
  fetch(`${BASE_URL}/api/provinces`)
    .then(res => res.json())
    .then(data => {
      provinceSelect.innerHTML = '<option value="">Pilih provinsi</option>';
      data.forEach(p => {
        provinceSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
      });
    });

  // Load kota
  provinceSelect.addEventListener('change', () => {
    citySelect.innerHTML = '<option value="">Pilih kota</option>';
    districtSelect.innerHTML = '<option value="">Pilih kecamatan</option>';
    const provId = provinceSelect.value;
    fetch(`${BASE_URL}/api/cities/${provId}`)
      .then(res => res.json())
      .then(data => {
        data.forEach(c => {
          citySelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
      });
  });

  // Load kecamatan
  citySelect.addEventListener('change', () => {
    districtSelect.innerHTML = '<option value="">Pilih kecamatan</option>';
    const cityId = citySelect.value;
    fetch(`${BASE_URL}/api/districts/${cityId}`)
      .then(res => res.json())
      .then(data => {
        data.forEach(d => {
          districtSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
        });
      });
  });

  // Load kurir
  const couriers = ['jne', 'tiki', 'pos', 'sicepat', 'jnt', 'anteraja'];
  courierSelect.innerHTML = '<option value="">Pilih kurir</option>';
  couriers.forEach(c => {
    courierSelect.innerHTML += `<option value="${c}">${c.toUpperCase()}</option>`;
  });

  // Hitung ongkir
  [districtSelect, courierSelect, weightInput].forEach(el => {
    el.addEventListener('change', async () => {
      const district_id = districtSelect.value;
      const courier = courierSelect.value;
      const weight = parseInt(weightInput.value);

      if (district_id && courier && weight > 0) {
        try {
          const res = await fetch(`${BASE_URL}/api/check-ongkir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ district_id, weight, courier })
          });

          const data = await res.json();
          const layanan = data[0];

          shippingCost = layanan?.cost || 0;
          layananOngkir = layanan?.service || '';
          shippingCostDiv.innerText = `Ongkir (${layananOngkir}): Rp${shippingCost.toLocaleString()}`;
          grandTotalDiv.innerText = `Total Bayar: Rp${(totalHargaProduk + shippingCost).toLocaleString()}`;
          checkoutBtn.disabled = false;
        } catch (err) {
          console.error('❌ Gagal hitung ongkir:', err.message);
          shippingCostDiv.innerText = '❌ Gagal hitung ongkir';
          checkoutBtn.disabled = true;
        }
      } else {
        checkoutBtn.disabled = true;
      }
    });
  });

  // Submit checkout
  document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const address = document.getElementById('address').value.trim();
    const payment = document.getElementById('payment').value;
    const district_id = districtSelect.value;
    const courier = courierSelect.value;
    const weight = parseInt(weightInput.value);
    const redirectBtn = document.getElementById('redirectBtn');
    redirectBtn.style.display = 'none';

    if (!address || !district_id || !courier || !payment || selectedIds.length === 0 || shippingCost === 0) {
      resultBox.innerHTML = `<h3>⚠️ Form belum lengkap</h3><p>Pastikan semua field terisi dan ongkir sudah dihitung.</p>`;
      return;
    }

    const payload = {
      product_ids: selectedIds,
      address,
      district_id,
      courier,
      weight,
      payment,
      shipping_cost: shippingCost,
      total_price: totalHargaProduk
    };

    try {
      const res = await fetch(`${BASE_URL}/api/checkout/midtrans`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      currentOrderId = data.order_id;
      localStorage.setItem('midtrans_redirect_url', data.redirect_url);

      snap.pay(data.token, {
        onSuccess: async function(result) {
          await fetch(`${BASE_URL}/api/order-status`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              order_id: currentOrderId,
              status: 'settlement'
            })
          });

          localStorage.removeItem('checkout_product_ids');
          localStorage.removeItem('checkout_products');
          localStorage.removeItem('cart_items');
          localStorage.removeItem('midtrans_redirect_url');

          resultBox.innerHTML = `<h3>✅ Pembayaran berhasil</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
          window.location.href = 'riwayat.html';
        },

        onPending: async function(result) {
          await fetch(`${BASE_URL}/api/order-status`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              order_id: currentOrderId,
              status: 'pending'
            })
          });

          resultBox.innerHTML = `
            <h3>⏳ Menunggu pembayaran</h3>
            <p><strong>Order ID:</strong> ${result.order_id}</p>
            <p><strong>Metode:</strong> ${result.payment_type}</p>
            <p><strong>Status:</strong> ${result.transaction_status}</p>
          `;
        },

        onError: function(result) {
          resultBox.innerHTML = `<h3>❌ Gagal bayar</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
          redirectBtn.style.display = 'inline-block';
          redirectBtn.onclick = () => {
            window.open(data.redirect_url, '_blank');
          };
        },

        onClose: async function() {
          await fetch(`${BASE_URL}/api/order-status`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              order_id: currentOrderId,
              status: 'belum_dibayar'
            })
          });

          resultBox.innerHTML = `
            <h3>⚠️ Pembayaran belum selesai</h3>
            <p>Anda menutup popup sebelum menyelesaikan pembayaran. Klik "Bayar Sekarang" lagi atau gunakan tombol di bawah.</p>
          `;
          redirectBtn.style.display = 'inline-block';
          redirectBtn.onclick = () => {
            window.open(data.redirect_url, '_blank');
          };
        }
      });
    } catch (err) {
      resultBox.innerHTML = `<h3>❌ Error</h3><pre>${err.message}</pre>`;
    }
  });
});
