const API_BASE_URL = 'http://localhost:3000';
const FACTURES_ENDPOINT = `${API_BASE_URL}/facture`;

// Fonction pour récupérer le token
const getToken = () => {
  return sessionStorage.getItem('token') || '';
};

// Fonction pour décoder le token
const decodeToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Erreur lors du décodage du token', error);
    return null;
  }
};

// State variables
let factures = [];

// Fetch toutes les factures
const fetchData = async () => {
  try {
    const response = await fetch(FACTURES_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch factures');
    }

    factures = await response.json();
  } catch (error) {
    console.error('Error fetching factures:', error);
    factures = [];
  }
};

// Ajouter une facture (POST)
const addFacture = async (factureData) => {
  try {
    const response = await fetch(FACTURES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(factureData)
    });

    if (!response.ok) {
      throw new Error('Failed to add facture');
    }

    const newFacture = await response.json();
    factures.push(newFacture);
    return newFacture;
  } catch (error) {
    console.error('Error adding facture:', error);
    return factureData;
  }
};

// Afficher le tableau des factures
const renderFacturesTable = () => {
  if (!factures.length) return '<p>Aucune facture générée.</p>';

  return `
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Dossier ID</th><th>Temps travaillé</th><th>Taux horaire</th><th>PDF</th>
        </tr>
      </thead>
      <tbody>
        ${factures.map((f, i) => {
          const factureId = f.factureID || i;
          return `
          <tr>
            <td>${f.dossierID || '-'}</td>
            <td>${f.timeWorked || '-'}</td>
            <td>${f.hourlyRate || '-'}</td>
            <td>
              <button class="button is-small is-info" onclick="generatePDF('${factureId}')">
                <i class="fas fa-file-pdf"></i>
              </button>
            </td>
          </tr>
        `}).join('')}
      </tbody>
    </table>
  `;
};

// Afficher la section Facturation
export const renderFactures = async () => {
  const container = document.getElementById('dashboard-sections');

  container.innerHTML = `
    <div class="box has-text-centered">
      <h2 class="title is-4">Facturation</h2>
      <p>Chargement des données...</p>
    </div>
  `;

  await fetchData();

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Facturation</h2>

      <div class="columns">
        <div class="column">
          <h3 class="subtitle is-5">🧾 Créer une facture</h3>
          <form id="factureForm">
            <div class="field">
              <label class="label">Dossier ID</label>
              <input class="input" name="dossierID" type="number" required />
            </div>
            <div class="field">
              <label class="label">Temps travaillé (heures)</label>
              <input class="input" name="timeWorked" type="number" step="0.1" required />
            </div>
            <div class="field">
              <label class="label">Taux horaire ($)</label>
              <input class="input" name="hourlyRate" type="number" step="0.01" required />
            </div>
            <button class="button is-primary mt-2" type="submit">Créer Facture</button>
          </form>
        </div>
      </div>

      <hr />
      <h3 class="subtitle is-5">📋 Factures existantes</h3>
      <div id="factureList">${renderFacturesTable()}</div>
    </div>
  `;

  document.getElementById('factureForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    await addFacture(data);
    await renderFactures();
  };
};

// Générer un PDF (optionnel)
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