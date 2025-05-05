const contentMap = {
  agenda: { title: "Agenda", description: "Planifiez vos rendez-vous." },
  rappels: { title: "Rappels", description: "Tâches et rappels importants." },
  dossiers: { title: "Gestion des Dossiers", description: "" },
  clients: { title: "Gestion des Clients", description: "" },
  facturation: { title: "Facturation & Paiements", description: "" },
  documents: { title: "Documents Reçus", description: "" },
  taches: { title: "Gestion des Tâche", description: "" },
  sessions: { title: "Toutes les Sessions", description: "" }, // Nouveau titre pour admin
  reporting: { title: "Reporting & Statistiques", description: "" },
};

export const initSidebar = ({ onSectionChange }) => {
  const links = document.querySelectorAll(".menu-list a");
  const container = document.getElementById("dashboard-sections");

  const renderSection = (key) => {
    if (!contentMap[key]) return;

    const { title, description } = contentMap[key];

    container.innerHTML = description
      ? `
      <div class="box">
        <h2 class="title is-4">${title}</h2>
        <p>${description}</p>
      </div>
    `
      : "";

    // Appeler la fonction liée à la section sessions (admin)
    if (key === "sessions" && typeof window.renderAllSessions === "function") {
      window.renderAllSessions();
    }

    if (onSectionChange) onSectionChange(key);
  };

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionKey = link.dataset.section;
      renderSection(sectionKey);

      links.forEach((l) => l.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });

  renderSection("agenda"); // Section par défaut au chargement
};
