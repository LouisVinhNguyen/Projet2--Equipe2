export const renderDossiers = () => {
    const container = document.getElementById('dashboard-sections')
    const dossiers = JSON.parse(localStorage.getItem('legalconnect_dossiers') || '[]')
  
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Mes Dossiers</h2>
        ${dossiers.length ? dossiers.map(d => `
          <article class="message is-info mb-3">
            <div class="message-header">
              ${d.nom}
            </div>
            <div class="message-body">
              Client : ${d.client}<br/>
              ${d.description}
            </div>
          </article>
        `).join('') : '<p>Aucun dossier enregistré.</p>'}
      </div>
    `
  }
  