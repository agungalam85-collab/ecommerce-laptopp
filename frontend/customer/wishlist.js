const api = "http://localhost:8000/api";
const token = localStorage.getItem("token");

async function loadCustomer() {
  const res = await fetch(`${api}/customer/info`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await res.json();
  document.getElementById("customerName").textContent = user.full_name || user.name || "Customer";
  document.getElementById("avatarPreview").src = user.avatar_url || "/images/default.jpg";
}

async function loadWishlist() {
  const container = document.getElementById("wishlistList");
  const res = await fetch(`${api}/wishlist`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    container.innerHTML = "<p>Gagal memuat wishlist.</p>";
    return;
  }

  const result = await res.json();
  const items = result.data || [];

  if (items.length === 0) {
    container.innerHTML = "<p>Wishlist kamu kosong.</p>";
    return;
  }

  container.innerHTML = "";
  items.forEach(product => {
    const imgUrl = product.images?.[0]?.url || `/storage/${product.images?.[0]?.path}` || "/images/default.jpg";
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${imgUrl}" alt="${product.name}" class="cart-thumb">
      <h4>${product.name}</h4>
      <p>Rp${Number(product.price).toLocaleString("id-ID")}</p>
      <div class="button-group">
        <a href="produk-detail.html?id=${product.id}" class="btn-detail">Lihat Detail</a>
        <button class="remove-item">Hapus</button>
        <button class="add-cart">Tambah ke Keranjang</button>
      </div>
    `;

    // Hapus dari wishlist
    card.querySelector(".remove-item").addEventListener("click", async () => {
      const res = await fetch(`${api}/wishlist/${product.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Produk dihapus dari wishlist");
        loadWishlist();
      } else {
        alert("Gagal menghapus produk");
      }
    });

    // Tambah ke keranjang
    card.querySelector(".add-cart").addEventListener("click", async () => {
      const res = await fetch(`${api}/cart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ product_ids: [product.id] })
      });
      if (res.ok) {
        alert("Produk ditambahkan ke keranjang");
      } else {
        alert("Gagal menambahkan ke keranjang");
      }
    });

    container.appendChild(card);
  });
}

loadCustomer();
loadWishlist();
