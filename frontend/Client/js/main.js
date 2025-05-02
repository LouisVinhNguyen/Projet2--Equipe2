import { initSidebar } from './sidebar.js'
import { renderAgenda } from './agenda.js'
import { renderRappels } from './rappels.js'
import { renderDossiers } from './dossiers.js'
import { renderPaiements } from './paiements.js'
import { renderClientDocuments } from './documents.js'
import { renderCommunicationForm } from './communication.js';
import { renderDetailsDossier } from './detailsDossier.js';
import { renderDetailsDocument } from './detailsDocument.js';

if (!sessionStorage.getItem('token')) {
  alert("Vous devez être connecté pour accéder à cette page.");
  window.location.href = "../index.html";
}

let dexo = document.getElementById('deconnexion');
dexo.addEventListener('click', function(){
  sessionStorage.removeItem('token');
  window.location.href = "../index.html";
});

document.addEventListener('DOMContentLoaded', () => {
  initSidebar({
    onSectionChange: (key) => {
      if (key === 'agenda') renderAgenda()
      if (key === 'rappels') renderRappels()
      if (key === 'dossiers') renderDossiers()
      if (key === 'paiements') renderPaiements()
      if (key === 'documents') renderClientDocuments()
      if (key === 'communication') renderCommunicationForm()
    }
  })
})

window.renderDetailsDossier = renderDetailsDossier;
window.renderDossiers = renderDossiers;
window.renderDetailsDocument = renderDetailsDocument;
window.renderClientDocuments = renderClientDocuments;
