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
            <th>AvocatID</th>
            <th>Dossier</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Durée (h)</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="sessionTableBody"></tbody>
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
        <td>${session.userID}</td>
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
          <button class="button is-small is-danger" data-id="${
            session.sessionID
          }">Supprimer</button>
        </td>
      </tr>
    `
      )
      .join("");

    document.querySelectorAll(".button.is-danger").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const sessionID = btn.dataset.id;
        if (confirm(`Confirmer la suppression de la session ${sessionID} ?`)) {
          await deleteSession(sessionID);
        }
      });
    });
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
        console.log(allSessions);
        renderTable(allSessions);
      } else {
        alert("Erreur lors de la récupération des sessions.");
      }
    } catch (error) {
      alert("Erreur réseau.");
    }
  };

  const deleteSession = async (sessionID) => {
    try {
      const storedToken = sessionStorage.getItem("token");
      const response = await fetch(`/session/${sessionID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        allSessions = allSessions.filter(
          (s) => s.sessionID !== parseInt(sessionID)
        );
        renderTable(allSessions);
      } else {
        alert("Échec de la suppression.");
      }
    } catch (error) {
      alert("Erreur de suppression.");
    }
  };

  // Bouton Filtrage
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "filterAvocatBtn") {
      const filterID = document
        .getElementById("filterAvocatInput")
        .value.trim();
      const filtered = allSessions.filter((s) => String(s.userID) === filterID);
      renderTable(filtered);
    }
    if (e.target && e.target.id === "resetFilterBtn") {
      renderTable(allSessions);
      document.getElementById("filterAvocatInput").value = "";
    }
  });

  fetchAllSessions();
};
