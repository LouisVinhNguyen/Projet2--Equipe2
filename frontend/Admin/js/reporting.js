const token = sessionStorage.getItem('token');

// Récupérer le Total des Clients
fetch('/admin/stats/total-clients', {
    headers: { Authorization: `Bearer ${token}` }
})
.then(response => response.json())
.then(data => {
    document.getElementById('totalClients').innerText = data.totalClients;
})
.catch(error => console.error('Erreur total-clients:', error));

// Récupérer le Total des Dossiers
fetch('/admin/stats/total-dossiers', {
    headers: { Authorization: `Bearer ${token}` }
})
.then(response => response.json())
.then(data => {
    document.getElementById('totalDossiers').innerText = data.totalDossiers;
})
.catch(error => console.error('Erreur total-dossiers:', error));

// Récupérer le Total des Paiements
fetch('/admin/stats/total-paiements', {
    headers: { Authorization: `Bearer ${token}` }
})
.then(response => response.json())
.then(data => {
    document.getElementById('totalPaiements').innerText = data.totalPaiements + ' $';
})
.catch(error => console.error('Erreur total-paiements:', error));

// Récupérer le nombre de Dossiers Ouverts
fetch('/admin/stats/dossiers-ouverts', {
    headers: { Authorization: `Bearer ${token}` }
})
.then(response => response.json())
.then(data => {
    document.getElementById('dossiersOuverts').innerText = data.dossiersOuverts;
})
.catch(error => console.error('Erreur dossiers-ouverts:', error));

// Récupérer les Dossiers par Mois pour Graphique
fetch('/admin/stats/dossiers-par-mois', {
    headers: { Authorization: `Bearer ${token}` }
})
.then(response => response.json())
.then(data => {
    const ctx = document.getElementById('dossiersParMois').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(entry => entry.mois),
            datasets: [{
                label: 'Dossiers créés',
                data: data.map(entry => entry.total),
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
})
.catch(error => console.error('Erreur dossiers-par-mois:', error));
