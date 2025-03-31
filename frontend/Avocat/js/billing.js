import { getClients } from './clientStorage.js'

const API_BASE_URL = '/api' // Replace with your actual API base URL
const FACTURES_ENDPOINT = `${API_BASE_URL}/factures`
const PAIEMENTS_ENDPOINT = `${API_BASE_URL}/paiements`

// State variables
let factures = []
let paiements = []

// Fetch data from API
const fetchData = async () => {
  try {
    const [facturesResponse, paiementsResponse] = await Promise.all([
      fetch(FACTURES_ENDPOINT),
      fetch(PAIEMENTS_ENDPOINT)
    ])
    
    if (!facturesResponse.ok || !paiementsResponse.ok) {
      throw new Error('Failed to fetch data')
    }
    
    factures = await facturesResponse.json()
    paiements = await paiementsResponse.json()
  } catch (error) {
    console.error('Error fetching data:', error)
    // Fallback to localStorage if API fails
    factures = JSON.parse(localStorage.getItem('legalconnect_factures') || '[]')
    paiements = JSON.parse(localStorage.getItem('legalconnect_paiements') || '[]')
  }
}

// Save data to API
const saveState = async () => {
  try {
    // Save to localStorage as backup
    localStorage.setItem('legalconnect_factures', JSON.stringify(factures))
    localStorage.setItem('legalconnect_paiements', JSON.stringify(paiements))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Add a facture via API
const addFacture = async (factureData) => {
  try {
    const response = await fetch(FACTURES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(factureData)
    })
    
    if (!response.ok) {
      throw new Error('Failed to add facture')
    }
    
    const newFacture = await response.json()
    factures.push(newFacture)
    return newFacture
  } catch (error) {
    console.error('Error adding facture:', error)
    // Fallback to local operation
    factures.push(factureData)
    saveState()
    return factureData
  }
}

// Add a paiement via API
const addPaiement = async (paiementData) => {
  try {
    const response = await fetch(PAIEMENTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paiementData)
    })
    
    if (!response.ok) {
      throw new Error('Failed to add paiement')
    }
    
    const newPaiement = await response.json()
    paiements.push(newPaiement)
    return newPaiement
  } catch (error) {
    console.error('Error adding paiement:', error)
    // Fallback to local operation
    paiements.push(paiementData)
    saveState()
    return paiementData
  }
}

const getClientOptions = () => {
  const clients = getClients()
  return clients.length
    ? clients.map(c => `<option value="${c.nom}">${c.nom}</option>`).join('')
    : '<option disabled selected>Aucun client disponible</option>'
}

const getFactureOptions = () => {
  return factures.length
    ? factures.map((f, i) => `<option value="${f.id || i}">#${f.id || i + 1} – ${f.client} – ${f.montant}€</option>`).join('')
    : '<option disabled selected>Aucune facture</option>'
}

const getFactureStatut = (factureId) => {
  const facture = factures.find(f => (f.id || factures.indexOf(f)) == factureId)
  if (!facture) return 'Inconnu'
  
  const totalPayé = paiements
    .filter(p => p.factureId == factureId || p.factureIndex == factureId)
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
      ${factures.map((f, i) => {
        const factureId = f.id || i
        return `
        <tr>
          <td>${f.client}</td>
          <td>${f.montant}</td>
          <td>${f.date}</td>
          <td><strong>${getFactureStatut(factureId)}</strong></td>
          <td><button class="button is-small is-info" onclick="generatePDF('${factureId}')">
            <i class="fas fa-file-pdf"></i>
          </button></td>
        </tr>
      `}).join('')}
    </tbody>
  </table>
  `
}

export const renderBillingSection = async () => {
  const container = document.getElementById('dashboard-sections')
  
  // Show loading state
  container.innerHTML = `
    <div class="box has-text-centered">
      <h2 class="title is-4">Facturation & Paiements</h2>
      <p>Chargement des données...</p>
    </div>
  `
  
  // Fetch data from API
  await fetchData()

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
                <select name="factureId" required>
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

  document.getElementById('factureForm').onsubmit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    await addFacture(data)
    renderBillingSection()
  }

  document.getElementById('paiementForm').onsubmit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    data.factureId = data.factureId
    await addPaiement(data)
    renderBillingSection()
  }
}

window.generatePDF = (factureId) => {
  const f = factures.find(f => (f.id || factures.indexOf(f)) == factureId)
  if (!f) return

  const totalPayé = paiements
    .filter(p => p.factureId == factureId || p.factureIndex == factureId)
    .reduce((sum, p) => sum + Number(p.montant), 0)
  const restant = f.montant - totalPayé

  const element = document.createElement('div')
  element.innerHTML = `
    <h1 style="text-align:center;">Facture #${f.id || parseInt(factureId) + 1}</h1>
    <p><strong>Client :</strong> ${f.client}</p>
    <p><strong>Date :</strong> ${f.date}</p>
    <p><strong>Montant :</strong> ${f.montant} €</p>
    <p><strong>Payé :</strong> ${totalPayé} €</p>
    <p><strong>Restant :</strong> ${restant} €</p>
    <p><strong>Statut :</strong> ${getFactureStatut(factureId)}</p>
  `
  html2pdf().from(element).save(`facture-${f.client}.pdf`)
}