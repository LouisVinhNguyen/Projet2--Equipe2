export const renderDetailsPaiement = async (facture) => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté.");
    window.location.href = "../index.html";
    return;
  }

  const container = document.getElementById("dashboard-sections");

  let deadline = "-";
  let dateAffichee = "-";

  if (facture.dateCreated) {
    const dateCreation = new Date(facture.dateCreated);
    if (!isNaN(dateCreation)) {
      const deadlineDate = new Date(dateCreation);
      deadlineDate.setDate(deadlineDate.getDate() + 5);
      deadline = deadlineDate.toISOString().split("T")[0];
      dateAffichee = dateCreation.toISOString().split("T")[0];
    }
  }

  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails de la Facture</h2>
      <table class="table is-fullwidth is-striped">
        <tr><th>Client</th><td>${facture.clientPrenom || ""} ${
    facture.clientNom || ""
  }</td></tr>
        <tr><th>Montant</th><td>$${Number(facture.montant).toFixed(2)}</td></tr>
        <tr><th>Date</th><td>${dateAffichee}</td></tr>
        <tr><th>Date limite de paiement</th><td>${deadline}</td></tr>
      </table>

      ${
        facture.status === "Payée"
          ? `<div class="mt-4">
               <button class="button is-primary" id="downloadPdfBtn">Télécharger la facture PDF</button>
               <button class="button is-light" id="btnRetourpayee">Retour</button>
             </div>`
          : `<h3 class="title is-5">Paiement</h3>
             <div class="buttons mb-4">
               <button class="button is-warning" id="btnPartiel">Paiement partiel</button>
               <button class="button is-success" id="btnComplet">Paiement complet</button>
               <button class="button is-light" id="btnRetour">Retour</button>
             </div>
             <form id="fauxPaiementForm">
               <div class="field">
                 <label class="label">Numéro de carte</label>
                 <input class="input" name="card" placeholder="1234 5678 9012 3456" required>
               </div>
               <div class="field is-grouped">
                 <div class="control is-expanded">
                   <label class="label">Date d'expiration</label>
                   <input class="input" name="expiry" placeholder="MM/AA" required>
                 </div>
                 <div class="control">
                   <label class="label">CVV</label>
                   <input class="input" name="cvv" placeholder="123" required>
                 </div>
               </div>
               <div class="field">
                 <label class="label">Nom du titulaire</label>
                 <input class="input" name="holder" placeholder="Jean Dupont" required>
               </div>
               <div class="field" id="fieldMontantPartiel" style="display:none;">
                 <label class="label">Montant à payer</label>
                 <input class="input" name="montantPartiel" placeholder="Montant partiel en $" type="number" min="1" max="${facture.montant}">
               </div>
               <input type="hidden" name="modePaiement" id="modePaiement" value="">
               <button class="button is-primary mt-2" type="submit">Confirmer le paiement</button>
             </form>`
      }
    </div>
  `;

  if (facture.status === "Payée") {
    // 🎯 Important : d'abord retour, ensuite PDF, avant le return
    document.getElementById("btnRetourpayee")?.addEventListener("click", () => {
      window.renderFactures && window.renderFactures();
    });

    document.getElementById("downloadPdfBtn")?.addEventListener("click", () => {
      fetch(`/facture/pdf/${facture.factureID}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Impossible de générer le PDF");
          return res.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `facture-${facture.factureID}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .catch((err) => alert("Erreur: " + err.message));
    });

    return; // ✅ sortir seulement après avoir attaché les events
  }

  const fieldMontant = document.getElementById("fieldMontantPartiel");
  const montantInput = document.querySelector("[name='montantPartiel']");
  const modePaiement = document.getElementById("modePaiement");

  document.getElementById("btnPartiel").addEventListener("click", () => {
    fieldMontant.style.display = "block";
    montantInput.setAttribute("required", "true");
    modePaiement.value = "partiel";
  });

  document.getElementById("btnComplet").addEventListener("click", () => {
    fieldMontant.style.display = "none";
    montantInput.removeAttribute("required");
    modePaiement.value = "complet";
  });

  document.getElementById("btnRetour")?.addEventListener("click", () => {
    window.renderFactures && window.renderFactures();
  });

  document.getElementById("fauxPaiementForm").onsubmit = async (e) => {
    e.preventDefault();

    const selectedMode = modePaiement.value;
    let montantPaye = Number(facture.montant);
    let statutFacture = "Payée";

    if (selectedMode === "partiel") {
      const montantPartiel = parseFloat(montantInput.value);
      if (
        isNaN(montantPartiel) ||
        montantPartiel <= 0 ||
        montantPartiel >= montantPaye
      ) {
        return alert("Montant invalide.");
      }
      montantPaye = montantPartiel;
      statutFacture = "Partiellement payée";
    }

    try {
      // Créer un paiement
      const res = await fetch(`/paiement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          factureID: facture.factureID,
          montant: montantPaye,
          paiementDate: new Date().toISOString(),
          methode: "Carte",
          status: "Terminé",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur lors du paiement.");
      }

      // Mettre à jour le statut de la facture
      await fetch(`/facture/status/${facture.factureID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: statutFacture,
        }),
      });

      alert(
        `Paiement enregistré avec succès ! Il reste $${(
          facture.montant - montantPaye
        ).toFixed(2)} à payer.`
      );

      const updatedRes = await fetch(`/facture/${facture.factureID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (updatedRes.ok) {
        const updatedFacture = await updatedRes.json();
        window.renderFactures && window.renderFactures();
        window.renderDetailsPaiement &&
          window.renderDetailsPaiement(updatedFacture);
      } else {
        window.renderFactures && window.renderFactures();
      }
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  };
};
