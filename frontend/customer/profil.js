document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  // Tampilkan nama dan avatar di header
  try {
    const res = await fetch('http://localhost:8000/api/customer/info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const user = await res.json();

    // Header
    document.getElementById('customerName').textContent = user.full_name || user.name || 'Customer';
    document.getElementById('avatarPreview').src = user.avatar_url || '/images/default.jpg';

    // Isi form profil
    document.getElementById('full_name').value = user.full_name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('address').value = user.address || '';
    document.getElementById('birth_date').value = user.birth_date || '';
    document.getElementById('gender').value = user.gender || '';
  } catch (err) {
    alert('Gagal memuat data profil');
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customer_name');
    window.location.href = 'login.html';
  });

  // Simpan profil
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const payload = {
      full_name: document.getElementById('full_name').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      birth_date: document.getElementById('birth_date').value,
      gender: document.getElementById('gender').value
    };

    try {
      const res = await fetch('http://localhost:8000/api/customer/info', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Profil berhasil disimpan');
      } else {
        alert('Gagal menyimpan profil');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan');
    }
  });
});
