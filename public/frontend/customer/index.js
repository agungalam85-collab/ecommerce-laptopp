
document.addEventListener('DOMContentLoaded', async () => {
  const name = localStorage.getItem('customer_name');
  if (name) document.getElementById('customerName').textContent = name;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customer_name');
    window.location.href = 'login.html';
  });

  const token = localStorage.getItem('token');
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

  const productList = document.getElementById('productList');
  const categoryList = document.getElementById('categoryList');

  // Ambil kategori
  try {
    const catRes = await fetch('http://localhost:8000/api/categories', {
      headers: { 'Accept': 'application/json' }
    });
    const categories = await catRes.json(); // langsung ambil array
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

  // Ambil produk awal
  loadProducts();

  // Ambil rekomendasi trending dari Twitter
  async function loadTrendingRecommendation() {
    try {
      const res = await fetch('http://localhost:8000/api/trending-products');
      const data = await res.json();
      const r = data.recommendation;

      document.getElementById('recommendation').innerHTML = `
        <strong>${r.product_name}</strong><br>
        Skor: <span style="color: red; font-weight: bold;">${r.score}</span><br>
        <a href="${r.tweet_url}" target="_blank">Lihat Tweet</a>
        <small>${r.tweet_text.slice(0, 140)}...</small>
      `;
    } catch (err) {
      document.getElementById('recommendation').innerText = 'Gagal memuat data trending.';
      console.error('❌ Error trending:', err);
    }
  }

  loadTrendingRecommendation();

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
          <span title="${c.name}" style="display:inline-block; width:16px; height:16px; border-radius:50%; background:${c.hex_code}; margin-right:4px;"></span>
        `).join("");

        return `
          <div class="product-card" data-id="${product.id}">
            <img src="${imgUrl}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>Rp${Number(product.price).toLocaleString('id-ID')}</p>
            <div class="colors">${colors || '-'}</div>
            <a href="produk-detail.html?id=${product.id}" class="btn-detail">Lihat Detail</a>
            <button class="add-to-cart">Tambah ke Keranjang</button>
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

  // === CHATBOT AI ===
 const chatWindow = document.getElementById('chatWindow');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const toggleBtn = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');


  let lastMessageId = 0; // track pesan terakhir dari admin

  // Fungsi append pesan
  function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Fungsi append opsi tombol bot
  function appendOptions(options) {
    if (!options || options.length === 0) return;
    const container = document.createElement('div');
    container.className = 'bot-options';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.className = 'option-btn';

      if (opt === 'Hubungi Admin') {
        btn.onclick = async () => {
          try {
            const res = await fetch('http://localhost:8000/api/send-to-admin', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ message: 'Halo Admin, saya butuh bantuan dari chatbot.' })
            });
            const data = await res.json();
            appendMessage(data.message || 'Pesan terkirim ke Admin via WhatsApp.', 'Bot');
          } catch (err) {
            appendMessage(`❌ Error kirim ke Admin: ${err.message}`, 'Bot');
          }
        };
      } else {
        btn.onclick = () => sendMessage(opt);
      }

      container.appendChild(btn);
    });

    chatWindow.appendChild(container);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Kirim pesan user ke bot
  async function sendMessage(msg) {
    appendMessage(msg, 'Anda');
    chatInput.value = '';

    try {
      const res = await fetch('http://localhost:8000/api/chatbot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      appendMessage(data.reply || 'Bot tidak merespon.', 'Bot');
      appendOptions(data.options || []);
    } catch (err) {
      appendMessage(`❌ Error: ${err.message}`, 'Bot');
    }
  }

  sendBtn.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) sendMessage(msg);
  });

  // Polling untuk pesan admin baru
  async function fetchAdminMessages() {
    try {
      const res = await fetch(`http://localhost:8000/api/chat-messages?after=${lastMessageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const messages = await res.json();
      messages.forEach(msg => {
        appendMessage(msg.message, 'Admin');
        lastMessageId = Math.max(lastMessageId, msg.id);
      });
    } catch (err) {
      console.error('Gagal ambil pesan admin:', err);
    }
  }

  // Polling tiap 3 detik
  setInterval(fetchAdminMessages, 3000);

  // Toggle chat
  toggleBtn.addEventListener('click', () => {
    document.getElementById('chatbot-float').style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    document.getElementById('chatbot-float').style.display = 'none';
  });

  // Mulai percakapan awal
  appendMessage("Halo! Saya bisa bantu kamu dengan:", 'Bot');
  appendOptions(["FAQ Produk", "Buat Order", "Cek Status Pengiriman", "Hubungi Admin"]);
});
