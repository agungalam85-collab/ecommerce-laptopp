const api = "http://127.0.0.1:8000/api";
let token = localStorage.getItem("admin_token");

// Tampilkan kategori
fetch(`${api}/categories`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => {
    document.getElementById("categoryList").innerHTML =
      data.map(c => `
        <li>
          ${c.name}
          <button onclick="deleteCategory(${c.id})">Hapus</button>
        </li>
      `).join("");
  });

// Tambah kategori
document.getElementById("addCategoryForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const name = form.get("name");

  if (!name.trim()) {
    alert("Nama kategori tidak boleh kosong!");
    return;
  }

  const res = await fetch(`${api}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });

  const data = await res.json();
  alert("Kategori ditambahkan!");
  e.target.reset();
  location.reload();
});

// Hapus kategori
window.deleteCategory = function(id) {
  if (confirm("Yakin ingin menghapus kategori ini?")) {
    fetch(`${api}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => location.reload());
  }
};