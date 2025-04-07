export const renderDossierForm = async () => {
  const container = document.getElementById('dashboard-sections')
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Créer un Dossier</h2>
      <form id="dossierForm">
        <div class="field">
          <label class="label">Nom du dossier</label>
          <input class="input" name="dossierNom" required />
        </div>
        <div class="field">
          <label class="label">Type de dossier</label>
          <input class="input" name="dossierType" required />
        </div>
        <div class="field">
          <label class="label">Client ID</label>
          <select class="input" id="clientSelect" name="clientID" required>
            <option value="">Sélectionnez un client</option>
          </select>
        </div>
        <div class="field">
          <label class="label">Description</label>
          <textarea class="textarea" name="description"></textarea>
        </div>
        <button class="button is-primary" type="submit">Créer</button>
      </form>
      <hr />
      <h3 class="title is-5">Liste des Dossiers</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Status</th>
            <th>Description</th>
            <th>Date Création</th>
            <th>Date Fermeture</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="dossierTableBody">
          <!-- Les dossiers seront insérés ici -->
        </tbody>
      </table>
    </div>
  `

  // Fetch and populate client dropdown
  const fetchClients = async () => {
    try {
      const storedToken = sessionStorage.getItem('token');
      if (!storedToken) return;
      const response = await fetch('/client', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
      });
      if (response.ok) {
        const clients = await response.json();
        const clientSelect = document.getElementById('clientSelect');
        clientSelect.innerHTML = `<option value="">Sélectionnez un client</option>` +
          clients.map(client => `
            <option value="${client.clientID}">${client.clientID} - ${client.prenom} ${client.nom}</option>
          `).join('');
      } else {
        console.error('Erreur lors de la récupération des clients:', response.statusText);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  // Fetch and display dossiers
  const fetchDossiers = async () => {
    try {
      const storedToken = sessionStorage.getItem('token');
      if (!storedToken) {
        alert('Vous devez être connecté pour voir les dossiers.');
        window.location.href = "../index.html";
        return;
      }
      const response = await fetch('/dossier', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
      });
      if (response.ok) {
        const dossiers = await response.json();
        const tableBody = document.getElementById('dossierTableBody');
        tableBody.innerHTML = dossiers.map(dossier => `
          <tr>
            <td>${dossier.dossierID}</td>
            <td>${dossier.dossierNom}</td>
            <td>${dossier.dossierType}</td>
            <td>${dossier.status}</td>
            <td>${dossier.description}</td>
            <td>${new Date(dossier.dateCreated).toLocaleDateString()}</td>
            <td>${dossier.dateClosed ? new Date(dossier.dateClosed).toLocaleDateString() : 'N/A'}</td>
            <td>
              <button class="button is-small is-warning edit-dossier" data-id="${dossier.id}">Edit</button>
              <button class="button is-small is-danger delete-dossier" data-id="${dossier.id}">Supprimer</button>
            </td>
          </tr>
        `).join('');

        // Add event listeners for Edit and Delete buttons
        const editButtons = document.querySelectorAll('.edit-dossier');
        const deleteButtons = document.querySelectorAll('.delete-dossier');

        editButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            const dossierId = e.target.getAttribute('data-id');
            editDossier(dossierId);
          });
        });

        deleteButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            const dossierId = e.target.getAttribute('data-id');
            deleteDossier(dossierId);
          });
        });
      } else {
        console.error('Erreur lors de la récupération des dossiers:', response.statusText);
        alert('Erreur lors de la récupération des dossiers. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Une erreur réseau s\'est produite. Veuillez réessayer.');
    }
  };

  // Handle form submission for creating a new dossier
  document.getElementById('dossierForm').onsubmit = async (e) => {
    e.preventDefault();
    const storedToken = sessionStorage.getItem('token');
    if (!storedToken) {
      alert('Vous devez être connecté pour créer un dossier.');
      return;
    }
    const formData = new FormData(e.target);
    const dossierData = Object.fromEntries(formData.entries());
    dossierData.avocatID = 1; // Set avocatID (can be dynamic if needed)
    // If no client is selected, remove clientID so backend sets it to null
    if (!dossierData.clientID) {
      delete dossierData.clientID;
    }
    try {
      const response = await fetch('/dossier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify(dossierData),
      });
      if (response.ok) {
        alert('Dossier créé avec succès.');
        e.target.reset();
        await fetchDossiers();
      } else {
        console.error('Erreur lors de la création du dossier:', response.statusText);
        alert('Erreur lors de la création du dossier. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Une erreur réseau s\'est produite. Veuillez réessayer.');
    }
  };

  await fetchClients();
  await fetchDossiers();
};