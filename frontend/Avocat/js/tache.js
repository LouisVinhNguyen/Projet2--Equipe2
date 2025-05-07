export const renderTache = async () => {

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour accéder à cette page.');
    window.location.href = "../index.html";
    return;
  }

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const avocatUserID = tokenPayload.userID;

  const container = document.getElementById('dashboard-sections');
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Créer une Tâche</h2>
      <form id="tacheForm">
        <div class="field">
          <label class="label">Nom de la tâche</label>
          <input class="input" name="documentNom" required />
        </div>
        <div class="field">
          <label class="label">Description</label>
          <textarea class="textarea" name="description" required></textarea>
        </div>
        <div class="field">
          <label class="label">Dossier</label>
          <input class="input" id="dossierSearchInput" placeholder="Rechercher un dossier..." autocomplete="off" style="margin-bottom: 8px; max-width: 250px; display: inline-block;" />
          <select class="input" id="dossierSelect" name="dossierID" required style="max-width: 250px; display: inline-block;">
            <option value="">Sélectionnez un dossier</option>
          </select>
        </div>
        <div class="field">
          <label class="label">Statut</label>
          <select class="input" name="status" required>
            <option value="">Sélectionnez un statut</option>
            <option value="Non commencée">Non commencée</option>
            <option value="En cours">En cours</option>
            <option value="Terminée">Terminée</option>
            <option value="Bloquée">Bloquée</option>
            <option value="Annulée">Annulée</option>
          </select>
        </div>
        <button class="button is-primary" type="submit">Créer</button>
      </form>
      <hr />
      <h3 class="title is-5">Liste des Tâches</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Dossier</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tacheTableBody"></tbody>
      </table>
    </div>
  `;

  let allDossiers = [];

  const fetchDossiers = async () => {
    try {
      const response = await fetch(`/dossier/avocat/${avocatUserID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        allDossiers = await response.json();
        renderDossierOptions(allDossiers);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  const renderDossierOptions = (dossiers) => {
    const dossierSelect = document.getElementById('dossierSelect');
    dossierSelect.innerHTML = `<option value="">Sélectionnez un dossier</option>` +
      dossiers.map(dossier => `
        <option value="${dossier.dossierID}">${dossier.dossierID} - ${dossier.dossierNom}</option>
      `).join('');
  };

  const dossierSearchInput = document.getElementById('dossierSearchInput');
  dossierSearchInput.addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    const filtered = allDossiers.filter(dossier =>
      (dossier.dossierNom && dossier.dossierNom.toLowerCase().includes(search)) ||
      dossier.dossierID.toString().includes(search)
    );
    renderDossierOptions(filtered);
  });

  const fetchTaches = async () => {
    try {
      const response = await fetch('/tache', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const taches = await response.json();
        const tableBody = document.getElementById('tacheTableBody');
        tableBody.innerHTML = taches.map(tache => `
          <tr>
            <td>${tache.tacheID}</td>
            <td>${tache.documentNom}</td>
            <td>${tache.description}</td>
            <td>${tache.dossierID}</td>
            <td>${tache.status}</td>
            <td><button class="button is-small is-info view-tache" onclick="window.renderDetailsTache && window.renderDetailsTache('${tache.tacheID}')">Voir</button></td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  document.getElementById('tacheForm').onsubmit = async (e) => {
    e.preventDefault();

    const userID = avocatUserID
    const documentNom = document.querySelector('input[name="documentNom"]').value.trim();
    const description = document.querySelector('textarea[name="description"]').value.trim();
    const dossierID = document.getElementById('dossierSelect').value;
    const status = document.querySelector('select[name="status"]').value;
    if (!documentNom || !description || !dossierID || !status) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    const tacheData = {
      userID,
      dossierID,
      documentNom,
      description,
      status
    };
    try {
      const response = await fetch('/tache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tacheData)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.message || "Erreur de création");
      }
      document.getElementById('tacheForm').reset();
      alert("Tâche créée avec succès !");
      fetchTaches();
    } catch (error) {
      console.error("Erreur:", error.message);
      alert("Erreur: " + error.message);
    }
  };

  await fetchDossiers();
  await fetchTaches();
};
