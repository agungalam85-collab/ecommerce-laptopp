document.addEventListener('DOMContentLoaded', async () => {
  // === Deklarasi awal ===
  const token = localStorage.getItem('token');
  const customerId = localStorage.getItem('customer_id');
  const name = localStorage.getItem('customer_name');

  const chatWindow = document.getElementById('chatWindow');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const toggleBtn = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const productList = document.getElementById('productList');
  const categoryList = document.getElementById('categoryList');

  if (name) document.getElementById('customerName').textContent = name;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  // === Ambil info customer ===
  try {
    const res = await fetch('http://localhost:8000/api/customer/info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const user = await res.json();
    document.getElementById('customerName').textContent = user.full_name || user.name || 'Customer';
    document.getElementById('avatarPreview').src = user.avatar_url || '/images/default.jpg';
  } catch (err) {
    console.error('Gagal ambil info customer:', err);
  }

  // === Ambil kategori produk ===
  try {
    const catRes = await fetch('http://localhost:8000/api/categories', {
      headers: { 'Accept': 'application/json' }
    });
    const categories = await catRes.json();
    categoryList.innerHTML = categories.map(cat => `
      <button class="category-btn" data-id="${cat.id}">${cat.name}</button>
    `).join('');

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const categoryId = btn.dataset.id;
        loadProducts(categoryId);
      });
    });
  } catch (err) {
    categoryList.innerHTML = '<p>Gagal memuat kategori.</p>';
  }

  loadProducts();

  // === Rekomendasi trending ===
  async function loadTrendingRecommendation() {
    try {
      const res = await fetch('http://localhost:8000/api/trending-products');
      const data = await res.json();
      const r = data.recommendation;

      const box = document.getElementById('recommendation');
      if (box) {
        box.innerHTML = `
          <strong>${r.product_name}</strong><br>
          Skor: <span style="color: red; font-weight: bold;">${r.score}</span><br>
          <a href="${r.tweet_url}" target="_blank">Lihat Tweet</a>
          <small>${r.tweet_text.slice(0, 140)}...</small>
        `;
      }
    } catch (err) {
      const box = document.getElementById('recommendation');
      if (box) box.innerText = 'Gagal memuat data trending.';
      console.error('❌ Error trending:', err);
    }
  }

  loadTrendingRecommendation();

  // === Produk berdasarkan kategori ===
  async function loadProducts(categoryId = null) {
    productList.innerHTML = 'Memuat produk...';

    let url = 'http://localhost:8000/api/products';
    if (categoryId) {
      url = `http://localhost:8000/api/categories/${categoryId}/products`;
    }

    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      const result = await res.json();
      const products = result.data || [];

      if (products.length === 0) {
        productList.innerHTML = '<p>Produk tidak ditemukan.</p>';
        return;
      }

      productList.innerHTML = products.map(product => {
        const imgUrl =
          product.images?.[0]?.url || `/storage/${product.images?.[0]?.path}` || '/images/default.jpg';

        const colors = (product.colors || []).map(c => `
          <span title="${c.name}" style="
            display:inline-block;
            width:16px;
            height:16px;
            border-radius:50%;
            background:${c.hex_code};
            margin-right:4px;">
          </span>
        `).join("");

        return `
          <div class="product-card" data-id="${product.id}">
            <img src="${imgUrl}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>Rp${Number(product.price).toLocaleString('id-ID')}</p>
            <div class="colors">${colors || '-'}</div>
            <div class="product-actions">
              <a href="produk-detail.html?id=${product.id}" class="btn-detail">🔍 Lihat Detail</a>
              <button class="btn-cart add-to-cart">🛒 Tambah Keranjang</button>
            </div>
          </div>
        `;
      }).join('');

      document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async () => {
          const productId = button.closest('.product-card').dataset.id;

          const res = await fetch('http://localhost:8000/api/cart', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ product_ids: [parseInt(productId)] })
          });

          if (res.ok) {
            const data = await res.json();
            alert(data.message || 'Produk berhasil ditambahkan ke keranjang');
          } else {
            alert('Gagal menambahkan produk');
          }
        });
      });
    } catch (err) {
      productList.innerHTML = '<p>Gagal memuat produk.</p>';
    }
  }

  // === Chat Customer ===
  function appendBubble(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = sender === 'admin' ? 'bubble-bot' : 'bubble-user';
    bubble.innerHTML = `
      <div>${text}</div>
      <small style="font-size:10px;color:#666;">${new Date().toLocaleTimeString()}</small>
    `;
    bubble.style.alignSelf = sender === 'admin' ? 'flex-start' : 'flex-end';
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  async function fetchMessages() {
    try {
      const res = await fetch('http://localhost:8000/api/chat-messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const messages = await res.json();
      chatWindow.innerHTML = '';
      messages.forEach(msg => appendBubble(msg.text, msg.sender));
    } catch (err) {
      console.error('Gagal ambil chat:', err.message);
      chatWindow.innerHTML = '<p style="color:red;">Gagal memuat pesan.</p>';
    }
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    try {
      const res = await fetch('http://localhost:8000/api/send-to-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          customer_id: parseInt(customerId)
        })
      });

      const data = await res.json();
      if (data.status) {
        chatInput.value = '';
        fetchMessages();
      } else {
        appendBubble('❌ Gagal kirim pesan.', 'customer');
      }
    } catch (err) {
      appendBubble(`❌ Error: ${err.message}`, 'customer');
    }
  }

  sendBtn.onclick = sendMessage;
  toggleBtn.onclick = () => {
    document.getElementById('chatbot-float').style.display = 'flex';
    fetchMessages();
  };
  closeBtn.onclick = () => {
    document.getElementById('chatbot-float').style.display = 'none';
  };

  setInterval(fetchMessages, 5000);
});
