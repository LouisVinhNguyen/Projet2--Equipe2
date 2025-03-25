import { initSidebar } from './sidebar.js'
import { renderAgenda } from './agenda.js'
import { renderRappels } from './rappels.js'
import { renderDossiers } from './dossiers.js'
import { renderPaiements } from './paiements.js'
import { renderDocumentUploader } from './documents.js'

document.addEventListener('DOMContentLoaded', () => {
  initSidebar({
    onSectionChange: (key) => {
      if (key === 'agenda') renderAgenda()
      if (key === 'rappels') renderRappels()
      if (key === 'dossiers') renderDossiers()
      if (key === 'paiements') renderPaiements()
      if (key === 'documents') renderDocumentUploader()
    }
  })
})
