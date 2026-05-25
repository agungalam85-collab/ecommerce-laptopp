const api = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("admin_token");

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json"
};

// === TAMPILKAN INFO AKUN ===
fetch(`${api}/me`, { headers })
  .then(res => {
    if (!res.ok) throw res;
    return res.json();
  })
  .then(data => {
    document.getElementById("nama").textContent = data.name;
    document.getElementById("email").textContent = data.email;
    document.getElementById("role").textContent = data.role;

    document.getElementById("name").value = data.name;
    document.getElementById("email").value = data.email;
  })
  .catch(async err => {
    const error = await err.json();
    alert("Gagal ambil data akun: " + (error.message || error.error));
  });

// === UPDATE PROFIL ===
document.getElementById("form-profil")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email.includes("@")) {
    alert("Nama dan email harus valid!");
    return;
  }

  try {
    const res = await fetch(`${api}/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Profil berhasil diupdate!");
      location.reload();
    } else {
      alert("Gagal update profil: " + (data.message || data.error));
    }
  } catch (err) {
    alert("Terjadi kesalahan saat update profil.");
  }
});

// === GANTI PASSWORD ===
document.getElementById("form-password")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const old_password = document.getElementById("old_password").value;
  const new_password = document.getElementById("new_password").value;
  const confirm_password = document.getElementById("confirm_password").value;

  if (new_password.length < 6) {
    alert("Password baru minimal 6 karakter");
    return;
  }

  if (new_password !== confirm_password) {
    alert("Konfirmasi password tidak cocok");
    return;
  }

  try {
    const res = await fetch(`${api}/password`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ old_password, new_password })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Password berhasil diganti!");
      document.getElementById("form-password").reset();
    } else {
      alert("Gagal ganti password: " + (data.message || data.error));
    }
  } catch (err) {
    alert("Terjadi kesalahan saat ganti password.");
  }
});

document.getElementById('form-avatar').addEventListener('submit', function(e) {
  e.preventDefault();
  const fileInput = document.getElementById('avatarInput');
  const file = fileInput.files[0];
  if (!file) return alert('Pilih file dulu');

  const formData = new FormData();
  formData.append('avatar', file);

  fetch(`${api}/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById('avatar').src = data.avatar_url;
      alert('Foto berhasil diupload!');
    } else {
      alert('Gagal upload foto');
    }
  })
  .catch(() => alert('Terjadi kesalahan saat upload.'));
});