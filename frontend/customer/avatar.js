document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Token tidak ditemukan. Silakan login ulang.');
    window.location.href = 'login.html';
    return;
  }

  // 🔧 Helper untuk fallback avatar
  const resolveAvatar = (url) => url || '/images/default.jpg';

  // Ambil info customer dan tampilkan nama + avatar
  try {
    const res = await fetch('http://localhost:8000/api/customer/info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const user = await res.json();
    document.getElementById('customerName').textContent = user.full_name || user.name || 'Customer';
    const avatarUrl = resolveAvatar(user.avatar_url);
    document.getElementById('preview').src = avatarUrl;
    const avatarTopbar = document.getElementById('avatarPreview');
    if (avatarTopbar) avatarTopbar.src = avatarUrl;
  } catch (err) {
    console.error('Gagal ambil info customer:', err);
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('customer_name');
      window.location.href = 'login.html';
    });
  }

  // Preview avatar sebelum upload
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', () => {
      const file = avatarInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          document.getElementById('preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Upload avatar
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const file = avatarInput.files[0];
      if (!file) return alert('Pilih file dulu');

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await fetch('http://localhost:8000/api/customer/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          alert(data.message || 'Avatar berhasil diupload');
          const avatarUrl = resolveAvatar(data.avatar_url);
          document.getElementById('preview').src = avatarUrl;
          const avatarTopbar = document.getElementById('avatarPreview');
          if (avatarTopbar) avatarTopbar.src = avatarUrl;
        } else {
          alert('Gagal upload avatar');
        }
      } catch (err) {
        alert('Terjadi kesalahan saat upload');
        console.error(err);
      }
    });
  }
});
