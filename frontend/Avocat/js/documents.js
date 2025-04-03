export const renderReceivedDocuments = () => {
  const container = document.getElementById('dashboard-sections')

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Ajouter un Document</h2>
      <form id="documentForm">
        <div class="field">
          <label class="label">Nom du document</label>
          <input class="input" name="documentNom" required placeholder="Nom du document" />
        </div>
        <div class="field">
          <label class="label">Description</label>
          <textarea class="textarea" name="description" required placeholder="Description"></textarea>
        </div>
        <div class="field">
          <label class="label">Fichier (URL)</label>
          <input class="input" name="fichier" required placeholder="Lien du fichier" />
        </div>
        <div class="field">
          <label class="label">Dossier ID (optionnel)</label>
          <input class="input" name="dossierID" placeholder="Dossier ID" />
        </div>
        <button class="button is-success" type="submit">Ajouter</button>
      </form>
      <hr />
      <h3 class="title is-5">Liste des Documents</h3>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Avocat ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Fichier</th>
            <th>Date Création</th>
          </tr>
        </thead>
        <tbody id="documentTableBody">
          <!-- Les documents seront insérés ici -->
        </tbody>
      </table>
    </div>
  `
  
  const fetchDocumentsList = async () => {
    try {
      const storedToken = sessionStorage.getItem('token')
      if (!storedToken) {
        alert('Vous devez être connecté pour voir les documents.')
        return
      }
      const response = await fetch('/document', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      })
  
      if (response.ok) {
        const documents = await response.json()
        const tableBody = document.getElementById('documentTableBody')
        tableBody.innerHTML = documents.map(doc => `
          <tr>
            <td>${doc.documentID}</td>
            <td>${doc.avocatID}</td>
            <td>${doc.documentNom}</td>
            <td>${doc.description}</td>
            <td>${doc.fichier}</td>
            <td>${new Date(doc.dateCreated).toLocaleDateString()}</td>
          </tr>
        `).join('')
      } else {
        console.error('Erreur lors de la récupération des documents:', response.statusText)
        alert("Erreur lors de la récupération des documents. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Erreur réseau:", error)
      alert("Une erreur réseau s'est produite. Veuillez réessayer.")
    }
  }
  
  document.getElementById('documentForm').onsubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const documentNom = formData.get('documentNom').trim()
    const description = formData.get('description').trim()
    const fichier = formData.get('fichier').trim()
    let dossierID = formData.get('dossierID').trim()
    dossierID = dossierID === "" ? null : dossierID
    // For demonstration purposes, we assume the avocatID is 1.
    const avocatID = 1
  
    try {
      const storedToken = sessionStorage.getItem('token')
      const response = await fetch('/document', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${storedToken}`
        },
        body: JSON.stringify({ avocatID, documentNom, description, fichier, dossierID })
      })
  
      if (response.ok) {
        e.target.reset()
        fetchDocumentsList()
      } else {
        const result = await response.json()
        alert(result.message || "Erreur lors de l'ajout du document.")
      }
    } catch (error) {
      console.error(error)
      alert("Erreur réseau lors de l'ajout du document.")
    }
  }
  
  fetchDocumentsList()
}