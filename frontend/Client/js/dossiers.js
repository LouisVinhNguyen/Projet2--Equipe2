const token = sessionStorage.getItem("token");

export const renderDossiers = async () => {
  const section = document.getElementById("dashboard-sections");
  section.innerHTML = '<div id="dossierContainer" class="mb-5"></div>';
  const container = document.getElementById("dossierContainer");

  try {
    const response = await fetch("/dossier", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const dossiers = await response.json();
      console.log(dossiers);
      console.log("Dossiers récupérés:", dossiers);

      container.innerHTML = dossiers.length
        ? dossiers
            .map(
              (d) => `
            <article class="message is-info mb-3">
              <div class="message-header">
                ${d.nom}
              </div>
              <div class="message-body">
                Client : ${d.client}<br/>
                ${d.description}
              </div>
            </article>
          `
            )
            .join("")
        : "<p>Aucun dossier enregistré.</p>";
    } else {
      console.error(
        "Erreur lors de la récupération des dossiers:",
        response.statusText
      );
      container.innerHTML =
        '<p class="has-text-danger">Erreur lors de la récupération des dossiers.</p>';
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    container.innerHTML =
      '<p class="has-text-danger">Une erreur réseau s\'est produite.</p>';
  }
};
