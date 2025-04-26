const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const avocatRoutes = require('./routes/avocatRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const documentRoutes = require('./routes/documentRoutes');
const tacheRoutes = require('./routes/tacheRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const factureRoutes = require('./routes/factureRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
 


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
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/avocat', avocatRoutes);
app.use('/client', clientRoutes);
app.use('/dossier', dossierRoutes);
app.use('/document', documentRoutes);
app.use('/tache', tacheRoutes);
app.use('/session', sessionRoutes);
app.use('/facture', factureRoutes);
app.use('/user', userRoutes);
app.use('/message', messageRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
