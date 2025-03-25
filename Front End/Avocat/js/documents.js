export const renderReceivedDocuments = () => {
    const container = document.getElementById('dashboard-sections')
    const docs = JSON.parse(localStorage.getItem('legalconnect_documents') || '[]')
  
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Documents Reçus</h2>
        ${docs.length ? docs.map(d => `
          <article class="message is-info mb-3">
            <div class="message-header">
              ${d.titre} — ${d.client}
            </div>
            <div class="message-body">
              <p><strong>Fichier :</strong> ${d.nomFichier}</p>
              <p><strong>Date :</strong> ${d.date}</p>
              <a class="button is-small is-link mt-2" href="${d.contenu}" download="${d.nomFichier}">
                Télécharger
              </a>
            </div>
          </article>
        `).join('') : '<p>Aucun document reçu.</p>'}
      </div>
    `
  }
  