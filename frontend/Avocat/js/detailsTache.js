import { renderTacheForm } from "./tache.js";

export const renderDetailsTache = async (tacheID) => {
  const container = document.getElementById("dashboard-sections");
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté.");
    window.location.href = "../index.html";
    return;
  }

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails de la tâche</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTacheTableBody"></tbody>
      </table>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
        <button class="button is-link" id="backButton">Retour</button>
        <div id="actionButtons">
          <button class="button is-warning" id="editButton">Modifier</button>
          <button class="button is-danger" id="deleteButton">Supprimer</button>
        </div>
      </div>
    </div>
  `;

  // Charger les détails de la tâche
  let tacheData = null;
  try {
    const response = await fetch(`/tache/${tacheID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      tacheData = await response.json();
      const tableBody = document.getElementById("detailsTacheTableBody");
      tableBody.innerHTML = Object.entries(tacheData)
        .map(
          ([key, value]) => `
        <tr><th>${key}</th><td>${value}</td></tr>
      `
        )
        .join("");
    } else {
      alert("Erreur lors de la récupération des détails de la tâche.");
    }
  } catch (error) {
    alert("Erreur réseau.");
  }

  // Retour
  document.getElementById("backButton").addEventListener("click", () => {
    renderTacheForm();
  });

  // Supprimer la tâche
  document.getElementById("deleteButton").addEventListener("click", async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;
    try {
      const response = await fetch(`/tache/${tacheID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Tâche supprimée avec succès.");
        renderTacheForm();
      } else {
        alert("Erreur lors de la suppression de la tâche.");
      }
    } catch (error) {
      alert("Erreur réseau lors de la suppression.");
    }
  });

  // Modifier la tâche
  document.getElementById("editButton").addEventListener("click", () => {
    const tableBody = document.getElementById("detailsTacheTableBody");
    tableBody.innerHTML = Object.entries(tacheData)
      .map(([key, value]) => {
        if (["tacheID", "userID", "dossierID"].includes(key)) {
          return `<tr><th>${key}</th><td>${value}</td></tr>`;
        } else if (key === "status") {
          return `<tr><th>${key}</th><td><select class='input' name='status'>
            <option value="Non commencée"${value === "Non commencée" ? " selected" : ""}>Non commencée</option>
            <option value="En cours"${value === "En cours" ? " selected" : ""}>En cours</option>
            <option value="Terminée"${value === "Terminée" ? " selected" : ""}>Terminée</option>
            <option value="Bloquée"${value === "Bloquée" ? " selected" : ""}>Bloquée</option>
            <option value="Annulée"${value === "Annulée" ? " selected" : ""}>Annulée</option>
          </select></td></tr>`;
        } else {
          return `<tr><th>${key}</th><td><input class='input' name='${key}' value='${value ?? ''}' /></td></tr>`;
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
      const newData = { ...tacheData };
      tableBody.querySelectorAll("input,select").forEach((input) => {
        newData[input.name] = input.value;
      });
      try {
        const response = await fetch(`/tache/${tacheID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newData),
        });
        if (response.ok) {
          alert("Tâche modifiée avec succès.");
          renderDetailsTache(tacheID);
        } else {
          const err = await response.json();
          alert(err.error || err.message || "Erreur lors de la modification de la tâche.");
        }
      } catch (error) {
        alert("Erreur réseau lors de la modification.");
      }
    });
  });
};
