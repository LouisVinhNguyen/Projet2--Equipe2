export const renderClientForm = () => {
  const container = document.getElementById('dashboard-sections')
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Ajouter un Client</h2>
      <form id="clientForm">
        <div class="field">
          <label class="label">Prénom</label>
          <input class="input" name="prenom" required placeholder="Prénom" />
        </div>
        <div class="field">
          <label class="label">Nom</label>
          <input class="input" name="nom" required placeholder="Nom" />
        </div>
        <div class="field">
          <label class="label">Email</label>
          <input class="input" name="email" type="email" required />
        </div>
        <div class="field">
          <label class="label">Téléphone</label>
          <input class="input" name="tel" placeholder="Téléphone" />
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

  // Function to fetch and display clients from /client
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

  // Event listener for form submission to create a client
  document.getElementById('clientForm').onsubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const prenom = formData.get('prenom').trim()
    const nom = formData.get('nom').trim()
    const email = formData.get('email').trim()
    const telephone = formData.get('tel').trim()
    // Using a default password; replace as needed
    const password = "Client123"

    try {
      const response = await fetch("/register/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prenom, nom, email, telephone, password })
      })
      
      if (response.ok) {  
        e.target.reset()
        fetchClientsList()
      } else {
        const result = await response.json()
        alert(result.message || "Erreur lors de l'ajout du client.")
      }
    } catch (error) {
      console.error(error)
      alert("Erreur réseau lors de l'ajout du client.")
    }
  }

  fetchClientsList()
}