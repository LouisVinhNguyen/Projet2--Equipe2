export const renderFactures = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour voir les factures.');
    window.location.href = "../index.html";
    return;
  }

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const clientUserID = tokenPayload.userID;

  const container = document.getElementById('dashboard-sections');
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Mes Factures</h2>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dossier</th>
            <th>Montant ($)</th>
            <th>Status</th>
            <th>Date Créée</th>
            <th>Date Limite</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="factureTableBody"></tbody>
      </table>
    </div>
  `;

  try {
    // Fetch factures for this client
    const facturesResponse = await fetch(`/facture/client/${clientUserID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const tableBody = document.getElementById('factureTableBody');
    if (facturesResponse.ok) {
      const factures = await facturesResponse.json();
      if (!factures || factures.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">Aucune facture trouvée.</td></tr>';
      } else {
        tableBody.innerHTML = factures.map(facture => `
          <tr>
            <td>${facture.factureID}</td>
            <td>${facture.dossierID}</td>
            <td>${facture.montant}</td>
            <td>${facture.status}</td>
            <td>${facture.dateCreated ? new Date(facture.dateCreated).toLocaleString() : ''}</td>
            <td>${facture.dateLimite ? new Date(facture.dateLimite).toLocaleString() : ''}</td>
            <td><button class="button is-small is-info" onclick="window.previousRender = window.renderFactures; window.renderDetailsFacture && window.renderDetailsFacture('${facture.factureID}')">Voir</button></td>
          </tr>
        `).join('');
      }
    } else {
      tableBody.innerHTML = '<tr><td colspan="7" class="has-text-danger">Erreur lors de la récupération des factures.</td></tr>';
    }
  } catch (error) {
    const tableBody = document.getElementById('factureTableBody');
    tableBody.innerHTML = '<tr><td colspan="7" class="has-text-danger">Erreur lors de la récupération des factures.</td></tr>';
  }
};