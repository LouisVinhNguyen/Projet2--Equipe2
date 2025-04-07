const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// Import routes
const authRoutes = require('./routes/authRoutes');
const avocatRoutes = require('./routes/avocatRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const documentRoutes = require('./routes/documentRoutes');
const tacheRoutes = require('./routes/tacheRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const factureRoutes = require('./routes/factureRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/avocat', avocatRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/dossier', dossierRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/tache', tacheRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/facture', factureRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
