export const renderAgenda = async () => {
  const container = document.getElementById('dashboard-sections')
  if (!container) return

  const today = new Date().toISOString().split('T')[0]

  try {
    const response = await fetch('/events')
    if (!response.ok) throw new Error('Erreur lors du chargement')

    const events = await response.json()

    const eventsFuturs = events
      .filter(e => e.date >= today)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))

    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Agenda à venir</h2>
        ${
          eventsFuturs.length
            ? eventsFuturs.map(e => `
              <div class="notification is-info mb-2">
                <strong>${e.title}</strong><br/>
                <span class="has-text-grey">${e.date} à ${e.time}</span><br/>
                <small>${e.description || ''}</small>
              </div>
            `).join('')
            : '<p>Aucun événement à venir.</p>'
        }
      </div>
    `
  } catch (err) {
    console.error('Erreur:', err)
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Agenda</h2>
        <p>Erreur lors du chargement de l’agenda.</p>
      </div>
    `
  }
}
