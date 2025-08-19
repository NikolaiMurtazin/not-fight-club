document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("playerName");
  if (!name) {
    window.location.href = "../index.html";
    return;
  }

  const youNameEl = document.getElementById("you-name");
  const youAvatarEl = document.getElementById("you-avatar");
  const enemyNameEl = document.getElementById("enemy-name");
  const enemyAvatarEl = document.getElementById("enemy-avatar");

  const youHpFill = document.getElementById("you-hp-fill");
  const youHpText = document.getElementById("you-hp-text");
  const enemyHpFill = document.getElementById("enemy-hp-fill");
  const enemyHpText = document.getElementById("enemy-hp-text");

  const youAtkEl = document.getElementById("you-atk");
  const youCritEl = document.getElementById("you-crit");
  const youCritMulEl = document.getElementById("you-critmul");
  const enemyAtkEl = document.getElementById("enemy-atk");
  const enemyCritEl = document.getElementById("enemy-crit");
  const enemyCritMulEl = document.getElementById("enemy-critmul");

  const nextTurnBtn = document.getElementById("next-turn");
  const newBattleBtn = document.getElementById("new-battle");
  const clearLogBtn = document.getElementById("clear-log");
  const logList = document.getElementById("log-list");

  const attackButtons = document.querySelector('.zone-buttons[data-type="attack"]');
  const defenceButtons = document.querySelector('.zone-buttons[data-type="defence"]');

  const ZONES = ["head", "neck", "body", "belly", "legs"]; // 5 зон
  const ATTACK_NEED = 1;
  const DEFENCE_NEED = 2;
  document.getElementById("attack-need").textContent = ATTACK_NEED;
  document.getElementById("defence-need").textContent = DEFENCE_NEED;

  youNameEl.textContent = name;
  youAvatarEl.src = localStorage.getItem("playerAvatar") || "../assets/img/avatars/default.png";

  const YOU = {
    maxHp: 120,
    hp: 120,
    damage: 18,
    critChance: 0.15,
    critMul: 1.5,
    attackCount: 1,
    blockCount: 2
  };

  const ENEMIES = [
    {
      name: "Goblin",
      avatar: "../assets/img/enemies/goblin.png",
      maxHp: 110, hp: 110,
      damage: 16, critChance: 0.10, critMul: 1.5,
      attackCount: 1, blockCount: 1
    },
    {
      name: "Spider",
      avatar: "../assets/img/enemies/spider.png",
      maxHp: 130, hp: 130,
      damage: 14, critChance: 0.12, critMul: 1.5,
      attackCount: 2, blockCount: 1
    },
    {
      name: "Troll",
      avatar: "../assets/img/enemies/troll.png",
      maxHp: 160, hp: 160,
      damage: 20, critChance: 0.08, critMul: 1.5,
      attackCount: 1, blockCount: 3
    }
  ];

  let ENEMY = clone(pickRandom(ENEMIES));
  enemyNameEl.textContent = ENEMY.name;
  enemyAvatarEl.src = ENEMY.avatar;

  youAtkEl.textContent = YOU.damage;
  youCritEl.textContent = `${Math.round(YOU.critChance * 100)}%`;
  youCritMulEl.textContent = YOU.critMul;
  enemyAtkEl.textContent = ENEMY.damage;
  enemyCritEl.textContent = `${Math.round(ENEMY.critChance * 100)}%`;
  enemyCritMulEl.textContent = ENEMY.critMul;

  renderHp();

  let selectedAttack = null;
  let selectedDefences = new Set();

  attackButtons.addEventListener("click", (e) => {
    const btn = e.target.closest(".zone");
    if (!btn) return;
    [...attackButtons.querySelectorAll(".zone")].forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedAttack = btn.dataset.zone;
    toggleTurnButton();
  });

  defenceButtons.addEventListener("click", (e) => {
    const btn = e.target.closest(".zone");
    if (!btn) return;
    const zone = btn.dataset.zone;
    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      selectedDefences.delete(zone);
    } else {
      if (selectedDefences.size < DEFENCE_NEED) {
        btn.classList.add("active");
        selectedDefences.add(zone);
      } else {
        const first = selectedDefences.values().next().value;
        selectedDefences.delete(first);
        defenceButtons.querySelector(`.zone[data-zone="${first}"]`)?.classList.remove("active");
        btn.classList.add("active");
        selectedDefences.add(zone);
      }
    }
    toggleTurnButton();
  });

  function toggleTurnButton() {
    nextTurnBtn.disabled = !(selectedAttack && selectedDefences.size === DEFENCE_NEED);
  }

  nextTurnBtn.addEventListener("click", () => {
    if (nextTurnBtn.disabled) return;

    const enemyAttacks = pickUnique(ZONES, ENEMY.attackCount);
    const enemyBlocks  = pickUnique(ZONES, ENEMY.blockCount);

    resolveHit({
      attacker: "You",
      defender: ENEMY.name,
      zone: selectedAttack,
      attackerStats: YOU,
      defenderBlocks: enemyBlocks,
      onDamage: (dmg, isCrit, wasBlocked) => {
        ENEMY.hp = Math.max(0, ENEMY.hp - dmg);
        logHit("You", ENEMY.name, selectedAttack, dmg, isCrit, wasBlocked);
      }
    });

    for (const z of enemyAttacks) {
      resolveHit({
        attacker: ENEMY.name,
        defender: "You",
        zone: z,
        attackerStats: ENEMY,
        defenderBlocks: Array.from(selectedDefences),
        onDamage: (dmg, isCrit, wasBlocked) => {
          YOU.hp = Math.max(0, YOU.hp - dmg);
          logHit(ENEMY.name, "You", z, dmg, isCrit, wasBlocked);
        }
      });
    }

    renderHp();
    checkEnd();
  });

  newBattleBtn.addEventListener("click", startNewBattle);
  clearLogBtn.addEventListener("click", () => { logList.innerHTML = ""; });

  function resolveHit({ attacker, defender, zone, attackerStats, defenderBlocks, onDamage }) {
    const blocked = defenderBlocks.includes(zone);
    const isCrit = Math.random() < attackerStats.critChance;
    let damage = attackerStats.damage;
    if (isCrit) damage = Math.floor(damage * attackerStats.critMul);

    if (!blocked || isCrit) {
      onDamage(damage, isCrit, blocked);
    } else {
      onDamage(0, false, true);
    }
  }

  function renderHp() {
    const youPct = Math.round((YOU.hp / YOU.maxHp) * 100);
    const enemyPct = Math.round((ENEMY.hp / ENEMY.maxHp) * 100);
    youHpFill.style.width = `${youPct}%`;
    enemyHpFill.style.width = `${enemyPct}%`;
    youHpText.textContent = `${YOU.hp} / ${YOU.maxHp}`;
    enemyHpText.textContent = `${ENEMY.hp} / ${ENEMY.maxHp}`;
  }

  function checkEnd() {
    if (YOU.hp <= 0 || ENEMY.hp <= 0) {
      nextTurnBtn.disabled = true;
      const youDead = YOU.hp <= 0;
      const enemyDead = ENEMY.hp <= 0;

      if (youDead && enemyDead) {
        addLog(`🤝 Both fall unconscious. It's a draw.`);
      } else if (enemyDead) {
        addLog(`🏆 <span class="who">You</span> win!`);
        updateStats({ win: true });
      } else {
        addLog(`💀 <span class="who">${ENEMY.name}</span> wins.`);
        updateStats({ win: false });
      }
    }
  }

  function startNewBattle() {
    selectedAttack = null;
    selectedDefences.clear();
    [...document.querySelectorAll(".zone.active")].forEach(b => b.classList.remove("active"));

    ENEMY = clone(pickRandom(ENEMIES));
    enemyNameEl.textContent = ENEMY.name;
    enemyAvatarEl.src = ENEMY.avatar;

    YOU.hp = YOU.maxHp;
    ENEMY.hp = ENEMY.maxHp;
    renderHp();

    enemyAtkEl.textContent = ENEMY.damage;
    enemyCritEl.textContent = `${Math.round(ENEMY.critChance * 100)}%`;
    enemyCritMulEl.textContent = ENEMY.critMul;

    nextTurnBtn.disabled = true;
    addLog(`⚔️ New battle started: <span class="who">You</span> vs <span class="who">${ENEMY.name}</span>.`);
  }

  function logHit(attacker, defender, zone, damage, isCrit, wasBlocked) {
    const critTxt = isCrit ? ` <span class="crit">CRIT!</span>` : "";
    const blockTxt = wasBlocked && damage === 0 ? ` (blocked)` : "";
    addLog(`🗡️ <span class="who">${attacker}</span> hits <span class="who">${defender}</span> to <span class="zone">${zone}</span> for <span class="dmg">${damage}</span> dmg${critTxt}${blockTxt}.`);
  }

  function addLog(html) {
    const li = document.createElement("li");
    li.innerHTML = html;
    logList.appendChild(li);
    logList.scrollTop = logList.scrollHeight;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function pickUnique(pool, n) {
    const copy = [...pool];
    const out = [];
    while (out.length < n && copy.length) {
      const i = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(i, 1)[0]);
    }
    return out;
  }
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  function updateStats({ win }) {
    const stats = JSON.parse(localStorage.getItem("playerStats") || '{"wins":0,"losses":0}');
    if (win) stats.wins = (stats.wins || 0) + 1;
    else stats.losses = (stats.losses || 0) + 1;
    localStorage.setItem("playerStats", JSON.stringify(stats));
  }

  addLog(`⚔️ Battle started: <span class="who">You</span> vs <span class="who">${ENEMY.name}</span>. Choose zones and press <b>Next turn</b>.`);
});