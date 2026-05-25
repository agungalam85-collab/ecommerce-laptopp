const api = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("admin_token");
let semuaProduk = [];

if (!token) {
  alert("Silakan login terlebih dahulu.");
  window.location.href = "login.html";
}

// === Ambil kategori ===
fetch(`${api}/categories`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => {
    const options = data.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    document.getElementById("categorySelect").innerHTML = options;
    document.getElementById("editCategorySelect").innerHTML = options;
    document.getElementById("filterKategori").innerHTML += options;
  });

// === Ambil produk ===
fetch(`${api}/products`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => {
    semuaProduk = data.data;
    renderProduk(semuaProduk);
  });

// === Render produk ===
// === Render produk ===
function renderProduk(list) {
  const container = document.getElementById("productList");
  if (!list || list.length === 0) {
    container.innerHTML = "<li>Produk tidak ditemukan.</li>";
    return;
  }

  container.innerHTML = list.map(p => {
    const galeri = (p.images || []).map(img => `
      <div style="display:inline-block; position:relative; margin-right:8px;">
        <img src="${img.url || '/storage/' + img.path}" alt="${p.name}" width="100" height="100"
             style="border-radius:6px; object-fit:cover;">
        <button onclick="deleteImage(${img.id})"
                style="position:absolute; top:0; right:0; background:red; color:#fff; border:none; border-radius:50%; cursor:pointer;">✖</button>
      </div>
    `).join("");

    const colors = (p.colors || []).map(c => `
      <span title="${c.name}" style="display:inline-block; width:16px; height:16px; border-radius:50%; background:${c.hex_code}; margin-right:4px;"></span>
    `).join("");

    return `
      <li class="product-card">
        <div class="product-gallery">${galeri}</div>
        <strong>${p.name}</strong> - Rp${parseInt(p.price).toLocaleString("id-ID")}
        (${p.stock} stok, ${p.weight ?? 0} kg) <br/>
        <em>${p.description}</em> <br/>
        <small>Kategori: ${p.category?.name || "-"}</small><br/>
        <small>Warna: ${colors || '-'}</small><br/>
        <button onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
        <button onclick="deleteProduct(${p.id})">Hapus</button>
      </li>
    `;
  }).join("");
}

// === Hapus gambar ===
window.deleteImage = function(imageId) {
  if (confirm("Yakin ingin menghapus gambar ini?")) {
    fetch(`${api}/images/${imageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.ok) {
        alert("Gambar berhasil dihapus!");
        location.reload();
      } else {
        return res.json().then(data => {
          alert("Gagal hapus gambar: " + JSON.stringify(data));
        });
      }
    });
  }
};


// === Preview Gambar ===
function previewImages(event, targetId) {
  const preview = document.getElementById(targetId);
  preview.innerHTML = "";
  const files = event.target.files;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "preview-thumb";
      img.width = 80;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}
window.previewImagesAdd = e => previewImages(e, "imagePreview");
window.previewImagesEdit = e => previewImages(e, "imagePreviewEdit");

// === Tambah produk ===
document.getElementById("addProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const res = await fetch(`${api}/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  if (res.ok) {
    alert("Produk ditambahkan!");
    e.target.reset();
    document.getElementById("imagePreview").innerHTML = "";
    location.reload();
  } else {
    const data = await res.json();
    alert("Gagal tambah produk: " + JSON.stringify(data));
  }
});

// === Edit produk ===
window.editProduct = function(product) {
  const form = document.getElementById("editProductForm");
  form.style.display = "block";
  form.name.value = product.name;
  form.description.value = product.description;
  form.price.value = product.price;
  form.stock.value = product.stock;
  form.weight.value = product.weight;
  form.category_id.value = String(product.category_id);
  form.id.value = product.id;

  // Gambar lama
  const preview = document.getElementById("imagePreviewEdit");
  preview.innerHTML = (product.images || []).map(img => {
    const url = img.url || `/storage/${img.path}`;
    return `<img src="${url}" class="preview-thumb" width="100" height="100" style="object-fit:cover; border-radius:6px; margin-right:8px;" />`;
  }).join("");

  // Spesifikasi default
  const defaultKeys = ["Layar","RAM","Storage","Kamera","Baterai","Chipset","OS"];
  const specContainer = document.getElementById("editSpecContainer");
  specContainer.innerHTML = defaultKeys.map(k => {
    const val = (product.specifications || []).find(s => s.key === k)?.value || "";
    return `
      <div class="spec-row">
        <label>${k}</label>
        <input type="hidden" name="spec_key[]" value="${k}" />
        <input type="text" name="spec_value[]" value="${val}" />
      </div>
    `;
  }).join("");

  // Warna lama
  const colorContainer = document.getElementById("editColorContainer");
  colorContainer.innerHTML = (product.colors || []).map(c => `
    <div class="color-row">
      <input type="text" name="color_name[]" value="${c.name}" required />
      <input type="color" name="color_hex[]" value="${c.hex_code}" />
    </div>
  `).join("");
};

window.cancelEdit = function() {
  document.getElementById("editProductForm").style.display = "none";
};

document.getElementById("editProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  formData.append("_method", "PUT");

  const res = await fetch(`${api}/products/${formData.get("id")}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  if (res.ok) {
    alert("Produk berhasil diupdate!");
    e.target.reset();
    cancelEdit();
    location.reload();
  } else {
    const data = await res.json();
    alert("Gagal update produk: " + JSON.stringify(data));
  }
});

// === Hapus produk ===
window.deleteProduct = function(id) {
  if (confirm("Yakin ingin menghapus produk ini?")) {
    fetch(`${api}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => location.reload());
  }
};

// === Filter produk ===
window.applyFilter = function() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const kategoriId = document.getElementById("filterKategori").value;

  const hasil = semuaProduk.filter(p => {
    const cocokKeyword = p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword);
    const cocokKategori = kategoriId === "" || p.category_id == parseInt(kategoriId);
    return cocokKeyword && cocokKategori;
  });

  renderProduk(hasil);
};
