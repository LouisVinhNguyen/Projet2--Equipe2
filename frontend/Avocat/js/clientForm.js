export const renderClientForm = () => {

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour accéder à cette page.');
    window.location.href = "../index.html";
    return;
  }

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const avocatUserID = tokenPayload.userID;

  const container = document.getElementById('dashboard-sections')
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Liste des Clients</h2>
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
  // Function to fetch and display clients associated with the logged-in avocat
  const fetchClientsList = async () => {
    try {
      // Fetch clients for this avocat
      const response = await fetch(`/client/avocat/${avocatUserID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const clients = await response.json()
        const tableBody = document.getElementById('clientTableBody')
        tableBody.innerHTML = clients.map(client => `
          <tr>
            <td>${client.userID}</td>
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