export const renderDocumentUploader = () => {
    const container = document.getElementById('dashboard-sections')
    const documents = JSON.parse(localStorage.getItem('legalconnect_documents') || '[]')
  
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Envoyer un Document</h2>
        <form id="uploadForm">
          <div class="field">
            <label class="label">Titre</label>
            <input class="input" name="titre" required />
          </div>
          <div class="field">
            <label class="label">Fichier</label>
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
    `
  
    const form = document.getElementById('uploadForm')
    form.onsubmit = async (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      const file = formData.get('fichier')
  
      const reader = new FileReader()
      reader.onload = () => {
        const contenu = reader.result
        const doc = {
          titre: formData.get('titre'),
          nomFichier: file.name,
          contenu,
          date: new Date().toISOString().split('T')[0],
          client: formData.get('client')
        }
  
        const docs = JSON.parse(localStorage.getItem('legalconnect_documents') || '[]')
        docs.push(doc)
        localStorage.setItem('legalconnect_documents', JSON.stringify(docs))
  
        alert('📄 Document envoyé avec succès.')
        renderDocumentUploader()
      }
  
      reader.readAsDataURL(file)
    }
  }
  