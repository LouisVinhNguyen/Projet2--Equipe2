export const renderDetailsPaiement = async (paiementID) => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté.");
    window.location.href = "../index.html";
    return;
  }

  const container = document.getElementById("dashboard-sections");
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Détails du paiement</h2>
      <table class="table is-fullwidth is-striped">
        <tbody id="detailsPaiementTableBody"></tbody>
      </table>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
        <button class="button is-link" id="backButton">Retour</button>
        <div id="actionButtons">
          <button class="button is-warning" id="editButton">Modifier</button>
          <button class="button is-danger" id="deleteButton">Supprimer</button>
        </div>
      </div>
    </div>
  `;

  // Charger les détails du paiement
  let paiementData = null;
  try {
    const response = await fetch(`/paiement/${paiementID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      paiementData = await response.json();
      const tableBody = document.getElementById("detailsPaiementTableBody");
      tableBody.innerHTML = Object.entries(paiementData)
        .map(([key, value]) => {
          if (key.includes("date")) {
            return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}</td></tr>`;
          } else {
            return `<tr><th>${key}</th><td>${value ?? "-"}</td></tr>`;
          }
        })
        .join("");
    } else {
      console.error("Erreur lors de la récupération des détails du paiement:", response.statusText);
      alert("Erreur lors de la récupération des détails du paiement.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du paiement:", error);
    alert("Erreur réseau.");
  }

  // Retour
  document.getElementById("backButton").addEventListener("click", () => {
    window.renderPaiementList && window.renderPaiementList();
  });

  // Supprimer le paiement
  document.getElementById("deleteButton").addEventListener("click", async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce paiement ?")) return;
    try {
      const response = await fetch(`/paiement/${paiementID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Paiement supprimé avec succès.");
        window.renderPaiementList && window.renderPaiementList();
      } else {
        console.error("Erreur lors de la suppression du paiement:", response.statusText);
        alert("Erreur lors de la suppression du paiement.");
      }
    } catch (error) {
      console.error("Erreur réseau lors de la suppression du paiement:", error);
      alert("Erreur réseau lors de la suppression.");
    }
  });

  // Modifier le paiement
  document.getElementById("editButton").addEventListener("click", () => {
    const tableBody = document.getElementById("detailsPaiementTableBody");
    tableBody.innerHTML = Object.entries(paiementData)
      .map(([key, value]) => {
        if (["paiementID", "factureID"].includes(key)) {
          return `<tr><th>${key}</th><td>${value}</td></tr>`;
        } else if (key === "status") {
          return `<tr><th>${key}</th><td><select class='input' name='status'>
            <option value="En attente"${value === "En attente" ? " selected" : ""}>En attente</option>
            <option value="Terminé"${value === "Terminé" ? " selected" : ""}>Terminé</option>
            <option value="Échoué"${value === "Échoué" ? " selected" : ""}>Échoué</option>
            <option value="Remboursé"${value === "Remboursé" ? " selected" : ""}>Remboursé</option>
            <option value="Annulé"${value === "Annulé" ? " selected" : ""}>Annulé</option>
          </select></td></tr>`;
        } else if (key === "paiementDate") {
          // For date, use input type datetime-local
          const localValue = value ? new Date(value).toISOString().slice(0, 16) : '';
          return `<tr><th>${key}</th><td><input class='input' name='${key}' type='datetime-local' value='${localValue}' /></td></tr>`;
        } else if (typeof value === "number") {
          return `<tr><th>${key}</th><td><input class='input' name='${key}' type='number' value='${value}' /></td></tr>`;
        } else {
          return `<tr><th>${key}</th><td><input class='input' name='${key}' value='${value ?? ''}' /></td></tr>`;
        }
      })
      .join("");
    // Remplace le bouton Modifier par Enregistrer au même endroit
    const actionButtons = document.getElementById("actionButtons");
    const editBtn = document.getElementById("editButton");
    const saveBtn = document.createElement("button");
    saveBtn.className = "button is-success";
    saveBtn.id = "saveButton";
    saveBtn.textContent = "Enregistrer";
    actionButtons.replaceChild(saveBtn, editBtn);
    saveBtn.addEventListener("click", async () => {
      const newData = { ...paiementData };
      tableBody.querySelectorAll("input,select").forEach((input) => {
        newData[input.name] = input.value;
      });
      try {
        const response = await fetch(`/paiement/status/${paiementID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newData.status }),
        });
        if (response.ok) {
          alert("Paiement modifié avec succès.");
          renderDetailsPaiement(paiementID);
        } else {
          const err = await response.json();
          console.error("Erreur lors de la modification du paiement:", err.error || err.message);
          alert(err.error || err.message || "Erreur lors de la modification du paiement.");
        }
      } catch (error) {
        console.error("Erreur réseau lors de la modification du paiement:", error);
        alert("Erreur réseau lors de la modification.");
      }
    });
  });
};
