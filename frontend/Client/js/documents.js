const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");



export const renderDocumentUploader = async () => {
  const container = document.getElementById('dashboard-sections');
  
  // Récupérer les documents depuis l'API plutôt que localStorage
  let documents = [];
  try {
    documents = await getDocuments();
  } catch (error) {
    console.error("Erreur lors du chargement des documents:", error);
    documents = [];
  }

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Envoyer un Document</h2>
      <form id="uploadForm">
        <div class="field">
          <label class="label">Titre</label>
          <input class="input" name="titre" required />
        </div>
        <div class="field">
          <label class="label">Fichier (URL)</label>
          <input class="input" type="file" name="fichier" required />
        </div>
        <div class="field">
          <label class="label">Votre nom (client)</label>
          <input class="input" name="client" required />
        </div>
        <button class="button is-link mt-2">Envoyer</button>
      </form>

      <hr />
      <h3 class="subtitle is-5">Documents envoyés</h3>
      ${documents.length ? documents.map(doc => `
        <div class="box is-light">
          <strong>${doc.titre}</strong><br/>
          <small>Envoyé le ${doc.date}</small><br/>
          <small>${doc.nomFichier}</small>
        </div>
      `).join('') : '<p>Aucun document envoyé.</p>'}
    </div>
  `;

  let document = {
    titre: "Document 1",
    nomFichier: "doc1.pdf",
    contenu: "data:application/pdf;base64,abc123",
    date: "2021-09-15",
    client: "John Doe"
  };

  // Gestion du formulaire d'envoi
  const form = document.getElementById('uploadForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const file = formData.get('fichier');

    // Vérifier si un fichier a été sélectionné
    if (file.size > 0) {
      const reader = new FileReader();
      reader.onload = async () => {
        const contenu = reader.result;
        const doc = {
          titre: formData.get('titre'),
          nomFichier: file.name,
          contenu,
          date: new Date().toISOString().split('T')[0],
          client: formData.get('client')
        };

        await envoyerDocument(doc);
      };

      reader.readAsDataURL(file);
    } else {
      alert('Veuillez sélectionner un fichier.');
    }
  };
};

// Fonction pour récupérer tous les documents
export async function getDocuments() {
  try {
    const response = await fetch('/api/documents', {
      method: 'GET',
      headers: { 
        "Authorization": `Bearer ${token}` 
    },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Documents récupérés:", data);
      return data;
    } else {
      console.error("Erreur lors de la récupération des documents:", response.statusText);
      alert("Erreur lors de la récupération des documents. Veuillez réessayer.");
      return [];
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
    return [];
  }
}





// Fonction pour envoyer un document
export async function envoyerDocument(document) {
  try {
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 
        "Authorization": `Bearer ${token}` 
    },
      body: JSON.stringify(document),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Document ajouté:", data);
      alert("Document ajouté avec succès.");
      await renderDocumentUploader(); // Rafraîchir l'affichage
    } else {
      console.error("Erreur lors de l'ajout du document:", response.statusText);
      alert("Erreur lors de l'ajout du document. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Une erreur réseau s'est produite. Veuillez réessayer.");
  }
}