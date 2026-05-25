const api = "http://localhost:8000/api";
const productId = new URLSearchParams(location.search).get("id");

fetch(`${api}/products/${productId}`)
  .then(res => res.json())
  .then(({ product }) => {
    // Gambar utama
    const mainImage = document.getElementById("mainImage");
    const thumbnails = document.getElementById("thumbnailList");
    const images = product.images || [];
    if (images.length > 0) {
      mainImage.src = images[0].url || `/storage/${images[0].path}`;
      thumbnails.innerHTML = images.map(img => {
        const url = img.url || `/storage/${img.path}`;
        return `<img src="${url}" class="thumb" onclick="document.getElementById('mainImage').src='${url}'" />`;
      }).join("");
    }

    // Info dasar
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productPrice").textContent = "Rp" + parseInt(product.price).toLocaleString("id-ID");
    document.getElementById("productStock").textContent = product.stock > 0 ? "Stok tersedia" : "Stok habis";
    document.getElementById("productCategory").textContent = "Kategori: " + (product.category?.name || "-");
    document.getElementById("productDescription").textContent = product.description;

    // Spesifikasi
    const specList = document.getElementById("specList");
    specList.innerHTML = (product.specifications || []).map(s => `<li>${s.key}: ${s.value}</li>`).join("");

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
  const token = localStorage.getItem("token");
  const selectedColor = document.querySelector('input[name="color"]:checked');

  console.log("📦 Token:", token);
  console.log("🎨 Selected Color ID:", selectedColor?.value);
  console.log("🛒 Product ID:", product.id);

  if ((product.colors || []).length > 0 && !selectedColor) {
    alert("Silakan pilih warna terlebih dahulu.");
    return;
  }

  const payload = {
    product_ids: [product.id],
    color_id: selectedColor?.value || null
  };

  console.log("📤 Payload ke API:", payload);

  const res = await fetch(`${api}/cart`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  console.log("📥 Response status:", res.status);

  if (res.ok) {
    const data = await res.json();
    console.log("✅ Response data:", data);
    alert(data.message || "Produk ditambahkan ke keranjang");
  } else {
    const errorText = await res.text();
    console.error("❌ Gagal tambah ke keranjang:", errorText);
    alert("Gagal menambahkan produk");
  }
});


    // Tombol wishlist (dummy)
    document.getElementById("wishlistBtn").addEventListener("click", () => {
      alert("Produk ditambahkan ke wishlist (simulasi)");
    });
  })
  .catch(() => {
    document.querySelector("main").innerHTML = "<p>Gagal memuat detail produk.</p>";
  });
