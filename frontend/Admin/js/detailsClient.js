// Vue détaillée d'un client pour la section Admin
import { renderClientForm } from './clientForm.js';

export async function renderDetailsClient(clientID) {
  const container = document.getElementById('dashboard-sections');
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté.');
    window.location.href = '../index.html';
    return;
  }

  // Affichage initial
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails du client</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsTableBody"></tbody>
      </table>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
        <button class="button is-link" id="backButton">Retour</button>
        <div id="actionButtons">
          <button class="button is-warning" id="editButton">Modifier</button>
          <button class="button is-danger" id="deleteButton">Supprimer</button>
        </div>
      </div>
    </div>
  `;

  // Charger les détails du client
  let clientData = null;
  try {
    const response = await fetch(`/client/${clientID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      clientData = await response.json();
      const tableBody = document.getElementById('detailsTableBody');
      tableBody.innerHTML = Object.entries(clientData)
        .map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`)
        .join('');
    } else {
      alert('Erreur lors de la récupération des détails du client.');
    }
  } catch (error) {
    alert('Erreur réseau.');
  }

  // Retour
  document.getElementById('backButton').addEventListener('click', () => {
    renderClientForm();
  });

  // Supprimer le client
  document.getElementById('deleteButton').addEventListener('click', async () => {
    if (!confirm('Voulez-vous vraiment supprimer ce client ?')) return;
    try {
      const response = await fetch(`/client/${clientID}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert('Client supprimé avec succès.');
        renderClientForm();
      } else {
        alert('Erreur lors de la suppression du client.');
      }
    } catch (error) {
      alert('Erreur réseau lors de la suppression.');
    }
  });

  // Modifier le client
  document.getElementById('editButton').addEventListener('click', () => {
    const tableBody = document.getElementById('detailsTableBody');
    tableBody.innerHTML = Object.entries(clientData)
      .map(([key, value]) => {
        if (["userID", "role", "dateCreated"].includes(key)) {
          return `<tr><th>${key}</th><td>${value}</td></tr>`;
        } else {
          return `<tr><th>${key}</th><td><input class='input' name='${key}' value='${value ?? ''}' /></td></tr>`;
        }
      })
      .join('');
    // Remplace le bouton Modifier par Enregistrer
    const actionButtons = document.getElementById('actionButtons');
    const editBtn = document.getElementById('editButton');
    const saveBtn = document.createElement('button');
    saveBtn.className = 'button is-success';
    saveBtn.id = 'saveButton';
    saveBtn.textContent = 'Enregistrer';
    actionButtons.replaceChild(saveBtn, editBtn);
    saveBtn.addEventListener('click', async () => {
      const newData = { ...clientData };
      tableBody.querySelectorAll('input').forEach(input => {
        newData[input.name] = input.value;
      });
      newData.userID = clientData.userID;
      newData.role = clientData.role;
      try {
        const response = await fetch(`/client/${clientID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newData),
        });
        if (response.ok) {
          alert('Client modifié avec succès.');
          renderDetailsClient(clientID);
        } else {
          alert('Erreur lors de la modification du client.');
        }
      } catch (error) {
        alert('Erreur réseau lors de la modification.');
      }
    });
  });
}
