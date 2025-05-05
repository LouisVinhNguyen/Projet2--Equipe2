export const renderSession = async () => {

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Vous devez être connecté pour accéder à cette page.');
    window.location.href = "../index.html";
    return;
  }

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const avocatUserID = tokenPayload.userID;

  const container = document.getElementById('dashboard-sections');
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Mes Sessions</h2>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dossier</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Durée (h)</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="sessionTableBody">
          <!-- Les sessions seront insérées ici -->
        </tbody>
      </table>
    </div>
  `;

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/session/avocat/${avocatUserID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const sessions = await response.json();
        const tableBody = document.getElementById('sessionTableBody');
        tableBody.innerHTML = sessions.map(session => `
          <tr>
            <td>${session.sessionID}</td>
            <td>${session.dossierID}</td>
            <td>${session.clockInTime ? new Date(session.clockInTime).toLocaleString() : '-'}</td>
            <td>${session.clockOutTime ? new Date(session.clockOutTime).toLocaleString() : '-'}</td>
            <td>${session.tempsTotal}</td>
            <td>${session.description}</td>
            <td><button class="button is-small is-info view-session" onclick="window.previousRender = renderSession; window.renderDetailsSession && window.renderDetailsSession('${session.sessionID}')">Voir</button></td>
          </tr>
        `).join('');
      } else {
        console.error("Erreur lors de la récupération des sessions:", response.statusText);
        alert("Erreur lors de la récupération des sessions.");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur réseau lors de la récupération des sessions.");
    }
  };
  fetchSessions();
};
