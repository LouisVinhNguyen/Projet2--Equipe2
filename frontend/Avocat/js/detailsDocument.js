import { renderDocument } from "./document.js";

export const renderDetailsDocument = async (documentID) => {
  
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour accéder à cette page.');
    window.location.href = "../index.html";
    return;
  }

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const avocatUserID = tokenPayload.userID;

  const container = document.getElementById("dashboard-sections");
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails du document</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTableBody"></tbody>
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
      let documentData = await response.json();
      const tableBody = document.getElementById("detailsTableBody");
      tableBody.innerHTML = Object.entries(documentData)
      .map(([key, value]) => {
        if (key.includes("date")) {
          return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}></td></tr>`;
        } else {
          return `<tr><th>${key}</th><td>${value ?? "-"}></td></tr>`;
        }
      })
      .join("");
    } else {
      console.error("Erreur lors de la récupération des détails du document:", response.statusText);
      alert("Erreur lors de la récupération des détails du document.");
    }  
  } catch (error) {
    console.error("Erreur réseau lors de la récupération des détails du document:", error);
    alert("Erreur réseau.");
  }

  document.getElementById('backButton').addEventListener('click', () => {
    if (typeof window.previousRender === 'function') {
      window.previousRender();
    } else {
      renderDocument(); // fallback
    }
  });

  // Supprimer le document
  document.getElementById("deleteButton").addEventListener("click", async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce document ?")) return;
    try {
      const response = await fetch(`/document/${documentID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Document supprimé avec succès.");
        renderDocument();
      } else {
        console.error("Erreur lors de la suppression du document:", response.statusText);
        alert("Erreur lors de la suppression du document.");
      }
    } catch (error) {
      console.error("Erreur réseau lors de la suppression du document:", error);
      alert("Erreur réseau lors de la suppression.");
    }
  });

  // Modifier le document
  document.getElementById("editButton").addEventListener("click", () => {
    const tableBody = document.getElementById("detailsTableBody");
    tableBody.innerHTML = Object.entries(documentData)
      .map(([key, value]) => {
        if (["documentID", "userID", "dateCreated"].includes(key)) {
          return `<tr><th>${key}</th><td>${value}</td></tr>`;
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
      const newData = { ...documentData };
      tableBody.querySelectorAll("input").forEach((input) => {
        newData[input.name] = input.value;
      });
      try {
        const response = await fetch(`/document/${documentID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newData),
        });
        if (response.ok) {
          alert("Document modifié avec succès.");
          renderDetailsDocument(documentID);
        } else {
          console.error("Erreur lors de la modification du document:", response.statusText);
          alert("Erreur lors de la modification du document.");
        }
      } catch (error) {
        console.error("Erreur réseau lors de la modification du document:", error);
        alert("Erreur réseau lors de la modification.");
      }
    });
  });
};
