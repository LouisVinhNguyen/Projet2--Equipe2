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
    </div>
  `

 document.getElementById('clientForm').onsubmit = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    addClient(data)
    alert('Client ajouté !')
    e.target.reset()
  }


}





// Les fetches

async function getClients() {
  try {
    const response = await fetch('/client', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()
      console.log("Clients récupérés:", data)
      return data
    } else {
      console.error("Erreur lors de la récupération des clients:", response.statusText)
      alert("Erreur lors de la récupération des clients. Veuillez réessayer.")
    }
  } catch (error) {
    console.error("Erreur réseau:", error)
    alert("Une erreur réseau s'est produite. Veuillez réessayer.")
  }
}

async function postClient(client) {
  try {
    const response = await fetch('/register/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("Client ajouté:", data)
      alert("Client ajouté avec succès.")
    } else {
      console.error("Erreur lors de l'ajout du client:", response.statusText)
      alert("Erreur lors de l'ajout du client. Veuillez réessayer.")
    }
  } catch (error) {
    console.error("Erreur réseau:", error)
    alert("Une erreur réseau s'est produite. Veuillez réessayer.")
  }
}

async function deleteClient(id) {
  try {
    const response = await fetch(`/client/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()
      console.log("Client supprimé:", data)
      alert("Client supprimé avec succès.")
    } else {
      console.error("Erreur lors de la suppression du client:", response.statusText)
      alert("Erreur lors de la suppression du client. Veuillez réessayer.")
    }
  } catch (error) {
    console.error("Erreur réseau:", error)
    alert("Une erreur réseau s'est produite. Veuillez réessayer.")
  }
}


async function updateClient(id, client) {
  try {
    const response = await fetch(`/client/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("Client mis à jour:", data)
      alert("Client mis à jour avec succès.")
    } else {
      console.error("Erreur lors de la mise à jour du client:", response.statusText)
      alert("Erreur lors de la mise à jour du client. Veuillez réessayer.")
    }
  } catch (error) {
    console.error("Erreur réseau:", error)
    alert("Une erreur réseau s'est produite. Veuillez réessayer.")
  }
}