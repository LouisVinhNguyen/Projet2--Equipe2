const contentMap = {
  agenda: { title: 'Agenda', description: 'Planifiez vos rendez-vous.' },
  rappels: { title: 'Rappels', description: 'Tâches et rappels importants.' },
  dossiers: { title: 'Gestion des Dossiers', description: '' },
  clients: { title: 'Gestion des Clients', description: '' },
  facturation: { title: 'Facturation & Paiements', description: '' },
  documents: { title: 'Documents Reçus', description: '' },
  taches: { title: 'Gestion des Tâches', description: '' },
  sessions: { title: 'Mes Sessions', description: '' },
  communication: { title: 'Communication', description: '' },
  profil: { title: 'Mon Profil', description: 'Gérez vos informations personnelles.' }
}

export const initSidebar = ({ onSectionChange }) => {
  const links = document.querySelectorAll('.menu-list a')
  const container = document.getElementById('dashboard-sections')

  const renderSection = (key) => {
    if (!contentMap[key]) return; // Ignore unknown keys
    const { title, description } = contentMap[key]
    container.innerHTML = description ? `
      <div class="box">
        <h2 class="title is-4">${title}</h2>
        <p>${description}</p>
      </div>
    ` : ''
    if (onSectionChange) onSectionChange(key)
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const sectionKey = link.dataset.section
      renderSection(sectionKey)

      links.forEach(l => l.classList.remove('is-active'))
      link.classList.add('is-active')
    })
  })

  renderSection('agenda')
}
