export const renderDocument = async () => {
  window.lastDocumentSource = 'documents';

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour voir les dossiers.');
    window.location.href = "../index.html";
    return;
  }
  
  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const clientUserID = tokenPayload.userID;

  const container = document.getElementById('dashboard-sections');
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Ajouter un Document</h2>
      <form id="documentForm">
        <div class="field">
          <label class="label">Nom du document</label>
          <input class="input" name="documentNom" required placeholder="Nom du document" />
        </div>
        <div class="field">
          <label class="label">Description</label>
          <textarea class="textarea" name="description" required placeholder="Description"></textarea>
        </div>
        <div class="field">
          <label class="label">Fichier (URL)</label>
          <input class="input" name="fichier" required placeholder="Lien du fichier" />
        </div>
        <div class="field">
          <label class="label">Dossier associé (optionnel)</label>
          <div class="control">
            <div class="select">
              <select class="input" id="dossierSelect" name="dossierID">
                <option value="">Sélectionnez un dossier</option>
              </select>
            </div>
          </div>
        </div>
        <button class="button is-success" type="submit">Ajouter</button>
      </form>
      <hr />
      <h3 class="title is-5">Liste des Documents</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Dossier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="documentTableBody"></tbody>
      </table>
    </div>
  `;

  // Remplit le dropdown des dossiers du client connecté
  const fillDossierDropdown = async () => {
    try {
      const response = await fetch(`/dossier/client/${clientUserID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const dossiers = await response.json();
        const dossierSelect = document.getElementById('dossierSelect');
        dossierSelect.innerHTML = '<option value="">Sélectionnez un dossier</option>' +
          dossiers.map(dossier => `<option value="${dossier.dossierID}">${dossier.dossierNom || dossier.dossierID} (${dossier.dossierID})</option>`).join('');
      }
    } catch (error) {
      console.error("Erreur lors du remplissage du dropdown:", error);
      alert("Erreur lors du remplissage du dropdown des dossiers.");
    }
  };

  // Affiche la liste des documents du client
  const fetchDocumentsList = async () => {
    try {
      // Récupère les dossiers du client
      const dossiersResponse = await fetch(`/dossier/client/${clientUserID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      let dossierIDs = [];
      if (dossiersResponse.ok) {
        const dossiers = await dossiersResponse.json();
        dossierIDs = dossiers.map(d => d.dossierID);
      }
      // Récupère tous les documents pour ces dossiers
      let allDocuments = [];
      for (const dossierID of dossierIDs) {
        const docsResponse = await fetch(`/document/byDossier/${dossierID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (docsResponse.ok) {
          const docs = await docsResponse.json();
          docs.forEach(doc => doc.dossierID = dossierID);
          allDocuments = allDocuments.concat(docs);
        }
      }
      const tableBody = document.getElementById('documentTableBody');
      if (allDocuments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">Aucun document trouvé.</td></tr>';
      } else {
        tableBody.innerHTML = allDocuments.map(doc => `
          <tr>
            <td>${doc.documentID}</td>
            <td>${doc.documentNom}</td>
            <td>${doc.description || ''}</td>
            <td>${doc.dossierID || ''}</td>
            <td><button class="button is-small is-info" onclick="window.previousRender = window.renderDocument; window.renderDetailsDocument && window.renderDetailsDocument('${doc.documentID}')">Voir</button></td>
          </tr>
        `).join('');
      }
    } catch (error) {
      const tableBody = document.getElementById('documentTableBody');
      tableBody.innerHTML = '<tr><td colspan="5" class="has-text-danger">Erreur lors de la récupération des documents.</td></tr>';
    }
  };

  document.getElementById('documentForm').onsubmit = async (e) => {
    e.preventDefault();
    const documentNom = document.querySelector('input[name="documentNom"]').value.trim();
    const description = document.querySelector('textarea[name="description"]').value.trim();
    const fichier = document.querySelector('input[name="fichier"]').value.trim();
    const dossierID = document.querySelector('select[name="dossierID"]').value.trim();
    if (!documentNom || !description || !fichier) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const documentData = {
      userID: clientUserID,
      documentNom,
      description,
      fichier
    };
    if (dossierID) {
      documentData.dossierID = dossierID;
    }
    fetch('/document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(documentData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || err.message || "Erreur lors de l'ajout du document");
        });
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('documentForm').reset();
      fetchDocumentsList();
      alert("Document ajouté avec succès!");
    })
    .catch(error => {
      alert("Erreur lors de l'ajout du document: " + error.message);
    });
  };

  fillDossierDropdown();
  fetchDocumentsList();
};