// Détail d'un dossier côté client (lecture seule)
export const renderDetailsDossier = async (dossierID) => {

  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté.");
    window.location.href = "../index.html";
    return;
  }

  const container = document.getElementById("dashboard-sections");
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails du dossier</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTableBody"></tbody>
      </table>
      <button class="button is-link" id="backButton">Retour</button>
    </div>
    <div class="box">
      <h3 class="title is-4">Documents Associés</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Avocat ID</th>
            <th>Nom</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="documentsTableBody"></tbody>
      </table>
    </div>
  `;

  // Charger les détails du dossier
  try {
    const response = await fetch(`/dossier/${dossierID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const dossierData = await response.json();
      const tableBody = document.getElementById("detailsTableBody");
      tableBody.innerHTML = Object.entries(dossierData)
        .map(
          ([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`
        )
        .join("");
    } else {
      alert("Erreur lors de la récupération des détails du dossier.");
    }
  } catch (error) {
    alert("Erreur réseau.");
  }

  // Charger les documents liés au dossier
  try {
    const response = await fetch(`/document/byDossier/${dossierID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return;
    const documents = await response.json();
    const documentsTableBody = document.getElementById('documentsTableBody');
    if (documents.length === 0) {
      documentsTableBody.innerHTML = '<tr><td colspan="4">Aucun document associé.</td></tr>';
    } else {
      documentsTableBody.innerHTML = documents
        .map(
          (doc) => `
          <tr>
            <td>${doc.documentID}</td>
            <td>${doc.userID}</td>
            <td>${doc.documentNom}</td>
            <td>
              <button class="button is-small is-info" onclick="window.previousRender = () => renderDetailsDossier(${dossierID});window.lastDocumentSource='dossier';window.renderDetailsDocument && window.renderDetailsDocument('${doc.documentID}')">Voir</button>
            </td>
          </tr>
        `
        )
        .join('');
    }
  } catch (error) {
    // Pas bloquant
  }

  // Retour
  document.getElementById("backButton").addEventListener("click", () => {
    window.renderDossier && window.renderDossier();
  });
};
