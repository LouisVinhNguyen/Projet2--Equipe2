export const renderProfile = async () => {

    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page.');
      window.location.href = "../index.html";
      return;
    }
  
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.userID;

    const container = document.getElementById("dashboard-sections");
    container.innerHTML = `
        <div class="box">
            <h2 class="title is-4">Détails du profil</h2>
            <table class="table is-fullwidth is-striped">
                <tbody id="detailsProfileTableBody"></tbody>
            </table>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
                <div id="leftSideButtons">
                    <button class="button is-link" id="backButton">Retour</button>
                </div>
                <div id="actionButtons" style="display: flex; gap: 0.5rem;">
                    <button class="button is-warning" id="editButton">Modifier</button>
                    <button class="button is-danger" id="deleteAccountButton">Supprimer le compte</button>
                </div>
            </div>
        </div>
    `;
    let userData = null;
    try {
        const response = await fetch(`/user/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.ok) {
            userData = await response.json();
            const tableBody = document.getElementById("detailsProfileTableBody");
            tableBody.innerHTML = Object.entries(userData)
                .map(([key, value]) => {
                    if (key.toLowerCase().includes("date")) {
                        return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}</td></tr>`;
                    } else {
                        return `<tr><th>${key}</th><td>${value ?? "-"}</td></tr>`;
                    }
                })
                .join("");
        } else {
            console.error("Erreur lors de la récupération des détails du profil:", response.statusText);
            alert("Erreur lors de la récupération des détails du profil.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des détails du profil:", error);
        alert("Erreur réseau.");
    }
    document.getElementById("backButton").addEventListener("click", () => {
        window.location.reload();
    });
    document.getElementById("editButton").addEventListener("click", () => {
        const tableBody = document.getElementById("detailsProfileTableBody");
        tableBody.innerHTML = Object.entries(userData)
            .map(([key, value]) => {
                if (["userID", "role"].includes(key)) {
                    return `<tr><th>${key}</th><td>${value}</td></tr>`;
                } else if (key === "dateCreated") {
                    return `<tr><th>${key}</th><td>${value ? new Date(value).toLocaleString() : "-"}</td></tr>`;
                } else {
                    return `<tr><th>${key}</th><td><input class='input' name='${key}' value='${value ?? ''}' /></td></tr>`;
                }
            })
            .join("");
        const actionButtons = document.getElementById("actionButtons");
        const editBtn = document.getElementById("editButton");
        const saveBtn = document.createElement("button");
        saveBtn.className = "button is-success";
        saveBtn.id = "saveButton";
        saveBtn.textContent = "Enregistrer";
        actionButtons.replaceChild(saveBtn, editBtn);
        saveBtn.addEventListener("click", async () => {
            const newData = { ...userData };
            tableBody.querySelectorAll("input").forEach((input) => {
                newData[input.name] = input.value;
            });
            try {
                const response = await fetch(`/user/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newData),
                });
                if (response.ok) {
                    alert("Profil modifié avec succès.");
                    renderProfile();
                } else {
                    const err = await response.json();
                    console.error("Erreur lors de la modification du profil:", err.error || err.message);
                    alert(err.error || err.message || "Erreur lors de la modification du profil.");
                }
            } catch (error) {
                console.error("Erreur réseau lors de la modification du profil:", error);
                alert("Erreur réseau lors de la modification.");
            }
        });
    });
    document.getElementById("deleteAccountButton").addEventListener("click", async () => {
        if (!confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.")) return;
        try {
            const response = await fetch(`/user/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                alert("Compte supprimé avec succès. Vous allez être déconnecté.");
                sessionStorage.clear();
                window.location.href = "../index.html";
            } else {
                const err = await response.json();
                alert(err.error || err.message || "Erreur lors de la suppression du compte.");
            }
        } catch (error) {
            alert("Erreur réseau lors de la suppression du compte.");
        }
    });
};