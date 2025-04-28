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

  // Fetch and display dossiers (inspiré de la version Avocat)
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
      // Pour admin, on garde /dossier (tous dossiers)
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
            <td>${dossier.status || ''}</td>
            <td>${dossier.description || ''}</td>
            <td>${dossier.dateCreated ? new Date(dossier.dateCreated).toLocaleDateString() : ''}</td>
            <td>${dossier.dateClosed ? new Date(dossier.dateClosed).toLocaleDateString() : ''}</td>
            <td>
              <button class="button is-small is-info view-dossier" onclick="window.renderDetails && window.renderDetails('dossier', '${dossier.dossierID}')">Voir</button>
              <button class="button is-small is-warning edit-dossier" data-id="${dossier.dossierID}">Edit</button>
              <button class="button is-small is-danger delete-dossier" data-id="${dossier.dossierID}">Supprimer</button>
            </td>
          </tr>
        `).join('');

        // Inline edit (comme Avocat)
        document.querySelectorAll('.edit-dossier').forEach(button => {
          button.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            row.querySelectorAll('td').forEach((cell, idx) => {
              if ([1,2,3,4].includes(idx)) cell.setAttribute('contenteditable', 'true');
            });
            e.target.textContent = "Save";
            e.target.classList.remove('edit-dossier');
            e.target.classList.add('save-dossier');
            e.target.addEventListener('click', async () => {
              const dossierId = e.target.getAttribute('data-id');
              const cells = row.querySelectorAll('td');
              const dossierNom = cells[1].textContent.trim();
              const dossierType = cells[2].textContent.trim();
              const status = cells[3].textContent.trim();
              const description = cells[4].textContent.trim();
              try {
                const response = await fetch(`/dossier/${dossierId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                  },
                  body: JSON.stringify({ dossierNom, dossierType, status, description })
                });
                if (!response.ok) {
                  const err = await response.json();
                  throw new Error(err.message || 'Erreur de mise à jour');
                }
                row.querySelectorAll('td').forEach((cell, idx) => {
                  if ([1,2,3,4].includes(idx)) cell.removeAttribute('contenteditable');
                });
                e.target.textContent = "Edit";
                e.target.classList.remove('save-dossier');
                e.target.classList.add('edit-dossier');
                fetchDossiers();
              } catch (error) {
                alert("Erreur lors de la mise à jour.");
              }
            }, { once: true });
          });
        });
        document.querySelectorAll('.delete-dossier').forEach(button => {
          button.addEventListener('click', async (e) => {
            const dossierId = e.target.getAttribute('data-id');
            if (confirm('Voulez-vous vraiment supprimer ce dossier ?')) {
              await fetch(`/dossier/${dossierId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${storedToken}`
                }
              });
              fetchDossiers();
            }
          });
        });
      }
    } catch (error) {
      alert('Erreur réseau.');
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