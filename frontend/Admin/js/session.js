export const renderAllSessions = () => {
  const container = document.getElementById("dashboard-sections");
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Toutes les Sessions</h2>

      <div class="field">
        <label class="label">Filtrer par ID d’avocat</label>
        <div class="control">
          <input id="filterAvocatInput" class="input" type="text" placeholder="Entrer un ID d’avocat">
        </div>
        <div class="control mt-2">
          <button class="button is-link" id="filterAvocatBtn">Filtrer</button>
          <button class="button is-light ml-2" id="resetFilterBtn">Réinitialiser</button>
        </div>
      </div>

      <table class="table is-fullwidth is-striped mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Avocat</th>
            <th>Dossier</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Durée (h)</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="sessionTableBody">
          <!-- Les sessions seront insérées ici -->
        </tbody>
      </table>
    </div>
  `;

  let allSessions = [];

  const renderTable = (sessions) => {
    const tableBody = document.getElementById("sessionTableBody");
    tableBody.innerHTML = sessions
      .map(
        (session) => `
        <tr>
          <td>${session.sessionID}</td>
          <td>${session.userID ?? "-"}</td>
          <td>${session.dossierID}</td>
          <td>${
            session.clockInTime
              ? new Date(session.clockInTime).toLocaleString()
              : "-"
          }</td>
          <td>${
            session.clockOutTime
              ? new Date(session.clockOutTime).toLocaleString()
              : "-"
          }</td>
          <td>${session.tempsTotal ?? "-"}</td>
          <td>${session.description}</td>
          <td>
            <button class="button is-small is-info view-session" onclick="window.renderDetailsSession && window.renderDetailsSession('${
              session.sessionID
            }')">Voir</button>
          </td>
        </tr>
      `
      )
      .join("");
  };

  const fetchAllSessions = async () => {
    try {
      const storedToken = sessionStorage.getItem("token");
      const response = await fetch("/session", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        allSessions = await response.json();
        console.log("Sessions récupérées :", allSessions);
        renderTable(allSessions);
      } else {
        alert("Erreur lors de la récupération des sessions.");
      }
    } catch (error) {
      alert("Erreur réseau.");
    }
  };

  // 🎯 Filtrage par avocatID (userID)
  document.addEventListener("click", (e) => {
    if (e.target?.id === "filterAvocatBtn") {
      const filterID = document
        .getElementById("filterAvocatInput")
        .value.trim();
      const filtered = allSessions.filter((s) => String(s.userID) === filterID);
      renderTable(filtered);
    }
    if (e.target?.id === "resetFilterBtn") {
      renderTable(allSessions);
      document.getElementById("filterAvocatInput").value = "";
    }
  });

  fetchAllSessions();
};
