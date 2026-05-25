const api = "http://127.0.0.1:8000/api";
let token = localStorage.getItem("admin_token");

// === Tampilkan kategori ===
fetch(`${api}/categories`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(result => {
    const data = result.data || result; // antisipasi format response
    document.getElementById("categoryList").innerHTML =
      data.map(c => `
        <li>
          ${c.logo_url ? `<img src="${c.logo_url}" alt="${c.name}" width="32" style="vertical-align:middle;margin-right:8px;">` : ""}
          ${c.name}
          <button onclick="deleteCategory(${c.id})">Hapus</button>
        </li>
      `).join("");
  })
  .catch(err => {
    console.error("❌ Gagal ambil kategori:", err);
    document.getElementById("categoryList").innerHTML = "<p>Gagal memuat kategori.</p>";
  });

// === Tambah kategori ===
document.getElementById("addCategoryForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const name = form.get("name");
  const logo_url = form.get("logo_url");

  if (!name.trim()) {
    alert("Nama kategori tidak boleh kosong!");
    return;
  }

  try {
    const res = await fetch(`${api}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, logo_url })
    });

    const data = await res.json();
    alert(data.message || "Kategori ditambahkan!");
    e.target.reset();
    location.reload();
  } catch (err) {
    console.error("❌ Gagal tambah kategori:", err);
    alert("Gagal menambahkan kategori");
  }
});

// === Hapus kategori ===
window.deleteCategory = function(id) {
  if (confirm("Yakin ingin menghapus kategori ini?")) {
    fetch(`${api}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Kategori berhasil dihapus");
        location.reload();
      })
      .catch(err => {
        console.error("❌ Gagal hapus kategori:", err);
        alert("Gagal menghapus kategori");
      });
  }
};
