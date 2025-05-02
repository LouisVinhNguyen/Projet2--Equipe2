import { renderDetailsDocument } from './detailsDocument.js';

export const renderClientDocuments = async () => {
  window.lastDocumentSource = 'documents';
  const container = document.getElementById('dashboard-sections');
  const token = sessionStorage.getItem('token');
  if (!token) {
    container.innerHTML = '<p class="has-text-danger">Vous devez être connecté pour voir vos documents.</p>';
    return;
  }
  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const clientUserID = tokenPayload.userID;

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Mes Documents</h2>
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

  try {
    // Fetch dossiers for this client
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
    // Fetch all documents for these dossiers
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
        // Add dossierID to each doc for display
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
          <td><button class="button is-small is-info" onclick="window.renderDetailsDocument && window.renderDetailsDocument('${doc.documentID}')">Voir</button></td>
        </tr>
      `).join('');
    }
  } catch (error) {
    const tableBody = document.getElementById('documentTableBody');
    tableBody.innerHTML = '<tr><td colspan="5" class="has-text-danger">Erreur lors de la récupération des documents.</td></tr>';
  }
};

window.renderClientDocuments = renderClientDocuments;