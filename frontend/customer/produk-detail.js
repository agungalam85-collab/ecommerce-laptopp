const api = "http://localhost:8000/api";
const productId = new URLSearchParams(location.search).get("id");
const token = localStorage.getItem("token");

let currentProduct = null; // 🔧 simpan produk global

// 🔧 Fungsi bantu untuk ambil URL avatar dari backend
const resolveAvatar = (path) => {
  if (!path) return "http://localhost:8000/storage/default.jpg";
  return path.startsWith("http")
    ? path
    : `http://localhost:8000/storage/${path}`;
};

// 🔐 Ambil info customer untuk topbar
fetch(`${api}/customer/info`, {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json"
  }
})
  .then(res => res.json())
  .then(user => {
    document.getElementById("customerName").textContent = user.full_name || user.name || "Customer";
    document.getElementById("avatarPreview").src = resolveAvatar(user.avatar_url);
  })
  .catch(err => {
    console.error("❌ Gagal ambil info customer:", err);
  });

// 📦 Ambil detail produk
fetch(`${api}/products/${productId}`)
  .then(res => res.json())
  .then(({ product }) => {
    currentProduct = product;

    // Gambar utama & thumbnail
    const mainImage = document.getElementById("mainImage");
    const thumbnails = document.getElementById("thumbnailList");
    const images = product.images || [];

    if (images.length > 0) {
      mainImage.src = images[0].url || `http://localhost:8000/storage/${images[0].path}`;
      thumbnails.innerHTML = images.map(img => {
        const url = img.url || `http://localhost:8000/storage/${img.path}`;
        return `<img src="${url}" class="thumb" data-url="${url}" />`;
      }).join("");

      thumbnails.querySelectorAll(".thumb").forEach(img => {
        img.addEventListener("click", () => {
          mainImage.src = img.dataset.url;
        });
      });
    }

    // Info dasar
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productPrice").textContent = "Rp" + parseInt(product.price).toLocaleString("id-ID");
    document.getElementById("productStock").textContent = product.stock > 0 ? "Stok tersedia" : "Stok habis";
    document.getElementById("productCategory").textContent = "Kategori: " + (product.category?.name || "-");
    document.getElementById("productDescription").textContent = product.description;



    // Warna
    const colorOptions = document.getElementById("colorOptions");
    colorOptions.innerHTML = (product.colors || []).map(c => `
      <label>
        <input type="radio" name="color" value="${c.id}" />
        <span class="color-dot" style="background:${c.hex_code}"></span> ${c.name}
      </label>
    `).join("");

    // Tombol keranjang
    document.getElementById("addToCartBtn").addEventListener("click", async () => {
      if (!token) {
        alert("Silakan login terlebih dahulu.");
        location.href = "login.html";
        return;
      }

      const selectedColor = document.querySelector('input[name="color"]:checked');

      if ((product.colors || []).length > 0 && !selectedColor) {
        alert("Silakan pilih warna terlebih dahulu.");
        return;
      }

      const payload = {
        product_ids: [product.id],
        color_id: selectedColor?.value || null
      };

      const res = await fetch(`${api}/cart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Produk ditambahkan ke keranjang");
      } else {
        const errorText = await res.text();
        console.error("❌ Gagal tambah ke keranjang:", errorText);
        alert("Gagal menambahkan produk");
      }
    });

    // Tombol wishlist
    document.getElementById("wishlistBtn").addEventListener("click", async () => {
      if (!token) {
        alert("Silakan login terlebih dahulu.");
        location.href = "login.html";
        return;
      }

      try {
        const res = await fetch(`${api}/wishlist`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({ product_id: product.id })
        });

        if (res.ok) {
          const data = await res.json();
          alert(data.message || "Produk ditambahkan ke wishlist");
        } else {
          const errorText = await res.text();
          console.error("❌ Gagal tambah ke wishlist:", errorText);
          alert("Gagal menambahkan produk ke wishlist");
        }
      } catch (err) {
        console.error("❌ Error wishlist:", err);
        alert("Terjadi kesalahan saat menambahkan ke wishlist");
      }
    });

    // 🗣️ Ambil komentar setelah produk tersedia
    loadKomentar(product.id);
  })
  .catch(() => {
    document.querySelector("main").innerHTML = "<p>Gagal memuat detail produk.</p>";
  });

// 🗣️ Ambil dan tampilkan komentar customer
async function loadKomentar(productId) {
  const reviewList = document.getElementById("reviewList");
  reviewList.innerHTML = "<p>⏳ Memuat komentar...</p>";

  try {
    const res = await fetch(`${api}/products/${productId}/reviews`);
    const result = await res.json();
    const reviews = result.data || [];

    if (reviews.length === 0) {
      reviewList.innerHTML = "<p>Belum ada komentar.</p>";
      return;
    }

    reviewList.innerHTML = reviews.map(r => {
      const avatar = resolveAvatar(r.user?.avatar_url);
      return `
        <div class="review-card">
          <img src="${avatar}" class="avatar-review" alt="Avatar ${r.user?.name}" />
          <div class="review-content">
            <strong>${r.user?.name || "Customer"}</strong>
            <span class="stars">⭐️ ${r.rating}/5</span>
            <p>${r.comment}</p>
            <small>${new Date(r.created_at).toLocaleDateString("id-ID")}</small>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("❌ Gagal ambil komentar:", err);
    reviewList.innerHTML = "<p>Gagal memuat komentar.</p>";
  }
}

// 📝 Kirim komentar baru
document.getElementById("submitReviewBtn").addEventListener("click", async () => {
  const comment = document.getElementById("commentInput").value.trim();
  const rating = document.getElementById("ratingInput").value;

  if (!token) {
    alert("Silakan login terlebih dahulu.");
    location.href = "login.html";
    return;
  }

  if (!comment) {
    alert("Komentar tidak boleh kosong.");
    return;
  }

  try {
    const res = await fetch(`${api}/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        product_id: currentProduct.id,
        rating: parseInt(rating),
        comment
      })
    });

    if (res.ok) {
      alert("Komentar berhasil dikirim!");
      document.getElementById("commentInput").value = "";
      loadKomentar(currentProduct.id);
    } else {
      const errorText = await res.text();
      console.error("❌ Gagal kirim komentar:", errorText);
      alert("Gagal mengirim komentar.");
    }
  } catch (err) {
    console.error("❌ Error kirim komentar:", err);
    alert("Terjadi kesalahan saat mengirim komentar.");
  }
});
