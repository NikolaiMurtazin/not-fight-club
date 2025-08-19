document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("playerName");
  if (!name) {
    window.location.href = "../index.html";
    return;
  }

  const nameEl = document.getElementById("player-name");
  const winsEl = document.getElementById("wins");
  const lossesEl = document.getElementById("losses");
  const avatarImg = document.getElementById("avatar-img");

  const picker = document.getElementById("avatar-picker");
  const changeBtn = document.getElementById("change-avatar-btn");
  const thumbs = document.getElementById("thumbs");
  const saveBtn = document.getElementById("save-avatar");
  const cancelBtn = document.getElementById("cancel-avatar");
  const avatarUrlInput = document.getElementById("avatar-url");

  nameEl.textContent = name;

  const stats = JSON.parse(localStorage.getItem("playerStats") || '{"wins":0,"losses":0}');
  winsEl.textContent = stats.wins ?? 0;
  lossesEl.textContent = stats.losses ?? 0;

  const DEFAULT_AVATAR = "../assets/img/avatars/default.png";

  let currentAvatar = localStorage.getItem("playerAvatar");
  if (!currentAvatar) {
    currentAvatar = DEFAULT_AVATAR;
    localStorage.setItem("playerAvatar", currentAvatar);
  }
  avatarImg.src = currentAvatar;

  const pathTail = (p) => {
    try {
      const u = new URL(p, window.location.href);
      return u.pathname;
    } catch {
      return p;
    }
  };

  changeBtn.addEventListener("click", () => {
    picker.hidden = false;
    const currTail = pathTail(currentAvatar);
    [...thumbs.querySelectorAll(".thumb")].forEach(b => {
      b.classList.toggle("selected", currTail.endsWith(pathTail(b.dataset.src)));
    });
  });

  cancelBtn.addEventListener("click", () => {
    picker.hidden = true;
    avatarUrlInput.value = "";
    clearSelection();
  });

  let selectedSrc = null;
  function clearSelection() {
    [...thumbs.querySelectorAll(".thumb")].forEach(b => b.classList.remove("selected"));
    selectedSrc = null;
  }

  thumbs.addEventListener("click", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn) return;
    clearSelection();
    btn.classList.add("selected");
    selectedSrc = btn.dataset.src;
    avatarUrlInput.value = "";
  });

  saveBtn.addEventListener("click", () => {
    let finalSrc = selectedSrc;

    const url = avatarUrlInput.value.trim();
    if (url) finalSrc = url;

    if (!finalSrc) {
      alert("Choose a thumbnail or paste an image URL.");
      return;
    }

    const isHttp = /^https?:\/\//i.test(finalSrc);
    const isRelative = finalSrc.startsWith("../assets/") || finalSrc.startsWith("assets/") || finalSrc.startsWith("./assets/");
    if (!isHttp && !isRelative) {
      alert("Use http(s) URL or a path like ../assets/img/avatars/…");
      return;
    }

    localStorage.setItem("playerAvatar", finalSrc);
    currentAvatar = finalSrc;
    avatarImg.src = finalSrc;

    picker.hidden = true;
    avatarUrlInput.value = "";
    clearSelection();
  });

  avatarImg.addEventListener("error", () => {
    avatarImg.src = DEFAULT_AVATAR;
    localStorage.setItem("playerAvatar", DEFAULT_AVATAR);
    currentAvatar = DEFAULT_AVATAR;
  });
});

