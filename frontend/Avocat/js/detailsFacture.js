import { renderFacture } from "./facture.js";

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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
        <button class="button is-link" id="backButton">Retour</button>
      </div>
    </div>
    
    <div class="box">
      <h3 class="title is-4">Paiements Associés</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Montant</th>
            <th>Date</th>
            <th>Méthode</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody id="paiementsTableBody"></tbody>
      </table>
    </div>
  `;

  // Charger les détails de la facture
  let factureData = null;
  try {
    const response = await fetch(`/facture/${factureID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      factureData = await response.json();
      const tableBody = document.getElementById("detailsFactureTableBody");
      tableBody.innerHTML = Object.entries(factureData)
        .map(([key, value]) => {
          if (key.includes('date')) {
            return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}</td></tr>`;
          }
          return `<tr><th>${key}</th><td>${value ?? "-"}</td></tr>`;
        })
        .join("");
    } else {
      alert("Erreur lors de la récupération des détails de la facture.");
    }
  } catch (error) {
    alert("Erreur réseau.");
  }

  // Charger les paiements associés à la facture
  const fetchPaiements = async () => {
    try {
      const response = await fetch(`/paiement/facture/${factureID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const paiements = await response.json();
        const tableBody = document.getElementById('paiementsTableBody');
        
        if (paiements.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5">Aucun paiement associé à cette facture.</td></tr>';
        } else {
          tableBody.innerHTML = paiements.map(paiement => `
            <tr>
              <td>${paiement.paiementID}</td>
              <td>${paiement.montant} $</td>
              <td>${new Date(paiement.paiementDate).toLocaleString()}</td>
              <td>${paiement.methode}</td>
              <td>${paiement.status}</td>
            </tr>
          `).join('');
        }
      } else {
        console.error("Erreur lors de la récupération des paiements:", response.statusText);
      }
    } catch (error) {
      console.error("Erreur réseau lors de la récupération des paiements:", error);
    }
  };
  
  await fetchPaiements();

  // Retour
  document.getElementById('backButton').addEventListener('click', () => {
    if (typeof window.previousRender === 'function') {
      window.previousRender();
    } else {
      renderFacture();
    }
  });
};
