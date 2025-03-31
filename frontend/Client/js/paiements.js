export const renderPaiements = () => {
    const container = document.getElementById('dashboard-sections')
    const factures = JSON.parse(localStorage.getItem('legalconnect_factures') || '[]')
    const paiements = JSON.parse(localStorage.getItem('legalconnect_paiements') || '[]')
  
    const getStatut = (index) => {
      const f = factures[index]
      const total = paiements.filter(p => p.factureIndex == index)
        .reduce((sum, p) => sum + Number(p.montant), 0)
      return total >= f.montant ? 'Payée' : 'En attente'
    }
  
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Mes Factures</h2>
        ${factures.length ? `
          <table class="table is-striped is-fullwidth">
            <thead><tr>
              <th>Client</th><th>Montant (€)</th><th>Date</th><th>Statut</th>
            </tr></thead>
            <tbody>
              ${factures.map((f, i) => `
                <tr>
                  <td>${f.client}</td>
                  <td>${f.montant}</td>
                  <td>${f.date}</td>
                  <td><strong>${getStatut(i)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>Aucune facture enregistrée.</p>'}
      </div>
    `
  }
  