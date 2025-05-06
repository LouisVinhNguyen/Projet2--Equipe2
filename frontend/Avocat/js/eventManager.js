import { syncCalendar } from './calendarView.js'

const formatDateTime = (date, time) => new Date(`${date}T${time}`)

const showNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission()
  }
}

const simulateReminder = (event) => {
  const eventTime = formatDateTime(event.date, event.time)
  const now = new Date()
  const delay = eventTime - now - 5000
  if (delay > 0) {
    setTimeout(() => {
      showNotification(`Rappel : ${event.title}`, `Prévu à ${event.time}`)
    }, delay)
  }
}

const renderForm = () => `
  <form id="eventForm" class="mb-5">
    <div class="field">
      <label class="label">Titre</label>
      <input class="input" name="title" required />
    </div>
    <div class="field">
      <label class="label">Date</label>
      <input class="input" type="date" name="date" required />
    </div>
    <div class="field">
      <label class="label">Heure</label>
      <input class="input" type="time" name="time" required />
    </div>
    <div class="field">
      <label class="label">Description</label>
      <textarea class="textarea" name="description"></textarea>
    </div>
    <button class="button is-link" type="submit">Ajouter l'évènement</button>
  </form>
`

const renderEventList = (events) => {
  if (!events.length) return '<p>Aucun événement.</p>'
  return events.map(ev => `
    <div class="box">
      <strong>${ev.title}</strong> – <em>${ev.date} à ${ev.time}</em><br/>
      <small>${ev.description || ''}</small>
    </div>
  `).join('')
}

// ============================================
// 🎯 ICI on met les fonctions exportées :

export const getEvents = async () => {
  const response = await fetch('/events')
  return response.ok ? await response.json() : []
}

export const renderEventSection = async (sectionKey) => {
  requestNotificationPermission()

  const container = document.getElementById('dashboard-sections')
  const events = await getEvents()

  // Lancer les rappels pour tous les événements existants
  events.forEach(simulateReminder)

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">${sectionKey.toUpperCase()}</h2>
      ${renderForm()}
      <h3 class="title is-5 mt-5">Évènements planifiés</h3>
      <div id="eventList">${renderEventList(events)}</div>
    </div>
  `

  document.getElementById('eventForm').onsubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const event = Object.fromEntries(form.entries())

    await fetch('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })

    simulateReminder(event)
    syncCalendar([...events, event])
    renderEventSection(sectionKey) // on re-render pour ajouter le nouvel event dans la liste
  }
}
export const addEvent = async (event) => {
  await fetch('/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  })
}
