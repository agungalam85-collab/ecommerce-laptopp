const api = "http://127.0.0.1:8000/api";
let token = localStorage.getItem("admin_token");

// === LOGIN ADMIN ===
document.getElementById("adminLoginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  const res = await fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: form.get("email"),
      password: form.get("password")
    })
  });

  const data = await res.json();
  if (data.user?.role === "admin") {
    localStorage.setItem("admin_token", data.token);
    window.location.href = "dashboard.html";
  } else {
    alert("Login gagal atau bukan admin");
  }
});

// === REGISTER ADMIN ===
document.getElementById("adminRegisterForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  const res = await fetch(`${api}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role: "admin"
    })
  });

  const data = await res.json();
  if (data.token) {
    alert("Admin berhasil didaftarkan!");
    localStorage.setItem("admin_token", data.token);
    window.location.href = "dashboard.html";
  } else {
    alert("Gagal daftar admin: " + JSON.stringify(data));
  }
});

// === DASHBOARD PRODUK ===
if (document.getElementById("productList")) {
  // Ambil kategori untuk dropdown
  fetch(`${api}/categories`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const options = data.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
      document.getElementById("categorySelect").innerHTML = options;
      document.getElementById("editCategorySelect").innerHTML = options;
    });

  // Ambil produk
  fetch(`${api}/products`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("productList").innerHTML =
        data.map(p => `
          <li>
            ${p.name} - Rp${p.price} (${p.stock} stok)
            <button onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
            <button onclick="deleteProduct(${p.id})">Hapus</button>
          </li>
        `).join("");
    });

  // Tambah produk
  document.getElementById("addProductForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      price: form.get("price"),
      stock: form.get("stock"),
      category_id: form.get("category_id")
    };

    try {
      const res = await fetch(`${api}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Produk ditambahkan!");
        e.target.reset();
        location.reload();
      } else {
        alert("Gagal tambah produk: " + JSON.stringify(data));
      }
    } catch (err) {
      alert("Error saat kirim data: " + err.message);
    }
  });

  // Hapus produk
  window.deleteProduct = function(id) {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      fetch(`${api}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => location.reload());
    }
  };

  // Tampilkan form edit produk
  window.editProduct = function(product) {
    const form = document.getElementById("editProductForm");
    form.style.display = "block";
    form.name.value = product.name;
    form.description.value = product.description;
    form.price.value = product.price;
    form.stock.value = product.stock;
    form.category_id.value = product.category_id;
    form.id.value = product.id;
  };

  // Batal edit
  window.cancelEdit = function() {
    document.getElementById("editProductForm").style.display = "none";
  };

  // Simpan perubahan produk
  document.getElementById("editProductForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    if (form.get("price") <= 0 || form.get("stock") < 0) {
      alert("Harga dan stok harus bernilai positif!");
      return;
    }

    const res = await fetch(`${api}/products/${form.get("id")}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
        price: form.get("price"),
        stock: form.get("stock"),
        category_id: form.get("category_id")
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Produk berhasil diupdate!");
      e.target.reset();
      cancelEdit();
      location.reload();
    } else {
      alert("Gagal update produk: " + JSON.stringify(data));
    }
  });
}

// === KATEGORI ADMIN ===
if (document.getElementById("categoryList")) {
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
  
  // === PENGGUNA ADMIN ===
if (document.getElementById("userList")) {
  loadUsers();

  document.getElementById("addUserForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role: form.get("role")
    };

    const res = await fetch(`${api}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert("Pengguna berhasil ditambahkan!");
      e.target.reset();
      loadUsers();
    } else {
      alert("Gagal tambah pengguna: " + JSON.stringify(data));
    }
  });

  window.loadUsers = function () {
    const list = document.getElementById("userList");
    list.innerHTML = `<li>Memuat data pengguna...</li>`;

    fetch(`${api}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        list.innerHTML = data.map(u => `
          <li>
            <input value="${u.name}" onchange="updateUser(${u.id}, 'name', this.value)" />
            <input value="${u.email}" onchange="updateUser(${u.id}, 'email', this.value)" />
            <select onchange="updateUser(${u.id}, 'role', this.value)">
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
              <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>customer</option>
            </select>
            <span>${u.plain_password ?? '-'}</span>
            <button onclick="deleteUser(${u.id})">🗑️</button>
          </li>
        `).join("");
      })
      .catch(err => {
        list.innerHTML = `<li>Gagal akses data pengguna: ${err.message}</li>`;
      });
  };

  window.updateUser = function (id, field, value) {
    fetch(`${api}/users/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ [field]: value })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Update berhasil:", data);
        loadUsers();
      })
      .catch(err => {
        console.error("Gagal update:", err.message);
        alert("Gagal update pengguna.");
      });
  };

  window.deleteUser = function (id) {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;

    fetch(`${api}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Pengguna dihapus:", data);
        loadUsers();
      })
      .catch(err => {
        console.error("Gagal hapus:", err.message);
        alert("Gagal menghapus pengguna.");
      });
  };
}

 



  

}
// === INFO AKUN ADMIN ===
if (document.getElementById("adminInfo")) {
  fetch(`${api}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("infoName").textContent = data.name;
      document.getElementById("infoEmail").textContent = data.email;
      document.getElementById("infoRole").textContent = data.role;

      // Pre-fill form update profil
      document.querySelector("#updateProfileForm [name='name']").value = data.name;
      document.querySelector("#updateProfileForm [name='email']").value = data.email;
    });
}

// === UPDATE PROFIL ADMIN ===
document.getElementById("updateProfileForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  const res = await fetch(`${api}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: form.get("name"),
      email: form.get("email")
    })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Profil berhasil diupdate!");
    location.reload();
  } else {
    alert("Gagal update profil: " + JSON.stringify(data));
  }
});

// === GANTI PASSWORD ADMIN ===
document.getElementById("changePasswordForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  const old_password = form.get("old_password");
  const new_password = form.get("new_password");
  const confirm_password = form.get("confirm_password");

  if (new_password.length < 6) return alert("Password minimal 6 karakter");
  if (new_password !== confirm_password) return alert("Konfirmasi tidak cocok");

  const res = await fetch(`${api}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ old_password, new_password })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Password berhasil diganti!");
    e.target.reset();
  } else {
    alert("Gagal ganti password: " + JSON.stringify(data));
  }
});

// === PREVIEW AVATAR SEBELUM UPLOAD ===
document.getElementById("avatarInput").addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const previewURL = URL.createObjectURL(file);
    document.getElementById("avatar").src = previewURL;
  }
});

// === HANDLE SUBMIT FORM AVATAR ===
document.getElementById("form-avatar").addEventListener("submit", function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("avatarInput");
  const file = fileInput.files[0];
  if (!file) return alert("Pilih file dulu");

  const formData = new FormData();
  formData.append("avatar", file);

  fetch(`${api}/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("avatar").src = data.avatar_url;
        localStorage.setItem("avatar_url", data.avatar_url);
        alert("Foto berhasil diupload!");
      } else {
        alert("Gagal upload foto");
      }
    })
    .catch(() => alert("Terjadi kesalahan saat upload."));
});

// === TAMPILKAN AVATAR DI TOPBAR (DARI LOCALSTORAGE) ===
window.addEventListener("DOMContentLoaded", () => {
  const avatar = localStorage.getItem("avatar_url") || "assets/default-avatar.jpg";
  const avatarEl = document.getElementById("avatar");
  if (avatarEl) avatarEl.src = avatar;
});


// === LOGOUT ===
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("admin_token");
  window.location.href = "login.html";
});