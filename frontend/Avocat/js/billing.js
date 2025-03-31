import { getClients } from './clientStorage.js'

const FACTURES_KEY = 'legalconnect_factures'
const PAIEMENTS_KEY = 'legalconnect_paiements'

let factures = JSON.parse(localStorage.getItem(FACTURES_KEY) || '[]')
let paiements = JSON.parse(localStorage.getItem(PAIEMENTS_KEY) || '[]')

const saveState = () => {
  localStorage.setItem(FACTURES_KEY, JSON.stringify(factures))
  localStorage.setItem(PAIEMENTS_KEY, JSON.stringify(paiements))
}

const getClientOptions = () => {
  const clients = getClients()
  return clients.length
    ? clients.map(c => `<option value="${c.nom}">${c.nom}</option>`).join('')
    : '<option disabled selected>Aucun client disponible</option>'
}

const getFactureOptions = () => {
  return factures.length
    ? factures.map((f, i) => `<option value="${i}">#${i + 1} – ${f.client} – ${f.montant}€</option>`).join('')
    : '<option disabled selected>Aucune facture</option>'
}

const getFactureStatut = (factureIndex) => {
  const facture = factures[factureIndex]
  if (!facture) return 'Inconnu'
  const totalPayé = paiements
    .filter(p => p.factureIndex == factureIndex)
    .reduce((sum, p) => sum + Number(p.montant), 0)
  return totalPayé >= Number(facture.montant) ? 'Payée' : 'En attente'
}

const renderFacturesTable = () => {
  if (!factures.length) return '<p>Aucune facture générée.</p>'

  return `
  <table class="table is-fullwidth is-striped">
    <thead>
      <tr>
        <th>Client</th><th>Montant ($)</th><th>Date</th><th>Statut</th><th>PDF</th>
      </tr>
    </thead>
    <tbody>
      ${factures.map((f, i) => `
        <tr>
          <td>${f.client}</td>
          <td>${f.montant}</td>
          <td>${f.date}</td>
          <td><strong>${getFactureStatut(i)}</strong></td>
          <td><button class="button is-small is-info" onclick="generatePDF(${i})">
            <i class="fas fa-file-pdf"></i>
          </button></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  `
}

export const renderBillingSection = () => {
  const container = document.getElementById('dashboard-sections')

  const clients = getClients()
  if (!clients.length) {
    container.innerHTML = `
      <div class="box has-text-centered">
        <h2 class="title is-4">Facturation & Paiements</h2>
        <p>⚠️ Aucun client disponible. Ajoutez un client d'abord dans la section "Clients".</p>
      </div>
    `
    return
  }

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Facturation & Paiements</h2>

      <div class="columns">
        <div class="column">
          <h3 class="subtitle is-5">🧾 Générer une facture</h3>
          <form id="factureForm">
            <div class="field">
              <label class="label">Client</label>
              <div class="select is-fullwidth">
                <select name="client" required>
                  ${getClientOptions()}
                </select>
              </div>
            </div>
            <div class="field">
              <label class="label">Montant ($)</label>
              <input class="input" name="montant" type="number" required />
            </div>
            <div class="field">
              <label class="label">Date</label>
              <input class="input" name="date" type="date" required />
            </div>
            <button class="button is-primary mt-2">Créer Facture</button>
          </form>
        </div>

        <div class="column">
          <h3 class="subtitle is-5">💰 Enregistrer un paiement</h3>
          <form id="paiementForm">
            <div class="field">
              <label class="label">Facture</label>
              <div class="select is-fullwidth">
                <select name="factureIndex" required>
                  ${getFactureOptions()}
                </select>
              </div>
            </div>
            <div class="field">
              <label class="label">Montant ($)</label>
              <input class="input" name="montant" type="number" required />
            </div>
            <div class="field">
              <label class="label">Date</label>
              <input class="input" name="date" type="date" required />
            </div>
            <button class="button is-success mt-2">Enregistrer</button>
          </form>
        </div>
      </div>

      <hr />
      <h3 class="subtitle is-5">📋 Factures</h3>
      <div id="factureList">${renderFacturesTable()}</div>
    </div>
  `

  document.getElementById('factureForm').onsubmit = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    factures.push(data)
    saveState()
    renderBillingSection()
  }

  document.getElementById('paiementForm').onsubmit = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    paiements.push({ ...data, factureIndex: Number(data.factureIndex) })
    saveState()
    renderBillingSection()
  }
}

window.generatePDF = (index) => {
  const f = factures[index]
  const totalPayé = paiements
    .filter(p => p.factureIndex == index)
    .reduce((sum, p) => sum + Number(p.montant), 0)
  const restant = f.montant - totalPayé

  const element = document.createElement('div')
  element.innerHTML = `
    <h1 style="text-align:center;">Facture #${index + 1}</h1>
    <p><strong>Client :</strong> ${f.client}</p>
    <p><strong>Date :</strong> ${f.date}</p>
    <p><strong>Montant :</strong> ${f.montant} €</p>
    <p><strong>Payé :</strong> ${totalPayé} €</p>
    <p><strong>Restant :</strong> ${restant} €</p>
    <p><strong>Statut :</strong> ${getFactureStatut(index)}</p>
  `
  html2pdf().from(element).save(`facture-${f.client}.pdf`)
}
