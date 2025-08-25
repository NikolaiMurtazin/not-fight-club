document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".registration-form");
  const input = document.querySelector("#name");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = input.value.trim();

    if (name) {
      localStorage.setItem("playerName", name);

      window.location.href = "home.html";
    } else {
      alert("Введите имя персонажа!");
    }
  });
});