import { renderDossierForm } from "./dossierForm.js";

export const renderDetailsDossier = async (dossierID) => {
  const container = document.getElementById("dashboard-sections");
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté.");
    window.location.href = "../index.html";
    return;
  }

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails du dossier</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTableBody"></tbody>
      </table>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
        <button class="button is-link" id="backButton">Retour</button>
        <div id="actionButtons">
          <button class="button is-warning" id="editButton">Modifier</button>
          <button class="button is-danger" id="deleteButton">Supprimer</button>
          <button class="button is-primary" id="closeDossierButton">Clôturer le dossier</button>
        </div>
      </div>
    </div>
  `;

  // Charger les détails du dossier
  let dossierData = null;
  try {
    const response = await fetch(`/dossier/${dossierID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      dossierData = await response.json();
      const tableBody = document.getElementById("detailsTableBody");
      tableBody.innerHTML = Object.entries(dossierData)
        .map(
          ([key, value]) => `
        <tr><th>${key}</th><td>${value}</td></tr>
      `
        )
        .join("");
    } else {
      alert("Erreur lors de la récupération des détails du dossier.");
    }
  } catch (error) {
    alert("Erreur réseau.");
  }

  // Retour
  document.getElementById("backButton").addEventListener("click", () => {
    renderDossierForm();
  });

  // Supprimer le dossier
  document.getElementById("deleteButton").addEventListener("click", async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce dossier ?")) return;
    try {
      const response = await fetch(`/dossier/${dossierID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Dossier supprimé avec succès.");
        renderDossierForm();
      } else {
        alert("Erreur lors de la suppression du dossier.");
      }
    } catch (error) {
      alert("Erreur réseau lors de la suppression.");
    }
  });

  // Modifier le dossier
  document.getElementById("editButton").addEventListener("click", () => {
    const tableBody = document.getElementById("detailsTableBody");
    tableBody.innerHTML = Object.entries(dossierData)
      .map(([key, value]) => {
        if (["dossierID", "avocatUserID", "dateCreated", "dateClosed"].includes(key)) {
          return `<tr><th>${key}</th><td>${value}</td></tr>`;
        } else if (key === "status") {
          return `<tr><th>${key}</th><td><select class='input' name='status'>
            <option value="En cours"${value === "En cours" ? " selected" : ""}>En cours</option>
            <option value="En attente"${value === "En attente" ? " selected" : ""}>En attente</option>
            <option value="Annulé"${value === "Annulé" ? " selected" : ""}>Annulé</option>
            <option value="En attente d'approbation"${value === "En attente d'approbation" ? " selected" : ""}>En attente d'approbation</option>
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
      const newData = { ...dossierData };
      tableBody.querySelectorAll("input").forEach((input) => {
        newData[input.name] = input.value;
      });
      try {
        const response = await fetch(`/dossier/${dossierID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newData),
        });
        if (response.ok) {
          alert("Dossier modifié avec succès.");
          renderDetailsDossier(dossierID);
        } else {
          alert("Erreur lors de la modification du dossier.");
        }
      } catch (error) {
        alert("Erreur réseau lors de la modification.");
      }
    });
  });

  // Clôturer le dossier
  document.getElementById("closeDossierButton").addEventListener("click", async () => {
    if (!confirm("Voulez-vous vraiment clôturer ce dossier ?")) return;
    try {
      const response = await fetch(`/dossier/close/${dossierID}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Dossier fermé avec succès.\nTotal d'heures: ${data.totalHours ?? '-'}\nFacture générée: ${data.factureID ?? '-'}`);
        renderDetailsDossier(dossierID);
      } else {
        alert(data.message || "Erreur lors de la fermeture du dossier.");
      }
    } catch (error) {
      alert("Erreur réseau lors de la fermeture du dossier.");
    }
  });
};
