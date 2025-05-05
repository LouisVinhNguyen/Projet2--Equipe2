import { initSidebar } from "./sidebar.js";
import { renderDossier } from "./dossier.js";
import { renderClient } from "./client.js";
import { renderEventSection } from "./eventManager.js";
import { renderDocument } from "./document.js";
import { renderFacture } from './facture.js';
import { renderDetailsDossier } from './detailsDossier.js';
import { renderDetailsDocument } from './detailsDocument.js';
import { renderTache } from "./tache.js";
import { renderDetailsTache } from "./detailsTache.js";
import { renderSession } from "./session.js";
import { renderDetailsSession } from "./detailsSession.js";
import { renderCommunicationForm } from './communication.js';
import { renderDetailsFacture } from "./detailsFacture.js";

const token = sessionStorage.getItem('token');
if (!token) {
  alert('Vous devez être connecté pour accéder à cette page.');
  window.location.href = "../index.html";
}

let dexo = document.getElementById("deconnexion");
dexo.addEventListener("click", function () {
  sessionStorage.removeItem("token");
  window.location.href = "../index.html";
});

document.addEventListener("DOMContentLoaded", () => {
  initSidebar({
    onSectionChange: (key) => {
      if (key === "dossiers") renderDossier();
      if (key === "clients") renderClient();
      if (["agenda", "rappels", "planification"].includes(key))
        renderEventSection(key);
      if (key === 'facturation') renderFacture();
      if (key === "documents") renderDocument();
      if (key === "taches") renderTache();
      if (key === "sessions") renderSession();
      if (key === 'communication') renderCommunicationForm();
    }
  });
});

window.renderDetailsDossier = renderDetailsDossier;
window.renderDetailsDocument = renderDetailsDocument;
window.renderDetailsTache = renderDetailsTache;
window.renderDetailsSession = renderDetailsSession;
window.renderDocument = renderDocument;
window.renderSession = renderSession;
window.renderDetailsFacture = renderDetailsFacture;