// ============ Carrusel ============
const screens = Array.from(document.querySelectorAll(".screen"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsEl = document.getElementById("dots");

let current = 0;

// Crea dots
function buildDots() {
  dotsEl.innerHTML = "";
  for (let i = 0; i < screens.length; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (i === current ? " active" : "");
    d.addEventListener("click", () => show(i));
    dotsEl.appendChild(d);
  }
}

function updateDots() {
  const dots = Array.from(dotsEl.querySelectorAll(".dot"));
  dots.forEach((d, i) => d.classList.toggle("active", i === current));
}

function show(index) {
  current = Math.max(0, Math.min(index, screens.length - 1));

  screens.forEach((s, i) => s.classList.toggle("active", i === current));
  updateDots();

  prevBtn.disabled = current === 0;
  nextBtn.textContent = current === screens.length - 1 ? "Reiniciar" : "Siguiente";

  // Cuando entrás a la pantalla de racha, renderiza (random + animación)
  const activeId = screens[current].id;
  if (activeId === "screen-streak") {
    renderStreakScreen({ user: "@usuario", dailyVideos: 800 });
  }
}

prevBtn.addEventListener("click", () => show(current - 1));
nextBtn.addEventListener("click", () => {
  if (current === screens.length - 1) show(0);
  else show(current + 1);
});

// Swipe (mobile)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});
document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const dx = touchEndX - touchStartX;
  if (Math.abs(dx) > 40) {
    if (dx < 0) show(current + 1);
    else show(current - 1);
  }
});

// Init
buildDots();
show(0);

// ============ Pantalla Racha ============
function randomStreakDays(min = 1, max = 500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStreakTier(days) {
  if (days >= 200) return { label: "200D+", colorVar: "--streak-200" };
  if (days >= 100) return { label: "100D",  colorVar: "--streak-100" };
  if (days >= 30)  return { label: "30D",   colorVar: "--streak-30" };
  if (days >= 10)  return { label: "10D",   colorVar: "--streak-10" };
  if (days >= 3)   return { label: "3D",    colorVar: "--streak-3" };
  return { label: "NEW", colorVar: "--streak-off" };
}

function animateCount(el, target, durationMs = 1000) {
  const startTime = performance.now();
  const start = 0;

  function tick(now) {
    const t = Math.min(1, (now - startTime) / durationMs);
    const value = Math.floor(start + (target - start) * t);
    el.textContent = value.toString();
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderStreakScreen({ user = "@usuario", dailyVideos = 800 } = {}) {
  const days = randomStreakDays(1, 500);
  const tier = getStreakTier(days);

  const badge = document.getElementById("streak-badge");
  const tag = document.getElementById("streak-tag");
  const num = document.getElementById("streak-number");
  const subtitle = document.getElementById("streak-subtitle");
  const comment = document.getElementById("streak-comment");
  const meter = document.getElementById("streak-meter");

  // Obtener color real desde la CSS var
  const tierColor = getComputedStyle(document.documentElement)
    .getPropertyValue(tier.colorVar)
    .trim();

  // Badge + color
  badge.textContent = tier.label;
  badge.style.background = tierColor;

  // Texto
  tag.textContent = `con ${user}`;
  subtitle.textContent = `${days} días de racha con ${user}`;
  comment.textContent = `${dailyVideos} videos, todos los días. Eso sí que es compromiso.`;

  // Barra (tomamos 500 como "máximo visual")
  const pct = Math.min(100, Math.round((days / 500) * 100));
  meter.style.background = tierColor;
  meter.style.width = pct + "%";

  // Contador animado
  num.textContent = "0";
  animateCount(num, days, 1100);
}
