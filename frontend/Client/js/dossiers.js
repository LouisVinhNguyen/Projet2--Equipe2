const token = sessionStorage.getItem("token");

export const renderDossiers = async () => {
  const section = document.getElementById("dashboard-sections");
  section.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Mes Dossiers</h2>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Status</th>
            <th>Description</th>
            <th>Voir</th>
          </tr>
        </thead>
        <tbody id="dossierTableBody"></tbody>
      </table>
    </div>
  `;

  const token = sessionStorage.getItem("token");
  if (!token) {
    section.innerHTML =
      '<p class="has-text-danger">Vous devez être connecté pour voir vos dossiers.</p>';
    return;
  }

  try {
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const clientUserID = tokenPayload.userID;
    const response = await fetch(`/dossier/client/${clientUserID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const tableBody = document.getElementById("dossierTableBody");
    if (response.ok) {
      const dossiers = await response.json();
      if (dossiers.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="6">Aucun dossier trouvé.</td></tr>';
      } else {
        tableBody.innerHTML = dossiers
          .map(
            (dossier) => `
          <tr>
            <td>${dossier.dossierID}</td>
            <td>${dossier.dossierNom}</td>
            <td>${dossier.dossierType}</td>
            <td>${dossier.status || ""}</td>
            <td>${dossier.description}</td>
            <td><button class="button is-small is-info" onclick="window.renderDetailsDossier && window.renderDetailsDossier('${dossier.dossierID}')">Voir</button></td>
          </tr>
        `
          )
          .join("");
      }
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="has-text-danger">Erreur lors de la récupération des dossiers.</td></tr>';
    }
  } catch (error) {
    const tableBody = document.getElementById("dossierTableBody");
    tableBody.innerHTML =
      '<tr><td colspan="6" class="has-text-danger">Une erreur réseau s\'est produite.</td></tr>';
  }
};
