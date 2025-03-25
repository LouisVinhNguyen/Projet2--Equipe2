export const renderRappels = () => {
    const container = document.getElementById('dashboard-sections')
    const events = JSON.parse(localStorage.getItem('legalconnect_events') || '[]')
  
    const today = new Date().toISOString().split('T')[0]
    const rappels = events.filter(e => e.date === today)
  
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Rappels pour aujourd’hui</h2>
        ${rappels.length ? rappels.map(e => `
          <div class="notification is-warning mb-2">
            <strong>${e.title}</strong> — ${e.time}<br/>
            <small>${e.description}</small>
          </div>
        `).join('') : '<p>Aucun rappel pour aujourd’hui.</p>'}
      </div>
    `
  }
  