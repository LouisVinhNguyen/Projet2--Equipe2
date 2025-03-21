const contentMap = {
    agenda: {
      title: 'Agenda',
      description: 'Gérez votre emploi du temps et vos événements à venir.'
    },
    rappels: {
      title: 'Rappels',
      description: 'Restez informé des délais et rendez-vous importants.'
    },
    planification: {
      title: 'Planification',
      description: 'Organisez vos tâches juridiques et vos réunions à venir.'
    },
    facturation: {
      title: 'Facturation & Paiements',
      description: 'Consultez vos factures, suivez vos paiements et gérez vos finances.'
    },
    dossiers: {
      title: 'Gestion des Dossiers',
      description: 'Accédez et suivez vos dossiers juridiques en un seul endroit.'
    }
  }
  
  const renderSection = (key) => {
    const { title, description } = contentMap[key]
    const container = document.getElementById('dashboard-sections')
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">${title}</h2>
        <p>${description}</p>
      </div>
    `
  }
  
  export const initSidebar = () => {
    const links = document.querySelectorAll('.menu-list a')
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault()
        const sectionKey = link.dataset.section
        renderSection(sectionKey)
  
        // UI feedback (active link)
        links.forEach(l => l.classList.remove('is-active'))
        link.classList.add('is-active')
      })
    })
  
    // Render default section
    renderSection('agenda')
  }
  