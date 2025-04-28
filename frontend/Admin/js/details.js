// Vue détaillée d'un document pour la section Admin, inspirée de la version Avocat

export const renderDocumentDetails = async (documentID) => {
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
    <div>
      <h3 class="title is-5">Documents Associés au Dossier</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Avocat ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Fichier</th>
            <th>Date Création</th>
          </tr>
        </thead>
        <tbody id="documentsTableBody"></tbody>
      </table>
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
      const data = await response.json();
      const tableBody = document.getElementById("detailsTableBody");
      tableBody.innerHTML = Object.entries(data)
        .map(
          ([key, value]) => `
        <tr><th>${key}</th><td>${value}</td></tr>
      `
        )
        .join("");
    } else {
      alert("Erreur lors de la récupération des détails du document.");
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite.");
  }

  // Retour
  document.getElementById("backButton").addEventListener("click", () => {
    // Retour à la liste des documents
    if (window.renderReceivedDocuments) {
      window.renderReceivedDocuments();
    } else {
      location.reload();
    }
  });

  // Charger les documents liés au même dossier (si applicable)
  try {
    // On suppose que le document a une propriété dossierID
    const docResp = await fetch(`/document/${documentID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!docResp.ok) return;
    const docData = await docResp.json();
    if (!docData.dossierID) return;
    const response = await fetch(`/document/byDossier/${docData.dossierID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return;
    const documents = await response.json();
    const documentsTableBody = document.getElementById("documentsTableBody");
    documentsTableBody.innerHTML = documents
      .map(
        (doc) => `
        <tr>
          <td>${doc.documentID}</td>
          <td>${doc.userID}</td>
          <td>${doc.documentNom}</td>
          <td>${doc.description}</td>
          <td>${doc.fichier}</td>
          <td>${doc.dateCreated ? new Date(doc.dateCreated).toLocaleDateString() : ''}</td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    // Pas bloquant
  }
};
