export const renderAgenda = () => {
    const container = document.getElementById('dashboard-sections')
    const events = JSON.parse(localStorage.getItem('legalconnect_events') || '[]')
  
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Vos événements à venir</h2>
        ${events.length ? events.map(e => `
          <div class="notification is-light mb-2">
            <strong>${e.title}</strong> — ${e.date} à ${e.time}<br/>
            <small>${e.description}</small>
          </div>
        `).join('') : '<p>Aucun événement pour l’instant.</p>'}
      </div>
    `
  }
  