import { renderSession } from "./session.js";

export const renderDetailsSession = async (sessionID) => {

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour accéder à cette page.');
    window.location.href = "../index.html";
    return;
  }

  const container = document.getElementById("dashboard-sections");
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails de la session</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsSessionTableBody"></tbody>
      </table>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
        <button class="button is-link" id="backButton">Retour</button>
        <div id="actionButtons">
          <button class="button is-warning" id="editButton">Modifier</button>
          <button class="button is-danger" id="deleteButton">Supprimer</button>
          <button class="button is-primary" id="endSessionButton">Clôturer la session</button>
        </div>
      </div>
    </div>
  `;

  // Charger les détails de la session
  let sessionData = null;
  try {
    const response = await fetch(`/session/${sessionID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      sessionData = await response.json();
      const tableBody = document.getElementById("detailsSessionTableBody");
      tableBody.innerHTML = Object.entries(sessionData)
        .map(([key, value]) => {
          if (key === "clockInTime" || key === "clockOutTime") {
            return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}</td></tr>`;
          } else {
            return `<tr><th>${key}</th><td>${value ?? "-"}</td></tr>`;
          }
        })
        .join("");
    } else {
      console.error("Erreur lors de la récupération des détails de la session:", response.statusText);
      alert("Erreur lors de la récupération des détails de la session.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la session:", error);
    alert("Erreur réseau.");
  }

  // Retour
  document.getElementById('backButton').addEventListener('click', () => {
    if (typeof window.previousRender === 'function') {
      window.previousRender();
    } else {
      renderSession();
    }
  });

  // Supprimer la session
  document.getElementById("deleteButton").addEventListener("click", async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette session ?")) return;
    try {
      const response = await fetch(`/session/${sessionID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Session supprimée avec succès.");
        renderSession();
      } else {
        alert("Erreur lors de la suppression de la session.");
      }
    } catch (error) {
      alert("Erreur réseau lors de la suppression.");
    }
  });

  // Modifier la session (description uniquement si session non terminée)
  document.getElementById("editButton").addEventListener("click", () => {
    if (sessionData.clockOutTime) {
      alert("Impossible de modifier une session clôturée.");
      return;
    }
    const tableBody = document.getElementById("detailsSessionTableBody");
    tableBody.innerHTML = Object.entries(sessionData)
      .map(([key, value]) => {
        if (["sessionID", "userID", "dossierID", "clockInTime", "clockOutTime", "tempsTotal"].includes(key)) {
          if (key === "clockInTime" || key === "clockOutTime") {
            return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}</td></tr>`;
          } else {
            return `<tr><th>${key}</th><td>${value ?? "-"}</td></tr>`;
          }
        } else if (key === "description") {
          return `<tr><th>${key}</th><td><input class='input' name='${key}' value='${value ?? ""}' /></td></tr>`;
        }
      })
      .join("");
    // Remplace le bouton Modifier par Enregistrer au même endroit
    const actionButtons = document.getElementById("actionButtons");
    const editBtn = document.getElementById("editButton");
    const saveBtn = document.createElement("button");
    saveBtn.className = "button is-success";
    saveBtn.id = "saveButton";
    saveBtn.textContent = "Enregistrer";
    actionButtons.replaceChild(saveBtn, editBtn);
    saveBtn.addEventListener("click", async () => {
      const newData = { ...sessionData };
      const descInput = tableBody.querySelector("input[name='description']");
      newData.description = descInput.value;
      try {
        const response = await fetch(`/session/${sessionID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userID: sessionData.userID,
            dossierID: sessionData.dossierID,
            description: newData.description,
          }),
        });
        if (response.ok) {
          alert("Session modifiée avec succès.");
          renderDetailsSession(sessionID);
        } else {
          const err = await response.json();
          alert(err.error || err.message || "Erreur lors de la modification de la session.");
        }
      } catch (error) {
        alert("Erreur réseau lors de la modification.");
      }
    });
  });

  // Clôturer la session
  document.getElementById("endSessionButton").addEventListener("click", async () => {
    if (sessionData.clockOutTime) {
      alert("Cette session a déjà été clôturée.");
      return;
    }
    if (!confirm("Voulez-vous vraiment clôturer cette session ?")) return;
    try {
      const response = await fetch(`/session/end/${sessionID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.ok) {
        alert("Session clôturée avec succès.");
        renderDetailsSession(sessionID);
      } else {
        const err = await response.json();
        alert(err.message || "Erreur lors de la clôture de la session.");
      }
    } catch (error) {
      alert("Erreur réseau lors de la clôture.");
    }
  });
};