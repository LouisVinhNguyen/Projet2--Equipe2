import { renderDossierForm } from "./dossierForm.js";

export const renderDetailsDossier = async (dossierID) => {

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
      <h2 class="title is-4">Détails du dossier</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTableBody"></tbody>
      </table>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
        <div id="leftSideButtons">
          <button class="button is-link" id="backButton">Retour</button>

        </div>
        <div id="actionButtons">
          <button class="button is-warning" id="editButton">Modifier</button>
          <button class="button is-danger" id="deleteButton">Supprimer</button>
          <button class="button is-primary" id="closeDossierButton">Clôturer le dossier</button>
        </div>
      </div>
    </div>

    <div class="box">
      <h2 class="title is-4">Gestionnaire de sessions</h2>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
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
      <button class="button is-primary" id="startSession">Commencer une session</button>
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
      <button class="button is-info" id="addDocumentButton">Ajouter un document</button>
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
      .map(([key, value]) => {
        if (key.includes("date")) {
          return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}</td></tr>`;
        } else {
          return `<tr><th>${key}</th><td>${value ?? "-"}</td></tr>`;
        }
      })
      .join("");
    } else {
      console.error("Erreur lors de la récupération des détails du dossier:", response.statusText);
      alert("Erreur lors de la récupération des détails du dossier.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du dossier:", error);
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
    documentsTableBody.innerHTML = documents.map(doc => `
      <tr>
        <td>${doc.documentID}</td>
        <td>${doc.userID}</td>
        <td>${doc.documentNom}</td>
        <td>
          <button class="button is-small is-info view-document" onclick="window.previousRender = () => renderDetailsDossier(${dossierID}); window.renderDetailsDocument && window.renderDetailsDocument('${doc.documentID}')">Voir</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    // Pas bloquant
  }

  // Gestionnaire de sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch(`/session/dossier/${dossierID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const sessions = await response.json();
        const tableBody = document.getElementById('sessionTableBody');
        tableBody.innerHTML = sessions.map(session => `
          <tr>
            <td>${session.sessionID}</td>
            <td>${session.dossierID}</td>
            <td>${session.clockInTime ? new Date(session.clockInTime).toLocaleString() : '-'}</td>
            <td>${session.clockOutTime ? new Date(session.clockOutTime).toLocaleString() : '-'}</td>
            <td>${session.tempsTotal}</td>
            <td>${session.description}</td>
            <td><button class="button is-small is-info view-session" onclick="window.previousRender = () => renderDetailsDossier(${dossierID}); window.renderDetailsSession && window.renderDetailsSession('${session.sessionID}')">Voir</button></td>
          </tr>
        `).join('');
      } else {
        console.error("Erreur lors de la récupération des sessions:", response.statusText);
        alert("Erreur lors de la récupération des sessions.");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur réseau lors de la récupération des sessions.");
    }
  };
  fetchSessions();

  // Commencer une session
  document.getElementById('startSession').addEventListener('click', async () => {
    // Affiche un formulaire pour saisir la description de la session
    const form = document.createElement('form');
    form.innerHTML = `
      <div class="field">
        <label class="label">Description de la session</label>
        <input class="input" name="description" required placeholder="Description de la session" />
      </div>
      <button class="button is-success" type="submit">Créer la session</button>
    `;
    document.getElementById('startSession').after(form);

    form.onsubmit = async (e) => {
      e.preventDefault();
      const description = form.querySelector('input[name="description"]').value.trim();
      if (!description) {
        alert('Veuillez entrer une description.');
        return;
      }
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userID = tokenPayload.userID;
        const response = await fetch('/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userID,
            dossierID,
            description
          })
        });
        if (response.ok) {
          alert('Session créée avec succès.');
          form.remove();
          fetchSessions();
        } else {
          const err = await response.text();
          alert('Erreur lors de la création de la session : ' + err);
          form.remove();
        }
      } catch (error) {
        alert('Erreur réseau lors de la création de la session.');
        form.remove();  
      }
    };
  });

  // Retour
  document.getElementById("backButton").addEventListener("click", () => {
    renderDossierForm();
  });

  document.getElementById("addDocumentButton").addEventListener("click", async () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <div class="field">
        <label class="label">Sélectionner un Document</label>
        <div class="control">
          <div class="select">
            <select id="documentSelect" required>
              <option value="" disabled selected>Choisir un document</option>
            </select>
          </div>
        </div>
      </div>
      <button class="button is-link" type="submit">Associer</button>
    `;
    // Place le formulaire juste après la box principale
    document.getElementById('addDocumentButton').after(form);

    const documentSelect = form.querySelector("#documentSelect");

    // Charger la liste des documents disponibles
    try {
      const response = await fetch("/document", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const documents = await response.json();
      // Exclure ceux déjà liés à ce dossier
      const linkedDocs = Array.from(document.getElementById('documentsTableBody').querySelectorAll('tr')).map(tr => tr.children[0].textContent);
      const availableDocs = documents.filter(doc => !linkedDocs.includes(doc.documentID.toString()));
      if (availableDocs.length === 0) {
        const emptyOption = document.createElement("option");
        emptyOption.textContent = "Aucun document disponible";
        emptyOption.disabled = true;
        documentSelect.appendChild(emptyOption);
      } else {
        availableDocs.forEach((doc) => {
          const option = document.createElement("option");
          option.value = doc.documentID;
          option.textContent = doc.documentNom || "Sans nom";
          documentSelect.appendChild(option);
        });
      }
    } catch (error) {
      alert("Erreur lors de la récupération des documents.");
    }

    // Soumission du formulaire pour associer le document
    form.onsubmit = async (e) => {
      e.preventDefault();
      const selectedDocumentId = documentSelect.value;
      if (!selectedDocumentId) {
        alert("Veuillez sélectionner un document.");
        return;
      }
      try {
        const response = await fetch("/document/link-dossier", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            documentID: selectedDocumentId.toString(),
            dossierID: dossierID.toString(),
          }),
        });
        if (response.ok) {
          alert("Document associé avec succès!");
          form.remove();
          // Recharge la liste des documents associés
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
            documentsTableBody.innerHTML = documents
              .map(
                (doc) => `
                <tr>
                  <td>${doc.documentID}</td>
                  <td>${doc.userID}</td>
                  <td>${doc.documentNom}</td>
                  <td>
                    <button class="button is-small is-info" onclick="window.renderDetailsDocument && window.renderDetailsDocument('${doc.documentID}')">Voir</button>
                  </td>
                </tr>
              `
              )
              .join('');
          } catch (error) {
            // Pas bloquant
          }
        } else {
          const errorText = await response.text();
          throw new Error(errorText);
        }
      } catch (error) {
        alert("Erreur: " + error.message);
      }
    };
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
