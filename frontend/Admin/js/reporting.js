// frontend/Avocat/js/reporting.js

const Chart = window.Chart;

export const renderReportingDashboard = () => {
  const container = document.getElementById('dashboard-sections');
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Reporting & Statistiques</h2>
      <div id="stats-content">
        <p>Chargement des statistiques...</p>
      </div>
      <div style="margin-top: 40px;">
        <canvas id="chart-dossiers-par-avocat" style="margin-bottom: 50px;"></canvas>
      </div>
      <div style="width: 300px; margin: 0 auto;">
        <canvas id="chart-factures"></canvas>
      </div>
    </div>
  `;

  const storedToken = sessionStorage.getItem('token');
  if (!storedToken) return;

  fetch('/admin/stats/platform', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${storedToken}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const statsDiv = document.getElementById('stats-content');
      statsDiv.innerHTML = `
        <div class="columns">
          <div class="column">
            <p><strong>Total utilisateurs:</strong> ${data.users?.total || 0}</p>
            <p>Clients: ${data.users?.clients || 0}, Avocats: ${data.users?.avocats || 0}</p>
            <p><strong>Messages échangés:</strong> ${data.messages || 0}</p>
            <p><strong>Temps total enregistré:</strong> ${data.tempsTravail || 0} h</p>
          </div>
          <div class="column">
            <p><strong>Dossiers par statut:</strong></p>
            <ul>
              ${data.dossiers.map(d => `<li>${d.status}: ${d.count}</li>`).join('')}
            </ul>
          </div>
          <div class="column">
            <p><strong>Total facturé:</strong> ${data.paiements.totalFactures || 0} $</p>
            <p><strong>Total payé:</strong> ${data.paiements.totalPayes || 0} $</p>
            <p><strong>Répartition factures:</strong></p>
            <ul>
              ${data.paiements.repartition.map(stat => `<li>${stat.status}: ${stat.total}</li>`).join('')}
            </ul>
            <p><strong>Top utilisateurs (messages):</strong></p>
            <ul>
              ${data.topMessagers.map(user => `<li>${user.prenom} ${user.nom} - ${user.total} messages</li>`).join('')}
            </ul>
          </div>
        </div>
      `;

      // 📊 Dossiers par avocat (bar chart)
      const avocats = data.dossiersParAvocat.map(a => `${a.prenom} ${a.nom}`);
      const nbDossiersAvocat = data.dossiersParAvocat.map(a => a.total);

      const ctx1 = document.getElementById('chart-dossiers-par-avocat');
      new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: avocats,
          datasets: [{
            label: 'Dossiers',
            data: nbDossiersAvocat,
            backgroundColor: '#00d1b2'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Nombre de dossiers par avocat',
              font: { size: 20 }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });

      // 🥧 Répartition des factures (pie chart)
      const labelsFactures = data.paiements.repartition.map(f => f.status);
      const dataFactures = data.paiements.repartition.map(f => f.total);

      const ctx2 = document.getElementById('chart-factures');
      new Chart(ctx2, {
        type: 'pie',
        data: {
          labels: labelsFactures,
          datasets: [{
            label: 'Répartition',
            data: dataFactures,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Répartition des statuts de factures',
              font: { size: 18 }
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    })
    .catch(err => {
      document.getElementById('stats-content').innerHTML = `<p class="has-text-danger">Erreur lors du chargement.</p>`;
      console.error(err);
    });
};
