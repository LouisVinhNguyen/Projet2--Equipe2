export const renderDossierForm = async () => {
  const container = document.getElementById('dashboard-sections');
  
  // Récupérer les dossiers existants pour les afficher
  let dossiers = [];
  try {
    dossiers = await getDossiers();
  } catch (error) {
    console.error("Erreur lors du chargement des dossiers:", error);
    dossiers = [];
  }
  
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Créer un Dossier</h2>
      <form id="dossierForm">
        <div class="field">
          <label class="label">Nom du dossier</label>
          <input class="input" name="nom" required />
        </div>
        <div class="field">
          <label class="label">Client concerné</label>
          <input class="input" name="client" required />
        </div>
        <div class="field">
          <label class="label">Description</label>
          <textarea class="textarea" name="description"></textarea>
        </div>
        <button class="button is-primary" type="submit">Créer</button>
      </form>
      
      <hr />
      <h3 class="subtitle is-5">Dossiers existants</h3>
      <div id="dossiers-list">
        ${dossiers.length ? dossiers.map(dossier => `
          <div class="box is-light mb-3">
            <h4 class="title is-5">${dossier.nom}</h4>
            <p><strong>Client:</strong> ${dossier.client}</p>
            <p>${dossier.description || 'Aucune description'}</p>
            <div class="buttons mt-3">
              <button class="button is-small is-info edit-dossier" data-id="${dossier._id}">Modifier</button>
              <button class="button is-small is-danger delete-dossier" data-id="${dossier._id}">Supprimer</button>
            </div>
          </div>
        `).join('') : '<p>Aucun dossier disponible.</p>'}
      </div>
    </div>
  `;

  // Gestion du formulaire de création
  document.getElementById('dossierForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Ajouter la date de création
    data.dateCreation = new Date().toISOString().split('T')[0];
    
    // Envoyer le dossier au serveur
    await creerDossier(data);
    e.target.reset();
  };

  // Ajouter les écouteurs d'événements pour les boutons modifier
  document.querySelectorAll('.edit-dossier').forEach(button => {
    button.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      await afficherFormulaireMiseAJour(id);
    });
  });

  // Ajouter les écouteurs d'événements pour les boutons supprimer
  document.querySelectorAll('.delete-dossier').forEach(button => {
    button.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
        await supprimerDossier(id);
      }
    });
  });
};

// Fonction pour récupérer tous les dossiers (GET)
export async function getDossiers() {
  try {
    const response = await fetch('/api/dossiers', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Dossiers récupérés:", data);
      return data;
    } else {
      console.error("Erreur lors de la récupération des dossiers:", response.statusText);
      alert("Erreur lors de la récupération des dossiers. Veuillez réessayer.");
      return [];
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
    return [];
  }
}

export async function creerDossier(dossier) {
  try {
    const response = await fetch('/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dossier),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Dossier créé:", data);
      alert("Dossier créé avec succès !");
      await renderDossierForm(); // Rafraîchir l'affichage
    } else {
      console.error("Erreur lors de la création du dossier:", response.statusText);
      alert("Erreur lors de la création du dossier. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
  }
}

export async function mettreAJourDossier(id, dossierMisAJour) {
  try {
    const response = await fetch(`/api/dossiers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dossierMisAJour),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Dossier mis à jour:", data);
      alert("Dossier mis à jour avec succès !");
      await renderDossierForm(); // Rafraîchir l'affichage
    } else {
      console.error("Erreur lors de la mise à jour du dossier:", response.statusText);
      alert("Erreur lors de la mise à jour du dossier. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
  }
}

// Fonction pour supprimer un dossier (DELETE)
export async function supprimerDossier(id) {
  try {
    const response = await fetch(`/api/dossiers/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Dossier supprimé:", data);
      alert("Dossier supprimé avec succès !");
      await renderDossierForm(); // Rafraîchir l'affichage
    } else {
      console.error("Erreur lors de la suppression du dossier:", response.statusText);
      alert("Erreur lors de la suppression du dossier. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
  }
}

// Fonction pour afficher le formulaire de mise à jour d'un dossier
export async function afficherFormulaireMiseAJour(id) {
  try {
    // Récupérer tous les dossiers
    const dossiers = await getDossiers();
    // Trouver le dossier à modifier
    const dossier = dossiers.find(d => d._id === id);
    
    if (!dossier) {
      alert("Dossier non trouvé.");
      return;
    }
    
    // Afficher le formulaire de mise à jour
    const container = document.getElementById('dashboard-sections');
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Modifier le Dossier</h2>
        <form id="updateDossierForm">
          <input type="hidden" name="id" value="${id}" />
          <div class="field">
            <label class="label">Nom du dossier</label>
            <input class="input" name="nom" value="${dossier.nom}" required />
          </div>
          <div class="field">
            <label class="label">Client concerné</label>
            <input class="input" name="client" value="${dossier.client}" required />
          </div>
          <div class="field">
            <label class="label">Description</label>
            <textarea class="textarea" name="description">${dossier.description || ''}</textarea>
          </div>
          <div class="buttons">
            <button class="button is-warning" type="submit">Mettre à jour</button>
            <button class="button" type="button" id="cancelUpdate">Annuler</button>
          </div>
        </form>
      </div>
    `;

    // Gestion du formulaire de mise à jour
    document.getElementById('updateDossierForm').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const id = data.id;
      delete data.id; // Retirer l'ID des données à envoyer
      
      // Conserver la date de création d'origine
      data.dateCreation = dossier.dateCreation;
      // Ajouter la date de mise à jour
      data.dateMiseAJour = new Date().toISOString().split('T')[0];
      
      await mettreAJourDossier(id, data);
    };

    // Gestion du bouton d'annulation
    document.getElementById('cancelUpdate').addEventListener('click', () => {
      renderDossierForm();
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage du formulaire de mise à jour:", error);
    alert("Une erreur s'est produite. Veuillez réessayer.");
  }
}