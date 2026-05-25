const api = "http://127.0.0.1:8000/api";

function getToken() {
   const token = localStorage.getItem("admin_token"); // ← ini yang benar
  if (!token || token.length < 10) {
    console.warn("Token tidak valid atau kosong.");
    return null;

  }
  return token;
}

function renderUsers(users) {
  const table = document.getElementById("userTable");

  if (!Array.isArray(users) || users.length === 0) {
    table.innerHTML = `<tr><td colspan="6">Record tidak ada.</td></tr>`;
    return;
  }

  const rows = users.map(user => `
    <tr>
      <td><input type="text" value="${user.name}" onchange="updateUser(${user.id}, 'name', this.value)" /></td>
      <td><input type="email" value="${user.email}" onchange="updateUser(${user.id}, 'email', this.value)" /></td>
      <td>
        <select onchange="updateUser(${user.id}, 'role', this.value)">
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
          <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>customer</option>
        </select>
      </td>
      <td>${user.plain_password ?? '-'}</td>
      <td>${new Date(user.created_at).toLocaleString("id-ID")}</td>
      <td><button onclick="deleteUser(${user.id})">🗑️</button></td>
    </tr>
  `).join("");

  table.innerHTML = rows;
}

function loadUsers() {
  const table = document.getElementById("userTable");
  table.innerHTML = `<tr><td colspan="6">Memuat data pengguna...</td></tr>`;

  const token = getToken();
  if (!token) {
    table.innerHTML = `<tr><td colspan="6">Token tidak tersedia. Silakan login ulang.</td></tr>`;
    return;
  }

  fetch(`${api}/users`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      const users = Array.isArray(data) ? data : data.data;
      renderUsers(users);
    })
    .catch(err => {
      table.innerHTML = `<tr><td colspan="6">Gagal memuat data pengguna: ${err.message}</td></tr>`;
    });
}

function updateUser(id, field, value) {
  const token = getToken();
  if (!token) return alert("Token tidak tersedia.");

  const payload = { [field]: value };

  fetch(`${api}/users/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => {
          console.warn("Respons error:", text);
          throw new Error(`Gagal update: ${res.status}`);
        });
      }
      return res.json();
    })
    .then(data => {
      console.log("Update berhasil:", data);
      loadUsers(); // refresh tampilan
    })
    .catch(err => {
      console.error("Gagal update:", err.message);
      alert("Gagal update data.");
    });
}

function deleteUser(id) {
  if (!confirm("Yakin ingin menghapus pengguna ini?")) return;

  const token = getToken();
  if (!token) return alert("Token tidak tersedia.");

  fetch(`${api}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Gagal hapus");
      return res.json();
    })
    .then(data => {
      console.log("Pengguna dihapus:", data);
      loadUsers(); // refresh tampilan
    })
    .catch(err => {
      console.error("Gagal hapus:", err.message);
      alert("Gagal menghapus pengguna.");
    });
}

loadUsers();