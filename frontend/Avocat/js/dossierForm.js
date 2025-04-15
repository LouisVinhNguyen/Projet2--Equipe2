let dossierEnEditionID = null;

export const renderDossierForm = async () => {
  const container = document.getElementById('dashboard-sections');
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
          <label class="label">Statut</label>
          <input class="input" name="status" value="En cours" required />
        </div>
        <div class="field">
          <label class="label">Description</label>
          <textarea class="textarea" name="description" required></textarea>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="dossierTableBody"></tbody>
      </table>
    </div>
  `;

  const fetchClients = async () => {
    try {
      const storedToken = sessionStorage.getItem('token');
      if (!storedToken) return;
      const response = await fetch('/client', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      });
      if (response.ok) {
        const clients = await response.json();
        const clientSelect = document.getElementById('clientSelect');
        clientSelect.innerHTML = `<option value="">Sélectionnez un client</option>` +
          clients.map(client => `
            <option value="${client.userID}">${client.userID} - ${client.prenom} ${client.nom}</option>
          `).join('');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

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
        }
      });

      if (response.ok) {
        const dossiers = await response.json();
        const tableBody = document.getElementById('dossierTableBody');
        tableBody.innerHTML = dossiers.map(dossier => `
          <tr>
            <td>${dossier.dossierID}</td>
            <td class="editable" data-id="${dossier.dossierID}" data-field="dossierNom">${dossier.dossierNom}</td>
            <td class="editable" data-id="${dossier.dossierID}" data-field="dossierType">${dossier.dossierType}</td>
            <td class="editable" data-id="${dossier.dossierID}" data-field="status">${dossier.status}</td>
            <td class="editable" data-id="${dossier.dossierID}" data-field="description">${dossier.description}</td>
            <td>
              <button class="button is-small is-info view-dossier" onclick="renderDetails('dossier', '${dossier.dossierID}')">Voir</button>
              <button class="button is-small is-warning edit-dossier" data-id="${dossier.dossierID}">Edit</button>
              <button class="button is-small is-danger delete-dossier" data-id="${dossier.dossierID}">Supprimer</button>
            </td>
          </tr>
        `).join('');

        document.querySelectorAll('.edit-dossier').forEach(button => {
          button.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            row.querySelectorAll('.editable').forEach(cell => {
              cell.setAttribute('contenteditable', 'true');
            });
            e.target.textContent = "Save";
            e.target.classList.remove('edit-dossier');
            e.target.classList.add('save-dossier');

            e.target.addEventListener('click', async () => {
              const dossierId = e.target.getAttribute('data-id');
              const dossierNom = row.querySelector('[data-field="dossierNom"]').textContent.trim();
              const dossierType = row.querySelector('[data-field="dossierType"]').textContent.trim();
              const status = row.querySelector('[data-field="status"]').textContent.trim();
              const description = row.querySelector('[data-field="description"]').textContent.trim();
              const dossier = dossiers.find(d => d.dossierID == dossierId);
              const clientUserID = dossier.clientUserID;

              const token = sessionStorage.getItem('token');
              const tokenPayload = JSON.parse(atob(token.split('.')[1]));
              const avocatUserID = tokenPayload.userID;

              try {
                const response = await fetch(`/dossier/${dossierId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    avocatUserID,
                    dossierNom,
                    dossierType,
                    status,
                    description,
                    clientUserID
                  })
                });

                if (!response.ok) {
                  const err = await response.json();
                  throw new Error(err.message || 'Erreur de mise à jour');
                }

                row.querySelectorAll('.editable').forEach(cell => {
                  cell.removeAttribute('contenteditable');
                });
                e.target.textContent = "Edit";
                e.target.classList.remove('save-dossier');
                e.target.classList.add('edit-dossier');
                fetchDossiers();
              } catch (error) {
                console.error('Erreur lors de la mise à jour inline:', error.message);
                alert("Erreur lors de la mise à jour.");
              }
            }, { once: true });
          });
        });

        document.querySelectorAll('.delete-dossier').forEach(button => {
          button.addEventListener('click', async (e) => {
            const dossierId = e.target.getAttribute('data-id');
            if (confirm('Voulez-vous vraiment supprimer ce dossier ?')) {
              const token = sessionStorage.getItem('token');
              await fetch(`/dossier/${dossierId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              fetchDossiers();
            }
          });
        });
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  document.getElementById('dossierForm').onsubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('token');
    if (!token) return;

    const dossierNom = document.querySelector('input[name="dossierNom"]').value.trim();
    const dossierType = document.querySelector('input[name="dossierType"]').value.trim();
    const status = document.querySelector('input[name="status"]').value.trim();
    const description = document.querySelector('textarea[name="description"]').value.trim();
    const clientID = document.getElementById('clientSelect').value;

    if (!dossierNom || !dossierType || !description || !status) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userID = tokenPayload.userID;

    const dossierData = {
      avocatUserID: userID,
      dossierNom,
      dossierType,
      status,
      description,
      clientUserID: clientID
    };

    try {
      const response = await fetch('/dossier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dossierData)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erreur de création");
      }

      document.getElementById('dossierForm').reset();
      alert("Dossier créé avec succès !");
      fetchDossiers();
    } catch (error) {
      console.error("Erreur:", error.message);
      alert("Erreur: " + error.message);
    }
  };

  await fetchClients();
  await fetchDossiers();
};
