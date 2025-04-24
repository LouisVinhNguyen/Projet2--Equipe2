import { renderDossierForm } from './dossierForm.js';
import { renderReceivedDocuments } from './documents.js';

export const renderDetails = async (tableType, entryId) => {
  const container = document.getElementById('dashboard-sections');

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails de ${tableType}</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTableBody"></tbody>
      </table>
      <button class="button is-link" id="backButton">Retour</button>
      <button class="button is-info" id="addDocumentButton">Ajouter un Document</button>
    </div>
    <div>
      <h3 class="title is-5">Documents Associés</h3>
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
    </div>
  `;

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté.');
    window.location.href = "../index.html";
    return;
  }

  // Charger les détails
  try {
    const response = await fetch(`/${tableType}/${entryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.ok) {
      const data = await response.json();
      const tableBody = document.getElementById('detailsTableBody');
      tableBody.innerHTML = Object.entries(data).map(([key, value]) => `
        <tr><th>${key}</th><td>${value}</td></tr>
      `).join('');
    } else {
      alert('Erreur lors de la récupération des détails.');
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    alert('Une erreur réseau s\'est produite.');
  }

  // Retour
  document.getElementById('backButton').addEventListener('click', () => {
    if (tableType === 'document') {
      renderReceivedDocuments();
    } else {
      renderDossierForm();
    }
  });

  // Ajouter un document
  document.getElementById('addDocumentButton').addEventListener('click', async () => {
    const form = document.createElement('form');
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
    container.appendChild(form);

    const documentSelect = form.querySelector('#documentSelect');

    // Récupérer la liste des documents disponibles
    try {
      const response = await fetch('/document', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const documents = await response.json();

      if (documents.length === 0) {
        const emptyOption = document.createElement('option');
        emptyOption.textContent = 'Aucun document disponible';
        emptyOption.disabled = true;
        documentSelect.appendChild(emptyOption);
      } else {
        documents.forEach((doc) => {
          const option = document.createElement('option');
          option.value = doc.documentID;
          option.textContent = doc.documentNom || 'Sans nom';
          documentSelect.appendChild(option);
        });
      }
    } catch (error) {
      alert('Erreur lors de la récupération des documents.');
    }

    // Envoi du formulaire pour associer le document
    form.onsubmit = async (e) => {
      e.preventDefault();
      const selectedDocumentId = documentSelect.value;

      if (!selectedDocumentId) {
        alert('Veuillez sélectionner un document.');
        return;
      }

      try {
        const response = await fetch('/document/link-dossier', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            documentID: selectedDocumentId.toString(),
            dossierID: entryId.toString()
          })
        });

        if (response.ok) {
          alert('Document associé avec succès!');
          form.remove();
          loadAssociatedDocuments(); // Refresh la liste
        } else {
          const errorText = await response.text();
          throw new Error(errorText);
        }
      } catch (error) {
        alert('Erreur: ' + error.message);
      }
    };
  });

  // Charger les documents liés au dossier
  const loadAssociatedDocuments = async () => {
    try {
      const response = await fetch(`/document/byDossier/${entryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error();

      const documents = await response.json();
      const documentsTableBody = document.getElementById('documentsTableBody');
      documentsTableBody.innerHTML = documents.map(doc => `
        <tr>
          <td>${doc.documentID}</td>
          <td>${doc.userID}</td>
          <td>${doc.documentNom}</td>
          <td>
            <button class="button is-small is-info" onclick="renderDetails('document', '${doc.documentID}')">Voir</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'affichage des documents associés.');
    }
  };

  // Si c’est un dossier, charger les documents associés
  if (tableType === 'dossier') {
    loadAssociatedDocuments();
  }
};
