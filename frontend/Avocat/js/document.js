export const renderDocument = async () => {

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour accéder à cette page.');
    window.location.href = "../index.html";
    return;
  }

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const avocatUserID = tokenPayload.userID;

  const container = document.getElementById('dashboard-sections')
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
            <th>Avocat ID</th>
            <th>Nom</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="documentTableBody">
          <!-- Les documents seront insérés ici -->
        </tbody>
      </table>
    </div>
  `
  
  const fetchDocumentsList = async () => {
    try {
      const response = await fetch('/document', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (response.ok) {
        const documents = await response.json()
        const tableBody = document.getElementById('documentTableBody')
        tableBody.innerHTML = documents.map(doc => `
          <tr>
            <td>${doc.documentID}</td>
            <td>${doc.userID}</td>
            <td>${doc.documentNom}</td>
            <td>
              <button class="button is-small is-info view-document" onclick="window.previousRender = window.renderDocument; window.renderDetailsDocument && window.renderDetailsDocument('${doc.documentID}')">Voir</button>
            </td>
          </tr>
        `).join('')
      } else {
        console.error('Erreur lors de la récupération des documents:', response.statusText)
        alert("Erreur lors de la récupération des documents. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Erreur réseau:", error)
      alert("Une erreur réseau s'est produite. Veuillez réessayer.")
    }
  }
  
  document.getElementById('documentForm').onsubmit = async (e) => {
    e.preventDefault();
    
    // Get token
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour ajouter un document.');
      return;
    }
    
    // Get values from form
    const documentNom = document.querySelector('input[name="documentNom"]').value.trim();
    const description = document.querySelector('textarea[name="description"]').value.trim();
    const fichier = document.querySelector('input[name="fichier"]').value.trim();
    const dossierID = document.querySelector('select[name="dossierID"]').value.trim();
    
    // Validate required fields
    if (!documentNom || !description || !fichier) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    // Create the document data object with correct property names
    const documentData = {
      userID: avocatUserID,
      documentNom: documentNom,
      description: description,
      fichier: fichier
    };
    
    // Add dossierID if provided
    if (dossierID) {
      documentData.dossierID = dossierID;
    }
    
    console.log("Sending document data:", documentData);
    
    // Send data to server
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
      console.log("Document ajouté avec succès:", data);
      
      // Reset form
      document.getElementById('documentForm').reset();
      
      // Refresh the document list
      fetchDocumentsList();
      
      alert("Document ajouté avec succès!");
    })
    .catch(error => {
      console.error("Erreur lors de l'ajout du document:", error.message);
      alert("Erreur lors de l'ajout du document: " + error.message);
    });
  }
  
  // Remplit le dropdown des dossiers de l'avocat connecté
  const fillDossierDropdown = async () => {
    try {
      const response = await fetch(`/dossier/avocat/${avocatUserID}`, {
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
          dossiers.map(dossier => `<option value="${dossier.dossierID}">${dossier.dossierNom} (${dossier.dossierID})</option>`).join('');
      }
    } catch (error) {
      console.error("Erreur lors du remplissage du dropdown:", error);
      alert("Erreur lors du remplissage du dropdown des dossiers.");
    }
  };

  fillDossierDropdown();
  fetchDocumentsList();
}