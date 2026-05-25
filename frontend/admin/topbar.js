(function () {
  const apiTopbar = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("admin_token");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  window.addEventListener("DOMContentLoaded", () => {
    fetch(`${apiTopbar}/me`, { headers })
      .then(res => res.json())
      .then(data => {
        // Avatar
        const avatar = data.avatar_url || "assets/default-avatar.jpg";
        const avatarEl = document.getElementById("avatar");
        if (avatarEl) avatarEl.src = avatar;

        // Nama admin
        const nameEl = document.querySelector(".admin-name");
        if (nameEl) nameEl.textContent = data.name;

        // Simpan avatar ke localStorage
        localStorage.setItem("avatar_url", avatar);
      })
      .catch(() => {
        const avatarEl = document.getElementById("avatar");
        if (avatarEl) avatarEl.src = "assets/default-avatar.jpg";
      });
  });
  console.log("Avatar URL:", data.avatar_url);
})();