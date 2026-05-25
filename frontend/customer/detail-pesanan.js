document.addEventListener("DOMContentLoaded", async () => {
  const name = localStorage.getItem("customer_name");
  if (name) document.getElementById("customerName").textContent = name;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  const token = localStorage.getItem("token");
  const orderId = new URLSearchParams(location.search).get("id");
  const container = document.getElementById("orderDetail");

  if (!token || !orderId) {
    container.innerHTML = "<p>Token atau ID pesanan tidak ditemukan. Silakan login ulang.</p>";
    return;
  }

  try {
    const res = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    if (res.status === 401) {
      alert("Sesi kadaluarsa. Silakan login ulang.");
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    const result = await res.json();
    const order = result.data;

    if (!order) {
      container.innerHTML = "<p>Pesanan tidak ditemukan atau tidak bisa diakses.</p>";
      console.log("Response:", result);
      return;
    }

    const statusBadge = {
      menunggu_konfirmasi: '<span class="badge orange">⏳ Menunggu Konfirmasi</span>',
      pending: '<span class="badge blue">📦 Diproses</span>',
      completed: '<span class="badge green">✅ Selesai</span>',
      cancelled: '<span class="badge red">❌ Dibatalkan</span>'
    }[order.status] || `<span class="badge gray">${order.status}</span>`;

    const items = order.details.map(item => `
      <li>${item.product.name} - Rp${parseFloat(item.price).toLocaleString("id-ID")} x ${item.quantity}</li>
    `).join("");

    container.innerHTML = `
      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Status:</strong> ${statusBadge}</p>
      <p><strong>Alamat:</strong><br>${order.address}</p>
      <p><strong>Metode Pembayaran:</strong> ${order.payment_method}</p>
      <p><strong>Total Harga:</strong> Rp${parseFloat(order.total_price).toLocaleString("id-ID")}</p>
      <h4>Item Pesanan:</h4>
      <ul>${items}</ul>
    `;
  } catch (err) {
    console.error("Gagal ambil detail pesanan:", err);
    container.innerHTML = "<p>Gagal memuat detail pesanan.</p>";
  }
});
