export const renderFacture = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté pour voir les factures.");
    window.location.href = "../index.html";
    return;
  }

  const tokenPayload = JSON.parse(atob(token.split(".")[1]));
  const clientUserID = tokenPayload.userID;
  const container = document.getElementById("dashboard-sections");

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Mes Factures</h2>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dossier</th>
            <th>Client</th>
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

    <div id="paiementsSection" class="box" style="display:none;">
      <h3 class="title is-5">Paiement fait</h3>
      <div id="paiementDetails"></div>
    </div>

    <div id="historiquePaiementsSection" class="box" style="display:none;">
      <h2 class="title is-4">Historique des Paiements</h2>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Paiement ID</th>
            <th>Facture ID</th>
            <th>Montant</th>
            <th>Méthode</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="paiementHistoriqueBody"></tbody>
      </table>
    </div>
  `;

  try {
    const res = await fetch(`/facture/client/${clientUserID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const tableBody = document.getElementById("factureTableBody");

    if (!res.ok) {
      tableBody.innerHTML =
        '<tr><td colspan="8">Erreur lors de la récupération des factures.</td></tr>';
      return;
    }

    const factures = await res.json();
    if (!factures.length) {
      tableBody.innerHTML =
        '<tr><td colspan="8">Aucune facture trouvée.</td></tr>';
      return;
    }

    tableBody.innerHTML = factures
      .map((facture) => {
        const dateLimite = new Date(facture.dateCreated);
        dateLimite.setDate(dateLimite.getDate() + 5);
        const nomComplet = `${facture.clientPrenom || ""} ${
          facture.clientNom || ""
        }`;
        return `
          <tr>
            <td>${facture.factureID}</td>
            <td>${facture.dossierID}</td>
            <td>${nomComplet.trim()}</td>
            <td>${facture.montant}</td>
            <td>${facture.status}</td>
            <td>${new Date(facture.dateCreated).toLocaleString()}</td>
            <td>${dateLimite.toLocaleDateString()}</td>
            <td>
              <button class="button is-small is-info" onclick="window.afficherDetailsFacture(${
                facture.factureID
              })">Voir</button>
              ${
                facture.status === "Payée" ||
                facture.status === "Payée partiellement"
                  ? `<button class="button is-small is-success" onclick="window.afficherPaiementFait(${facture.factureID})">Détails</button>`
                  : ""
              }
            </td>
          </tr>`;
      })
      .join("");
  } catch (error) {
    document.getElementById("factureTableBody").innerHTML =
      '<tr><td colspan="8">Erreur réseau.</td></tr>';
  }
};

export const afficherPaiementFait = async (factureID) => {
  const token = sessionStorage.getItem("token");
  const section = document.getElementById("paiementsSection");
  const details = document.getElementById("paiementDetails");

  try {
    const res = await fetch(`/paiement/facture/${factureID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Impossible de récupérer les paiements");

    const paiements = await res.json();
    section.style.display = "block";

    const listePaiements = paiements
      .map((paiement, i) => {
        const date = new Date(paiement.paiementDate).toLocaleString();
        return `
        <div class="box">
          <p><strong>Paiement #${i + 1}</strong></p>
          <p><strong>Montant:</strong> $${paiement.montant}</p>
          <p><strong>Méthode:</strong> ${paiement.methode}</p>
          <p><strong>Date:</strong> ${date}</p>
          <button class="button is-primary is-small mt-1 telechargerPDF" data-id="${
            paiement.factureID
          }">
            Télécharger PDF
          </button>
        </div>`;
      })
      .join("");

    details.innerHTML = `
      <button class="button is-info mb-2" id="toggleDetailPaiement">
        Voir les détails du paiement <span id="chevron">▼</span>
      </button>
      <div id="divDetailPaiement" style="display: none;">
        ${listePaiements}
      </div>
    `;

    document
      .getElementById("toggleDetailPaiement")
      .addEventListener("click", () => {
        const content = document.getElementById("divDetailPaiement");
        const chevron = document.getElementById("chevron");
        const visible = content.style.display === "block";
        content.style.display = visible ? "none" : "block";
        chevron.innerText = visible ? "▼" : "▲";
      });

    document.querySelectorAll(".telechargerPDF").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const a = document.createElement("a");
        a.href = `/facture/pdf/${id}`;
        a.setAttribute("download", `facture-${id}.pdf`);
        a.click();
      });
    });
  } catch (err) {
    alert("Erreur: " + err.message);
  }
};

export const renderHistoriquePaiements = async () => {
  const token = sessionStorage.getItem("token");
  const tokenPayload = JSON.parse(atob(token.split(".")[1]));
  const userID = tokenPayload.userID;
  const body = document.getElementById("paiementHistoriqueBody");
  const section = document.getElementById("historiquePaiementsSection");

  try {
    const res = await fetch(`/paiement/historique/client/${userID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      body.innerHTML =
        '<tr><td colspan="6">Erreur lors du chargement.</td></tr>';
      return;
    }

    const paiements = await res.json();
    section.style.display = "block";

    body.innerHTML = paiements.length
      ? paiements
          .map(
            (p) => `
          <tr>
            <td>${p.paiementID}</td>
            <td>${p.factureID}</td>
            <td>$${p.montant}</td>
            <td>${p.methode}</td>
            <td>${new Date(p.paiementDate).toLocaleString()}</td>
            <td>${p.status}</td>
          </tr>`
          )
          .join("")
      : '<tr><td colspan="6">Aucun paiement trouvé.</td></tr>';
  } catch (err) {
    body.innerHTML =
      '<tr><td colspan="6">Erreur lors du chargement des paiements.</td></tr>';
  }
};

export const afficherDetailsFacture = async (factureID) => {
  const token = sessionStorage.getItem("token");
  try {
    const res = await fetch(`/facture/${factureID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert("Facture introuvable.");
    const facture = await res.json();
    window.renderDetailsPaiement && window.renderDetailsPaiement(facture);
  } catch (err) {
    alert("Erreur lors du chargement de la facture.");
  }
};
