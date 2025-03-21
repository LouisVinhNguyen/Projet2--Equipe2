import { addClient } from './clientStorage.js'

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
