export const renderFactures = async () => {

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour accéder à cette page.');
    window.location.href = "../index.html";
    return;
  }

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const avocatUserID = tokenPayload.userID;

  const container = document.getElementById('dashboard-sections');
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Facturation</h2>
      <form id="factureForm">
        <div class="field">
          <label class="label">Dossier</label>
          <div class="control">
            <div class="select">
              <select class="input" id="dossierSelect" name="dossierID" required>
                <option value="">Sélectionnez un dossier</option>
              </select>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">Temps travaillé (heures)</label>
          <input class="input" name="timeWorked" type="number" step="0.1" required />
        </div>
        <div class="field">
          <label class="label">Taux horaire ($)</label>
          <input class="input" name="hourlyRate" type="number" step="0.01" required />
        </div>
        <button class="button is-primary" type="submit">Créer Facture</button>
      </form>
      <hr />
      <h3 class="title is-5">Liste des Factures</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Facture ID</th>
            <th>Dossier ID</th>
            <th>Montant ($)</th>
            <th>Status</th>
            <th>Date Créée</th>
            <th>Date Limite</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody id="factureTableBody"></tbody>
      </table>
    </div>
  `;

  const fetchFactures = async () => {
    try {
      const response = await fetch(`/facture`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const factures = await response.json();
        const tableBody = document.getElementById('factureTableBody');
        tableBody.innerHTML = factures.length ? factures.map((f, i) => `
          <tr>
            <td>${f.factureID}</td>
            <td>${f.dossierID}</td>
            <td>${f.montant}</td>
            <td>${f.status}</td>
            <td>${f.dateCreated ? new Date(f.dateCreated).toLocaleDateString() : '-'}</td>
            <td>${f.dateLimite ? new Date(f.dateLimite).toLocaleDateString() : '-'}</td>
            <td>
              <button class="button is-small is-info" onclick="window.generatePDF && window.generatePDF('${f.factureID}')">
                <i class="fas fa-file-pdf"></i>
              </button>
            </td>
          </tr>
        `).join('') : '<tr><td colspan="7">Aucune facture générée.</td></tr>';
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
    }
  };

  const fillDossierDropdown = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const avocatUserID = tokenPayload.userID;
    try {
      const response = await fetch(`/dossier/avocat/${avocatUserID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const dossiers = await response.json();
        const dossierSelect = document.getElementById('dossierSelect');
        dossierSelect.innerHTML = '<option value="">Sélectionnez un dossier</option>' +
          dossiers.map(dossier => `<option value="${dossier.dossierID}">${dossier.dossierNom} (${dossier.dossierID})</option>`).join('');
      }
    } catch (error) {
      // Silencieux
    }
  };

  document.getElementById('factureForm').onsubmit = async (e) => {
    e.preventDefault();
    const dossierID = document.querySelector('select[name="dossierID"]').value.trim();
    const timeWorked = document.querySelector('input[name="timeWorked"]').value.trim();
    const hourlyRate = document.querySelector('input[name="hourlyRate"]').value.trim();
    if (!dossierID || !timeWorked || !hourlyRate) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    const factureData = {
      dossierID,
      timeWorked,
      hourlyRate
    };
    try {
      const response = await fetch('/facture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(factureData)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erreur de création de la facture");
      }
      document.getElementById('factureForm').reset();
      alert("Facture créée avec succès !");
      fetchFactures();
    } catch (error) {
      console.error("Erreur:", error.message);
      alert("Erreur: " + error.message);
    }
  };

  window.generatePDF = (factureId) => {
    const f = factures.find(f => (f.factureID || factures.indexOf(f)) == factureId);
    if (!f) return;
    const element = document.createElement('div');
    element.innerHTML = `
      <h1 style="text-align:center;">Facture #${f.factureID || parseInt(factureId) + 1}</h1>
      <p><strong>Dossier ID :</strong> ${f.dossierID}</p>
      <p><strong>Temps travaillé :</strong> ${f.timeWorked} heures</p>
      <p><strong>Taux horaire :</strong> ${f.hourlyRate} $</p>
    `;
    html2pdf().from(element).save(`facture-${f.dossierID}.pdf`);
  };

  await fillDossierDropdown();
  await fetchFactures();
};