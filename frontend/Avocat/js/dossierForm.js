export const renderDossierForm = () => {
    const container = document.getElementById('dashboard-sections')
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Créer un Dossier</h2>
        <form id="dossierForm">
          <div class="field">
            <label class="label">Nom du dossier</label>
            <input class="input" name="nom" required />
          </div>
          <div class="field">
            <label class="label">Client concerné</label>
            <input class="input" name="client" required />
          </div>
          <div class="field">
            <label class="label">Description</label>
            <textarea class="textarea" name="description"></textarea>
          </div>
          <button class="button is-primary" type="submit">Créer</button>
        </form>
      </div>
    `
  
    document.getElementById('dossierForm').onsubmit = (e) => {
      e.preventDefault()
      const data = Object.fromEntries(new FormData(e.target))
      console.log('📁 Dossier créé :', data)
      alert('Dossier créé !')
      e.target.reset()
    }
  }
  