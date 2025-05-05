import { initSidebar } from "./sidebar.js";
import { renderAgenda } from "./agenda.js";
import { renderRappel } from "./rappel.js";
import { renderDossier } from "./dossier.js";
import { renderDocument } from "./document.js";
import { renderCommunicationForm } from "./communication.js";
import { renderDetailsDossier } from "./detailsDossier.js";
import { renderDetailsDocument } from "./detailsDocument.js";
import {
  renderFacture,
  afficherDetailsFacture,
  afficherPaiementFait,
  renderHistoriquePaiements,
} from "./facture.js";
import { renderDetailsPaiement } from "./detailsPaiement.js";

if (!sessionStorage.getItem("token")) {
  alert("Vous devez être connecté pour accéder à cette page.");
  window.location.href = "../index.html";
}

const dexo = document.getElementById("deconnexion");
dexo.addEventListener("click", () => {
  sessionStorage.removeItem("token");
  window.location.href = "../index.html";
});

document.addEventListener("DOMContentLoaded", () => {
  initSidebar({
    onSectionChange: (key) => {
      if (key === "agenda") renderAgenda();
      if (key === "rappels") renderRappel();
      if (key === "dossiers") renderDossier();
      if (key === "documents") renderDocument();
      if (key === "communication") renderCommunicationForm();
      if (key === "factures") renderFacture();
    },
  });
});

// Expose functions globally for navigation (e.g., "Voir" buttons)
window.renderDetailsDossier = renderDetailsDossier;
window.renderDossier = renderDossier;
window.renderDetailsDocument = renderDetailsDocument;
window.renderDocument = renderDocument;
window.renderFacture = renderFacture;
window.renderDetailsPaiement = renderDetailsPaiement;
window.afficherDetailsFacture = afficherDetailsFacture;
window.afficherPaiementFait = afficherPaiementFait;
window.renderHistoriquePaiements = renderHistoriquePaiements;
