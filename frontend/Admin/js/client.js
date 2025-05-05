export const renderClient = async () => {
  const container = document.getElementById('dashboard-sections')
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Ajouter un Client</h2>
      <form id="clientForm">
        <div class="field">
          <label class="label">Prénom</label>
          <input class="input" id="client-prenom" name="prenom" required placeholder="Prénom" />
        </div>
        <div class="field">
          <label class="label">Nom</label>
          <input class="input" id="client-nom" name="nom" required placeholder="Nom" />
        </div>
        <div class="field">
          <label class="label">Email</label>
          <input class="input" id="client-email" name="email" type="email" required />
        </div>
        <div class="field">
          <label class="label">Téléphone</label>
          <input class="input" id="client-tel" name="tel" placeholder="Téléphone" />
        </div>
        <button class="button is-success" id="btn-ajouter-client" type="button">Ajouter</button>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="clientTableBody">
          <!-- Les clients seront insérés ici -->
        </tbody>
      </table>
    </div>
  `

  // Function to fetch and display clients from /api/client
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
            <td>${client.userID}</td>
            <td>${client.prenom}</td>
            <td>${client.nom}</td>
            <td>${client.email}</td>
            <td>${client.telephone}</td>
            <td><button class="button is-small is-info view-client" onclick="window.previousRender = window.renderClient; window.renderDetailsClient && window.renderDetailsClient('${client.userID}')">Voir</button></td>
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

  document.getElementById('btn-ajouter-client').addEventListener('click', function() {
    const prenom = document.getElementById('client-prenom').value.trim();
    const nom = document.getElementById('client-nom').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const telephone = document.getElementById('client-tel').value.trim();
    // Using a default password
    const password = "Client123";
    
    console.log("Client data:", { prenom, nom, email, telephone });
    
    // Validate that all fields are filled
    if (!prenom || !nom || !email || !telephone) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    
    // Get the token for authorization
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert("Vous devez être connecté pour ajouter un client.");
      return;
    }
    
    // First, check if email already exists for any user
    fetch(`/user/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.exists) {
        alert("Un utilisateur avec cet email existe déjà.");
        return;
      }
      
      // Email doesn't exist, proceed with registration
      const clientData = { 
        prenom, 
        nom, 
        email, 
        telephone, 
        password,
        role: "client"
      };
      
      // Send the data to the server
      return fetch('/auth/register/client', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clientData),
      });
    })
    .then(response => {
      // If we stopped at the email check (response will be undefined)
      if (!response) return;
      
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || "Erreur lors de l'ajout du client");
        });
      }
      return response.json();
    })
    .then(data => {
      // If we stopped at the email check (data will be undefined)
      if (!data) return;
      
      console.log("Client ajouté avec succès:", data);
      // Reset the form
      document.getElementById('clientForm').reset();
      // Refresh the client list
      fetchClientsList();
      alert("Client ajouté avec succès!");
    })
    .catch(error => {
      console.error("Erreur lors de l'ajout du client:", error.message);
      alert("Erreur lors de l'ajout du client: " + error.message);
    });
  });

  // Initial fetch of clients list
  fetchClientsList()
}