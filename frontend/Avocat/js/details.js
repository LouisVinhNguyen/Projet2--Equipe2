import { renderDossierForm } from './dossierForm.js';
import { renderReceivedDocuments } from './documents.js';

export const renderDetails = async (tableType, entryId) => {
  const container = document.getElementById('dashboard-sections');

  // Clear the container and set up the structure
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails de ${tableType}</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTableBody">
          <!-- Les détails seront insérés ici -->
        </tbody>
      </table>
      <button class="button is-link" id="backButton">Retour</button>
    </div>
  `;
  // Fetch the details from the corresponding route
  try {
    const storedToken = sessionStorage.getItem('token');
    if (!storedToken) {
      alert('Vous devez être connecté pour voir les détails.');
      window.location.href = "../index.html";
      return;
    }    // Match the route format defined in the backend routes
    const response = await fetch(`/${tableType}/${entryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storedToken}`
      },
    });

    if (response.ok) {
      const data = await response.json();
      const tableBody = document.getElementById('detailsTableBody');

      // Dynamically populate the table with data
      tableBody.innerHTML = Object.entries(data).map(([key, value]) => `
        <tr>
          <th>${key}</th>
          <td>${value}</td>
        </tr>
      `).join('');
    } else {
      console.error('Erreur lors de la récupération des détails:', response.statusText);
      alert('Erreur lors de la récupération des détails. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    alert('Une erreur réseau s\'est produite. Veuillez réessayer.');
  }  // Add event listener for the back button - return to appropriate page based on table type
  document.getElementById('backButton').addEventListener('click', () => {
    if (tableType === 'document') {
      renderReceivedDocuments();
    } else {
      renderDossierForm();
    }
  });
};