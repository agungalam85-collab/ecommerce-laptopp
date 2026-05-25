document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('http://localhost:8000/api/customer/info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const user = await res.json();
    console.log("👤 Customer info:", user);

    document.getElementById('customerName').textContent = user.full_name || user.name || 'Customer';
    document.getElementById('avatarPreview').src = user.avatar_url || '/images/default.jpg';
  } catch (err) {
    console.error('❌ Gagal ambil info customer:', err);
  }

  // lanjut render checkout...
});


document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const cartList = document.getElementById('cartList');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  async function loadCart() {
    console.log("📥 Memuat isi keranjang...");

    const res = await fetch('http://localhost:8000/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.error("❌ Gagal fetch keranjang:", res.status);
      cartList.innerHTML = '<p>Gagal memuat keranjang.</p>';
      return;
    }

    const result = await res.json();
    const items = result.data || [];
    console.log("🧺 Isi keranjang:", items);

    let total = 0;

    if (items.length === 0) {
      cartList.innerHTML = '<p>Keranjang kamu kosong.</p>';
      cartTotal.textContent = '';
      return;
    }

    cartList.innerHTML = '';
    items.forEach(item => {
      const product = item.product;
      const imgUrl = product.images?.[0]?.url || `/storage/${product.images?.[0]?.path}` || '/images/default.jpg';
      const color = item.color;
      const colorPreview = color
        ? `<div class="color-preview"><span class="color-dot" style="background:${color.hex_code}"></span> ${color.name}</div>`
        : '';

      console.log("🔄 Item:", {
        item_id: item.id,
        product_id: product.id,
        product_name: product.name,
        color_id: color?.id,
        color_name: color?.name,
        quantity: item.quantity
      });

      total += parseFloat(product.price) * item.quantity;

      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = item.id;
      card.innerHTML = `
        <img src="${imgUrl}" alt="${product.name}" class="cart-thumb">
        <h4>${product.name}</h4>
        <p>Rp${Number(product.price).toLocaleString('id-ID')}</p>
        ${colorPreview}
        <label>Qty: <input type="number" min="1" value="${item.quantity}" class="qty-input"></label>
        <button class="remove-item">Hapus</button>
      `;

      cartList.appendChild(card);

      card.querySelector('.remove-item').addEventListener('click', async () => {
        const itemId = card.dataset.id;
        console.log("🗑️ Hapus item:", itemId);

        const delRes = await fetch(`http://localhost:8000/api/cart/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (delRes.ok) {
          alert('Item dihapus dari keranjang');
          loadCart();
        } else {
          alert('Gagal menghapus item');
        }
      });

      card.querySelector('.qty-input').addEventListener('change', async (e) => {
        const itemId = card.dataset.id;
        const newQty = parseInt(e.target.value);
        console.log("✏️ Update qty:", { itemId, newQty });

        const updRes = await fetch(`http://localhost:8000/api/cart/${itemId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: newQty })
        });
        if (updRes.ok) {
          loadCart();
        } else {
          alert('Gagal update qty');
        }
      });
    });

    cartTotal.textContent = `Total: ${total.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR'
    })}`;

    checkoutBtn.onclick = () => {
      const checkoutProducts = items.map(item => {
        const product = item.product;
        const imgUrl = product.images?.[0]?.url || `/storage/${product.images?.[0]?.path}` || '/images/default.jpg';
        return {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          quantity: item.quantity,
          image: imgUrl,
          color_id: item.color?.id || null,
          color_name: item.color?.name || null
        };
      });

      console.log("🧾 Checkout payload:", checkoutProducts);

      localStorage.setItem('checkout_products', JSON.stringify(checkoutProducts));
      localStorage.setItem('checkout_product_ids', JSON.stringify(checkoutProducts.map(p => p.id)));
      window.location.href = 'checkout.html';
    };
  }

  loadCart();
});
