
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

export const getEvents = async () => {
  const response = await fetch('/events')
  return response.ok ? await response.json() : []
}

export const renderRappel = async () => {
  requestNotificationPermission()
  const container = document.getElementById('dashboard-sections')
  const today = new Date().toISOString().split('T')[0]

  try {
    const events = await getEvents()
    const rappelsAujourdhui = events.filter(e => e.date === today)

    events.forEach(simulateReminder)

    const sectionAujourdhui = `
      <div class="box">
        <h2 class="title is-4">Rappels pour aujourd’hui</h2>
        ${rappelsAujourdhui.length ? rappelsAujourdhui.map(e => `
          <div class="notification is-warning mb-2">
            <strong>${e.title}</strong> — ${e.time}<br/>
            <small>${e.description || ''}</small>
          </div>
        `).join('') : '<p>Aucun rappel pour aujourd’hui.</p>'}
      </div>
    `

    const sectionTousLesRappels = `
      <div class="box mt-5">
        <h2 class="title is-4">Tous les rappels</h2>
        <table class="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(e => `
              <tr>
                <td>${e.title}</td>
                <td>${e.date}</td>
                <td>${e.time}</td>
                <td>${e.description || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `

    container.innerHTML = sectionAujourdhui + sectionTousLesRappels
  } catch (err) {
    console.error('Erreur:', err)
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Rappels</h2>
        <p>Erreur lors du chargement des rappels.</p>
      </div>
    `
  }
}
