// Détail d'un document côté client (lecture seule)
export const renderDetailsDocument = async (documentID) => {
  const container = document.getElementById("dashboard-sections");
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté.");
    window.location.href = "../index.html";
    return;
  }

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails du document</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTableBody"></tbody>
      </table>
      <button class="button is-link" id="backButton">Retour</button>
    </div>
  `;

  // Charger les détails du document
  try {
    const response = await fetch(`/document/${documentID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const documentData = await response.json();
      const tableBody = document.getElementById("detailsTableBody");
      tableBody.innerHTML = Object.entries(documentData)
        .map(
          ([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`
        )
        .join("");
    } else {
      alert("Erreur lors de la récupération des détails du document.");
    }  } catch (error) {
    alert("Erreur réseau.");
  }

  // Retour
  document.getElementById("backButton").addEventListener("click", async () => {
    // 1. If we came from a dossier details view, go back to that dossier
    if (window.lastDocumentSource === 'dossier' && window.lastViewedDossierID) {
      window.renderDetailsDossier && window.renderDetailsDossier(window.lastViewedDossierID);
      return;
    }
    // 2. If we came from the documents section, go back to documents
    if (window.lastDocumentSource === 'documents' && window.renderClientDocuments) {
      window.renderClientDocuments();
      return;
    }
    // 3. Fallback: go to dossier list
    if (window.renderDossiers) {
      window.renderDossiers();
    }
  });
};
