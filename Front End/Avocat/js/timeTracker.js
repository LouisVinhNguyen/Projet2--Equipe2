let startTime = null
let interval = null
let lastElapsed = 0 // ms

const formatDuration = (ms) => {
  const elapsed = new Date(ms)
  const h = String(elapsed.getUTCHours()).padStart(2, '0')
  const m = String(elapsed.getUTCMinutes()).padStart(2, '0')
  const s = String(elapsed.getUTCSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

const updateDisplay = (el) => {
  const now = Date.now()
  const elapsed = now - startTime
  lastElapsed = elapsed
  el.textContent = formatDuration(elapsed)
}

export const initTimeTracker = () => {
  const container = document.getElementById('dashboard-sections')
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Suivi du Temps</h2>
      <div id="timeDisplay" class="title is-3 has-text-centered">00:00:00</div>
      <div class="buttons is-centered mt-4">
        <button class="button is-primary" id="startTimer"><i class="fas fa-play"></i> Démarrer</button>
        <button class="button is-danger" id="stopTimer"><i class="fas fa-stop"></i> Arrêter</button>
      </div>
    </div>
  `

  const display = document.getElementById('timeDisplay')

  // Si le timer est actif, on le relance
  if (startTime && interval) {
    updateDisplay(display)
  }

  const tick = () => updateDisplay(display)

  document.getElementById('startTimer').onclick = () => {
    if (interval) return

    // Si startTime existait, on reprend. Sinon on démarre.
    startTime = startTime || Date.now() - lastElapsed
    interval = setInterval(tick, 1000)
    tick()
  }

  document.getElementById('stopTimer').onclick = () => {
    if (!interval) return

    clearInterval(interval)
    interval = null
    const duration = formatDuration(lastElapsed)
    console.log(`⏱️ Temps enregistré : ${duration}`)
    alert(`Temps total : ${duration}`)

    // Reset timer
    startTime = null
    lastElapsed = 0
    display.textContent = '00:00:00'
  }

  // Met à jour si actif
  if (interval) tick()
}
