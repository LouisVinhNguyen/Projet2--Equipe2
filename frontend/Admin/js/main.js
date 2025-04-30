import { initSidebar } from "./sidebar.js";
import { renderDossierForm } from "./dossierForm.js";
import { renderClientForm } from "./clientForm.js";
import { renderEventSection } from "./eventManager.js";
import { renderReceivedDocuments } from "./documents.js";
import { renderBillingSection } from "./billing.js";
import { renderDetailsDossier } from "./detailsDossier.js";
import { renderDetailsDocument } from "./detailsDocument.js";
import { renderAllSessions } from "./session.js";

if (!sessionStorage.getItem("token")) {
  alert("Vous devez être connecté pour accéder à cette page.");
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
      if (key === "dossiers") renderDossierForm();
      if (key === "clients") renderClientForm();
      if (["agenda", "rappels", "planification"].includes(key))
        renderEventSection(key);
      if (key === "facturation") renderBillingSection();
      if (key === "documents") renderReceivedDocuments();
      if (key === "sessions") renderAllSessions();
    },
  });
});

window.renderDetailsDossier = renderDetailsDossier;
window.renderDetailsDocument = renderDetailsDocument;
window.renderDetailsClient = (
  await import("./detailsClient.js")
).renderDetailsClient;
