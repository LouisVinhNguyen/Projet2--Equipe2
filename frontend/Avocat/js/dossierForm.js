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
            <option value="${client.userID}">${client.userID} - ${client.prenom} ${client.nom}</option>
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
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      const avocatUserID = tokenPayload.userID;

      const response = await fetch(`/dossier/avocat/${avocatUserID}`, {
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
    
    // Get token
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour créer un dossier.');
      return;
    }
    
    // Get values from form
    const dossierNom = document.querySelector('input[name="dossierNom"]').value.trim();
    const dossierType = document.querySelector('input[name="dossierType"]').value.trim();
    const clientID = document.getElementById('clientSelect').value; // This is clientUserID
    const description = document.querySelector('textarea[name="description"]').value.trim();
    
    // Validate required fields
    if (!dossierNom || !dossierType || !description) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    // Get userID from JWT token payload
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userID = tokenPayload.userID;
    
    // Create the dossier data object with correct property names
    const dossierData = {
      avocatUserID: userID,
      dossierNom: dossierNom,
      dossierType: dossierType,
      description: description
    };
    
    // Add clientUserID if selected
    if (clientID) {
      dossierData.clientUserID = clientID;
    }
    
    console.log("Sending dossier data:", dossierData);
    
    // Send data to server
    fetch('/dossier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dossierData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || err.message || "Erreur lors de la création du dossier");
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("Dossier créé avec succès:", data);
      
      // Reset form
      document.getElementById('dossierForm').reset();
      
      // Refresh the dossier list
      fetchDossiers();
      
      alert("Dossier créé avec succès!");
    })
    .catch(error => {
      console.error("Erreur lors de la création du dossier:", error.message);
      alert("Erreur lors de la création du dossier: " + error.message);
    });
  };

  await fetchClients();
  await fetchDossiers();
};