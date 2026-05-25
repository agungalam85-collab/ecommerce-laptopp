const api = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("admin_token");
let semuaProduk = [];

window.previewImages = function (event) {
  const preview = document.getElementById("imagePreview");
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
};

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

// === Tampilkan produk ===
function renderProduk(list) {
  const container = document.getElementById("productList");
  if (list.length === 0) {
    container.innerHTML = "<li>Produk tidak ditemukan.</li>";
    return;
  }

  container.innerHTML = list.map(p => {
    const galeri = (p.images || []).map(img => `
      <img src="${img.url}" alt="${p.name}" width="100" height="100" style="margin-right:8px; border-radius:6px; object-fit:cover;">
    `).join("");

    const specs = (p.specifications || []).map(s => `${s.key}: ${s.value}`).join(", ");
    const colors = (p.colors || []).map(c => `
      <span title="${c.name}" style="display:inline-block; width:16px; height:16px; border-radius:50%; background:${c.hex_code}; margin-right:4px;"></span>
    `).join("");

    return `
      <li class="product-card">
        <div class="product-gallery">${galeri}</div>
        <strong>${p.name}</strong> - Rp${parseInt(p.price).toLocaleString("id-ID")}
        (${p.stock} stok) <br/>
        <em>${p.description}</em> <br/>
        <small>Kategori: ${p.category?.name || "?"}</small><br/>
        <small>Spesifikasi: ${specs || '-'}</small><br/>
        <small>Warna: ${colors || '-'}</small><br/>
        <button onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
        <button onclick="deleteProduct(${p.id})">Hapus</button>
      </li>
    `;
  }).join("");
}



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
  form.category_id.value = String(product.category_id);
  form.id.value = product.id;

  // Tampilkan gambar lama
 const preview = document.getElementById("imagePreviewEdit");
  preview.innerHTML = (product.images || []).map(img => {
    const url = img.url || `/storage/${img.path}`;
    return `<img src="${url}" class="preview-thumb" width="100" height="100" style="object-fit:cover; border-radius:6px; margin-right:8px;" />`;
  }).join("");

  // Spesifikasi lama
  const specContainer = document.getElementById("editSpecContainer");
  specContainer.innerHTML = (product.specifications || []).map(s => `
    <div class="spec-row">
      <input type="text" name="spec_key[]" value="${s.key}" required />
      <input type="text" name="spec_value[]" value="${s.value}" required />
    </div>
  `).join("");

// Warna lama
  const colorContainer = document.getElementById("editColorContainer");
  colorContainer.innerHTML = (product.colors || []).map(c => `
    <div class="color-row">
      <input type="text" name="color_name[]" value="${c.name}" required />
      <input type="color" name="color_hex[]" value="${c.hex_code}" />
    </div>
  `).join("");



};

// === Preview Gambar Tambah Produk ===
window.previewImages = function (event) {
  const preview = document.getElementById("imagePreviewAdd");
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
};

// === Preview Gambar Edit Produk ===
window.previewImagesEdit = function (event) {
  const preview = document.getElementById("imagePreviewEdit");
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

function addSpec() {
  document.getElementById("specContainer").innerHTML += `
    <div class="spec-row">
      <input type="text" name="spec_key[]" placeholder="Key" required />
      <input type="text" name="spec_value[]" placeholder="Value" required />
    </div>
  `;
}

function addColor() {
  document.getElementById("colorContainer").innerHTML += `
    <div class="color-row">
      <input type="text" name="color_name[]" placeholder="Nama Warna" required />
      <input type="color" name="color_hex[]" />
    </div>
  `;
}


function addSpecEdit() {
  document.getElementById("editSpecContainer").innerHTML += `
    <div class="spec-row">
      <input type="text" name="spec_key[]" placeholder="Key" required />
      <input type="text" name="spec_value[]" placeholder="Value" required />
    </div>
  `;
}

function addColorEdit() {
  document.getElementById("editColorContainer").innerHTML += `
    <div class="color-row">
      <input type="text" name="color_name[]" placeholder="Nama Warna" required />
      <input type="color" name="color_hex[]" />
    </div>
  `;
}
 window.addEventListener("DOMContentLoaded", () => {
  addSpec();
  addColor();
});
