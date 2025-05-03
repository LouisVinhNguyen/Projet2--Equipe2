export const renderDetailsFacture = async (factureID) => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour accéder à cette page.');
    window.location.href = "../index.html";
    return;
  }

  const container = document.getElementById("dashboard-sections");
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails de la facture</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsFactureTableBody"></tbody>
      </table>
      <button class="button is-link" id="backButton">Retour</button>
    </div>

    <div class="box">
      <form id="paiementForm" class="mt-4">
        <h4 class="title is-5">Ajouter un paiement</h4>
        <div class="field">
          <label class="label">Montant</label>
          <div class="control">
            <input class="input" type="number" step="0.01" min="0" id="paiementMontant" required />
          </div>
        </div>
        <div class="field">
          <label class="label">Date de paiement</label>
          <div class="control">
            <input class="input" type="datetime-local" id="paiementDate" required />
          </div>
        </div>
        <div class="field">
          <label class="label">Méthode</label>
          <div class="control">
            <input class="input" type="text" id="paiementMethode" required />
          </div>
        </div>
        <div class="field">
          <label class="label">Statut</label>
          <div class="control">
            <div class="select">
              <select id="paiementStatus" required>
                <option value="En attente">En attente</option>
                <option value="Terminé">Terminé</option>
                <option value="Échoué">Échoué</option>
                <option value="Remboursé">Remboursé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-success" type="submit">Ajouter Paiement</button>
          </div>
        </div>
      </form>
        <hr />
      <h3 class="title is-4">Paiements associés</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Montant</th>
            <th>Date</th>
            <th>Méthode</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="paiementsTableBody"></tbody>
      </table>
    </div>
  `;

  // Charger les détails de la facture
  try {
    const response = await fetch(`/facture/${factureID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const factureData = await response.json();
      const tableBody = document.getElementById("detailsFactureTableBody");
      tableBody.innerHTML = Object.entries(factureData)
        .map(([key, value]) => {
          if (key.includes("date")) {
            return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}</td></tr>`;
          } else {
            return `<tr><th>${key}</th><td>${value ?? "-"}</td></tr>`;
          }
        })
        .join("");
    } else {
      alert("Erreur lors de la récupération des détails de la facture.");
    }
  } catch (error) {
    alert("Erreur réseau.");
  }

  // Charger les paiements associés à la facture
  async function loadPaiements() {
    try {
      const response = await fetch(`/paiement/facture/${factureID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const paiementsTableBody = document.getElementById('paiementsTableBody');
      if (!response.ok) {
        paiementsTableBody.innerHTML = '<tr><td colspan="6">Erreur lors du chargement des paiements.</td></tr>';
        return;
      }
      const paiements = await response.json();
      if (!paiements.length) {
        paiementsTableBody.innerHTML = '<tr><td colspan="6">Aucun paiement associé.</td></tr>';
      } else {
        paiementsTableBody.innerHTML = paiements.map(p => `
          <tr>
            <td>${p.paiementID}</td>
            <td>${p.montant}</td>
            <td>${p.paiementDate ? new Date(p.paiementDate).toLocaleString() : '-'}</td>
            <td>${p.methode}</td>
            <td>${p.status}</td>
            <td><button class="button is-small is-info" onclick="window.renderDetailsPaiement && window.renderDetailsPaiement(${p.paiementID})">Voir</button></td>
          </tr>
        `).join('');
      }
    } catch (error) {
      document.getElementById('paiementsTableBody').innerHTML = '<tr><td colspan="6">Erreur réseau.</td></tr>';
    }
  }
  loadPaiements();

  // Gestion du formulaire d'ajout de paiement
  document.getElementById('paiementForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const montant = parseFloat(document.getElementById('paiementMontant').value);
    const paiementDate = document.getElementById('paiementDate').value;
    const methode = document.getElementById('paiementMethode').value;
    const status = document.getElementById('paiementStatus').value;
    if (!montant || !paiementDate || !methode || !status) {
      alert('Tous les champs sont requis.');
      return;
    }
    try {
      const response = await fetch('/paiement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          factureID,
          montant,
          paiementDate,
          methode,
          status
        })
      });
      if (response.ok) {
        await loadPaiements();
        document.getElementById('paiementForm').reset();
        alert('Paiement ajouté avec succès.');
      } else {
        const err = await response.json();
        alert(err.message || 'Erreur lors de l\'ajout du paiement.');
      }
    } catch (error) {
      alert('Erreur réseau lors de l\'ajout du paiement.');
    }
  });

  // Retour
  document.getElementById("backButton").addEventListener("click", () => {
    if (typeof window.previousRender === 'function') {
      window.previousRender();
    }
  });
};
