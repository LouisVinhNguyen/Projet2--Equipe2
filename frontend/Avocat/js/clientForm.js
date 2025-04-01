export const renderClientForm = () => {
  const container = document.getElementById('dashboard-sections')
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
      <h3 class="title is-5">Liste des Clients</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody id="clientTableBody">
          <!-- Les clients seront insérés ici -->
        </tbody>
      </table>
    </div>
  `

  // Fetch and display clients
  const fetchClientsList = async () => {
    try {
      const storedToken = sessionStorage.getItem('token')
      if (!storedToken) {
        alert('Vous devez être connecté pour voir les clients.')
        return
      }
      const response = await fetch('/client', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      })

      if (response.ok) {
        const clients = await response.json()
        const tableBody = document.getElementById('clientTableBody')
        tableBody.innerHTML = clients.map(client => `
          <tr>
            <td>${client.clientID}</td>
            <td>${client.prenom}</td>
            <td>${client.nom}</td>
            <td>${client.email}</td>
            <td>${client.telephone}</td>
          </tr>
        `).join('')
      } else {
        console.error('Erreur lors de la récupération des clients:', response.statusText)
        alert("Erreur lors de la récupération des clients. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Erreur réseau:", error)
      alert("Une erreur réseau s'est produite. Veuillez réessayer.")
    }
  }

  fetchClientsList()
}