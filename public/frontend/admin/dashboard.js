const api = "http://127.0.0.1:8000/api";
let token = localStorage.getItem("admin_token");

Promise.all([
  fetch(`${api}/products`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  fetch(`${api}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  })
])
  .then(async ([resProduk, resPesanan]) => {
    const produkData = await resProduk.json();
    const pesananData = await resPesanan.json();

    const produkList = produkData.data;
    const pesananList = pesananData.data;

    // === Statistik Produk ===
    const totalProduk = produkList.length;
    const totalStok = produkList.reduce((sum, p) => sum + p.stock, 0);
    const produkTermahal = produkList.reduce((max, p) => parseFloat(p.price) > parseFloat(max.price) ? p : max, produkList[0]);
    const produkStokMin = produkList.reduce((min, p) => p.stock < min.stock ? p : min, produkList[0]);

    // === Statistik Pesanan ===
    const totalPesanan = pesananList.length;
    const pesananBaru = pesananList.filter(p => p.status === "pending").length;

    document.getElementById("statList").innerHTML = `
      <li>Total Produk: ${totalProduk}</li>
      <li>Total Stok: ${totalStok}</li>
      <li>Produk Termahal: ${produkTermahal.name} (Rp${parseInt(produkTermahal.price).toLocaleString("id-ID")})</li>
      <li>Stok Terendah: ${produkStokMin.name} (${produkStokMin.stock} stok)</li>
      <li>Total Pesanan: ${totalPesanan}</li>
      <li>Pesanan Baru: ${pesananBaru}</li>
    `;
  })
  .catch(err => {
    console.error("Gagal ambil statistik:", err);
    document.getElementById("statList").innerHTML = "<li>Gagal memuat statistik.</li>";
  });

// === LOGOUT ===
function logout() {
  localStorage.removeItem("admin_token");
  window.location.href = "login.html";
}
