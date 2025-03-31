import { addClient } from './clientStorage.js';

export const renderClientForm = async () => {
  const container = document.getElementById('dashboard-sections');
  
  // Récupérer la liste des clients existants
  let clients = [];
  try {
    clients = await getClients();
  } catch (error) {
    console.error("Erreur lors du chargement des clients:", error);
    clients = [];
  }
  
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Ajouter un Client</h2>
      <form id="clientForm">
        <div class="field">
          <label class="label">Nom complet</label>
          <input class="input" name="nom" required />
        </div>
        <div class="field">
          <label class="label">Email</label>
          <input class="input" name="email" type="email" required />
        </div>
        <div class="field">
          <label class="label">Téléphone</label>
          <input class="input" name="tel" />
        </div>
        <button class="button is-success" type="submit">Ajouter</button>
      </form>
      
      <hr />
      <h3 class="subtitle is-5">Liste des Clients</h3>
      <div id="clients-list">
        ${clients && clients.length ? clients.map(client => `
          <div class="box is-light mb-3">
            <h4 class="title is-5">${client.nom}</h4>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Téléphone:</strong> ${client.tel || 'Non renseigné'}</p>
            <div class="buttons mt-3">
              <button class="button is-small is-info edit-client" data-id="${client._id}">Modifier</button>
              <button class="button is-small is-danger delete-client" data-id="${client._id}">Supprimer</button>
            </div>
          </div>
        `).join('') : '<p>Aucun client disponible.</p>'}
      </div>
    </div>
  `;

  // Gestion du formulaire d'ajout de client
  document.getElementById('clientForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    
    // Ajouter le client au stockage local et à l'API
    addClient(data); // Stockage local (fonction existante)
    await postClient(data); // API
    
    // Rafraîchir l'affichage après l'ajout
    await renderClientForm();
    e.target.reset();
  };

  // Ajouter les écouteurs d'événements pour les boutons modifier
  document.querySelectorAll('.edit-client').forEach(button => {
    button.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      await afficherFormulaireModificationClient(id, clients);
    });
  });

  // Ajouter les écouteurs d'événements pour les boutons supprimer
  document.querySelectorAll('.delete-client').forEach(button => {
    button.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        await deleteClient(id);
        await renderClientForm(); // Rafraîchir l'affichage après suppression
      }
    });
  });
};

// Fonction pour afficher le formulaire de modification d'un client
export async function afficherFormulaireModificationClient(id, clients) {
  // Trouver le client à modifier
  const client = clients.find(c => c._id === id);
  
  if (!client) {
    alert("Client non trouvé.");
    return;
  }
  
  // Afficher le formulaire de modification
  const container = document.getElementById('dashboard-sections');
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Modifier le Client</h2>
      <form id="updateClientForm">
        <input type="hidden" name="id" value="${id}" />
        <div class="field">
          <label class="label">Nom complet</label>
          <input class="input" name="nom" value="${client.nom}" required />
        </div>
        <div class="field">
          <label class="label">Email</label>
          <input class="input" name="email" type="email" value="${client.email}" required />
        </div>
        <div class="field">
          <label class="label">Téléphone</label>
          <input class="input" name="tel" value="${client.tel || ''}" />
        </div>
        <div class="buttons">
          <button class="button is-warning" type="submit">Mettre à jour</button>
          <button class="button" type="button" id="cancelUpdate">Annuler</button>
        </div>
      </form>
    </div>
  `;

  // Gestion du formulaire de mise à jour
  document.getElementById('updateClientForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const clientId = data.id;
    delete data.id; // Retirer l'ID des données à envoyer
    
    await updateClient(clientId, data);
    await renderClientForm(); // Rafraîchir l'affichage après mise à jour
  };

  // Gestion du bouton d'annulation
  document.getElementById('cancelUpdate').addEventListener('click', () => {
    renderClientForm();
  });
}

// Les fonctions fetch (existantes)
export async function getClients() {
  try {
    const response = await fetch('/client', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Clients récupérés:", data);
      return data;
    } else {
      console.error("Erreur lors de la récupération des clients:", response.statusText);
      alert("Erreur lors de la récupération des clients. Veuillez réessayer.");
      return [];
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
    return [];
  }
}

export async function postClient(client) {
  try {
    const response = await fetch('/register/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Client ajouté:", data);
      alert("Client ajouté avec succès.");
      return data;
    } else {
      console.error("Erreur lors de l'ajout du client:", response.statusText);
      alert("Erreur lors de l'ajout du client. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
  }
}

export async function deleteClient(id) {
  try {
    const response = await fetch(`/client/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Client supprimé:", data);
      alert("Client supprimé avec succès.");
      return data;
    } else {
      console.error("Erreur lors de la suppression du client:", response.statusText);
      alert("Erreur lors de la suppression du client. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
  }
}

export async function updateClient(id, client) {
  try {
    const response = await fetch(`/client/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Client mis à jour:", data);
      alert("Client mis à jour avec succès.");
      return data;
    } else {
      console.error("Erreur lors de la mise à jour du client:", response.statusText);
      alert("Erreur lors de la mise à jour du client. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
  }
}