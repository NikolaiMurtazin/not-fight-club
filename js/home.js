document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("playerName");
  const playerNameEl = document.getElementById("player-name");
  const welcomeNameEl = document.getElementById("welcome-name");

  if (!name) {
    window.location.href = "index.html";
    return;
  }

  playerNameEl.textContent = name;
  welcomeNameEl.textContent = `, ${name}`;
});
