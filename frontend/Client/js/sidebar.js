const contentMap = {
  agenda: 'Agenda',
  rappels: 'Rappels',
  dossiers: 'Mes Dossiers',
  paiements: 'Paiements',
  documents: 'Mes Documents',
  communication: 'Communication'
}

export const initSidebar = ({ onSectionChange }) => {
  const links = document.querySelectorAll('.menu-list a')
  const container = document.getElementById('dashboard-sections')

  const renderDefault = (key) => {
    container.innerHTML = `<div class="box"><h2 class="title is-4">${contentMap[key]}</h2></div>`
    if (onSectionChange) onSectionChange(key)
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const key = link.dataset.section
      renderDefault(key)
      links.forEach(l => l.classList.remove('is-active'))
      link.classList.add('is-active')
    })
  })

  renderDefault('agenda')
}
