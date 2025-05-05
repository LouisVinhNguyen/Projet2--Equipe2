import { initSidebar } from "./sidebar.js";
import { renderDossier } from "./dossier.js";
import { renderClient } from "./client.js";
import { renderEventSection } from "./eventManager.js";
import { renderDocument } from "./document.js";
import { renderFacture } from "./facture.js";
import { renderDetailsDossier } from "./detailsDossier.js";
import { renderDetailsDocument } from "./detailsDocument.js";
import { renderSession } from "./session.js";
import { renderDetailsSession } from "./detailsSession.js";
import { renderDetailsFacture } from "./detailsFacture.js";

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
      if (key === "dossiers") renderDossier();
      if (key === "clients") renderClient();
      if (["agenda", "rappels", "planification"].includes(key))
        renderEventSection(key);
      if (key === "facturation") renderFacture();
      if (key === "documents") renderDocument();
      if (key === "sessions") renderSession();
    },
  });
});

window.renderDetailsDossier = renderDetailsDossier;
window.renderDetailsDocument = renderDetailsDocument;
window.renderDetailsSession = renderDetailsSession;
window.renderDocument = renderDocument;
window.renderSession = renderSession;
window.renderDetailsClient = (
  await import("./detailsClient.js")
).renderDetailsClient;
window.renderDetailsFacture = renderDetailsFacture;
