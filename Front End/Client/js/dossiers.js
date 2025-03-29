export const renderDossiers = () => {
    const container = document.getElementById('dashboard-sections')
    const dossiers = JSON.parse(localStorage.getItem('legalconnect_dossiers') || '[]')
  
    container.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Mes Dossiers</h2>
        ${dossiers.length ? dossiers.map(d => `
          <article class="message is-info mb-3">
            <div class="message-header">
              ${d.nom}
            </div>
            <div class="message-body">
              Client : ${d.client}<br/>
              ${d.description}
            </div>
          </article>
        `).join('') : '<p>Aucun dossier enregistré.</p>'}
      </div>
    `
    async function envoyerDossier(dossiers) {
      try {
        const response = await fetch('/api/dossiers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dossiers),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("Dossier ajouté:", data);
          alert("Dossier ajouté avec succès.");
          renderDossiers(); 
        } else {
          console.error("Erreur lors de l'ajout du dossier:", response.statusText);
          alert("Erreur lors de l'ajout du dossier. Veuillez réessayer.");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
        alert("Une erreur réseau s'est produite. Veuillez réessayer.");
      }
      
    }
  }
  
  async function getDossier() {
    try {
      const response = await fetch('/api/dossiers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Dossiers récupérés:", data);
        return data;
      } else {
        console.error("Erreur lors de la récupération des dossiers:", response.statusText);
        alert("Erreur lors de la récupération des dossiers. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Une erreur réseau s'est produite. Veuillez réessayer.");
    }
  }

getDossier()