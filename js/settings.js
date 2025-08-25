document.addEventListener("DOMContentLoaded", () => {
  const nameInput   = document.getElementById("player-name");
  const form        = document.getElementById("settings-form");
  const cancelBtn   = document.getElementById("cancel-btn");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (nameInput.value.trim()) {
      localStorage.setItem("playerName", nameInput.value.trim());
    }
    alert("✅ Settings saved!");
    window.location.href = "home.html";
  });

  cancelBtn.addEventListener("click", () => {
    window.location.href = "home.html";
  });
});