let startTime = null;
let interval = null;
let lastElapsed = 0;

const formatDuration = (ms) => {
  const elapsed = new Date(ms);
  const h = String(elapsed.getUTCHours()).padStart(2, "0");
  const m = String(elapsed.getUTCMinutes()).padStart(2, "0");
  const s = String(elapsed.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const updateDisplay = (el) => {
  const now = Date.now();
  const elapsed = now - startTime;
  lastElapsed = elapsed;
  el.textContent = formatDuration(elapsed);
};

export const initTimeTracker = () => {
  const container = document.getElementById("dashboard-sections");

  // si le timer existe deja il apparaitra pas
  if (!document.getElementById("timeDisplay")) {
    container.innerHTML = `
      <div class="box">
      <h2 class="title is-4">Suivi du Temps</h2>
      <div id="timeDisplay" class="title is-3 has-text-centered">00:00:00</div>
      <div class="buttons is-centered mt-4">
        <button class="button is-primary" id="startTimer"><i class="fas fa-play"></i> Démarrer</button>
        <button class="button is-danger" id="stopTimer"><i class="fas fa-stop"></i> Arrêter</button>
      </div>
    </div>
  `;
  }

  const display = document.getElementById("timeDisplay");
  const startButton = document.getElementById("startTimer");
  const stopButton = document.getElementById("stopTimer");

  if (!display || !startButton || !stopButton) {
    console.error("⛔ Timer elements are missing!");
    return;
  }

  const tick = () => updateDisplay(display);

  startButton.onclick = () => {
    if (interval) return;

    startTime = startTime || Date.now() - lastElapsed;
    interval = setInterval(tick, 1000);
    tick();
  };

  stopButton.onclick = () => {
    if (!interval) return;

    clearInterval(interval);
    interval = null;
    const duration = formatDuration(lastElapsed);
    console.log(`⏱️ Temps enregistré : ${duration}`);
    alert(`Temps total : ${duration}`);

    startTime = null;
    lastElapsed = 0;
    display.textContent = "00:00:00";
  };

  if (interval) tick();
};
