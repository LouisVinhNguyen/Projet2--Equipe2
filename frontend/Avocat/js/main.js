import { initSidebar } from "./sidebar.js";
import { renderDossierForm } from "./dossierForm.js";
import { renderClientForm } from "./clientForm.js";
import { renderEventSection } from "./eventManager.js";
import { renderReceivedDocuments } from "./documents.js";
import { renderBillingSection } from './billing.js'
import { renderDetailsDossier } from './detailsDossier.js';
import { renderDetailsDocument } from './detailsDocument.js';
import { renderTacheForm } from "./tache.js";
import { renderDetailsTache } from "./detailsTache.js";
import { renderSessionList } from "./session.js";
import { renderDetailsSession } from "./detailsSession.js";
import { renderCommunicationForm } from './communication.js';

const token = sessionStorage.getItem('token');
if (!token) {
  alert('Vous devez être connecté pour accéder à cette page.');
  window.location.href = "../index.html";
  return;
}

let dexo = document.getElementById("deconnexion");
dexo.addEventListener("click", function () {
  sessionStorage.removeItem("token");
  window.location.href = "../index.html";
});

document.addEventListener("DOMContentLoaded", () => {
  initSidebar({
    onSectionChange: (key) => {
      if (key === "dossiers") renderDossierForm();
      if (key === "clients") renderClientForm();
      if (["agenda", "rappels", "planification"].includes(key))
        renderEventSection(key);
      if (key === 'facturation') renderBillingSection()
      if (key === "documents") renderReceivedDocuments();
      if (key === "taches") renderTacheForm();
      if (key === "sessions") renderSessionList();
      if (key === 'communication') renderCommunicationForm()
    },
  });
});

window.renderDetailsDossier = renderDetailsDossier;
window.renderDetailsDocument = renderDetailsDocument;
window.renderDetailsTache = renderDetailsTache;
window.renderDetailsSession = renderDetailsSession;
window.renderSessionList = renderSessionList;
window.renderReceivedDocuments = renderReceivedDocuments;