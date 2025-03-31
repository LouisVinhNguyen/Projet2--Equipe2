const express = require('express');
const bodyParser = require('body-parser');
const db = require('./knex');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_KEY = require('./secret_key');  // Importer la clé secrète

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

function verifyToken(allowedRoles) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token invalide ou expiré.' });
            }

            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: `Accès réservé à ${allowedRoles.join(' ou ')}.` });
            }

            req.user = decoded;
            next();
        });
    };
}

// Usage:
const verifyAvocatToken = verifyToken(['avocat']);
const verifyClientToken = verifyToken(['client']);
const verifyAvocatOrClientToken = verifyToken(['avocat', 'client']);
    
/**
 * POST /register/avocat
 * Cette route permet de créer un nouvel avocat avec les informations fournies dans le corps de la requête.
 * Elle vérifie d'abord si tous les champs requis sont présents et si l'email est valide.
 * Ensuite, elle hache le mot de passe et exécute la procédure stockée CreateAvocat pour insérer l'avocat dans la base de données.
 */
app.post('/register/avocat', async (req, res) => {
    const { prenom, nom, email, telephone, password } = req.body;

    if (!prenom || !nom || !email || !telephone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validateTelephone(telephone)) {
        return res.status(400).json({ error: 'Invalid telephone format' });
    }

    try {
        const existingAvocat = await db('avocat').where({ email }).first();
        if (existingAvocat) {
            return res.status(409).json({ message: 'Un avocat avec cet email existe déjà.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.raw(`
            EXEC CreateAvocat @prenom = ?, @nom = ?, @email = ?, @telephone = ?, @password = ?
        `, [prenom, nom, email, telephone, hashedPassword]);

        res.status(201).json({ avocatID: result[0].AvocatID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'avocat.', error: error.message });
    }
});

/**
 * 
 * 
 * 
 * 
 */
app.post('/login/avocat', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    try {
        const avocat = await db('avocat').where({ email }).first();
    
        if (!avocat) {
          return res.status(401).json({ message:  "L'email saisie ne correspond à aucun avocat." });
        }

        console.log('Provided Password:', password);
        console.log('Stored Hashed Password:', avocat.password);
    
        const isMatch = await bcrypt.compare(password, avocat.password);

        console.log('Password Match:', isMatch); // Log the result of the comparison
    
        if (!isMatch) {
          // Mot de passe incorrect
          return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }
    
        const token = jwt.sign(
            { userId: avocat.id, email: avocat.email, role: 'avocat' },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
    
        console.log('Avocat authentifié :', avocat.email);
        console.log('Token généré :', token);
    
        // Envoyer le token au client
        res.status(200).json({ token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erreur interne.' });
    }
});

app.get('/avocat', verifyAvocatToken, async (req, res) => {
    try {
        const avocats = await db('avocat').select('*');
        res.status(200).json(avocats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des avocats.', error: error.message });
    }
});

app.put('/avocat/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;
    const { prenom, nom, email, telephone } = req.body;

    if (!prenom || !nom || !email || !telephone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validateTelephone(telephone)) {
        return res.status(400).json({ error: 'Invalid telephone format' });
    }

    try {
        const existingAvocat = await db('avocat').where({ id }).first();
        if (!existingAvocat) {
            return res.status(404).json({ message: 'Avocat introuvable.' });
        }

        await db('avocat').where({ id }).update({ prenom, nom, email, telephone });
        res.status(200).json({ message: 'Avocat modifié avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification de l\'avocat.', error: error.message });
    }
});

app.delete('/avocat/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;

    try {
        const existingAvocat = await db('avocat').where({ id }).first();
        if (!existingAvocat) {
            return res.status(404).json({ message: 'Avocat introuvable.' });
        }

        await db('avocat').where({ id }).delete();
        res.status(200).json({ message: 'Avocat supprimé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'avocat.', error: error.message });
    }
});

/**
 * POST /register/client
 * Cette route permet de créer un nouveau client avec les informations fournies dans le corps de la requête.
 * Elle vérifie d'abord si tous les champs requis sont présents et si l'email est valide.
 * Ensuite, elle hache le mot de passe et exécute la procédure stockée CreateClient pour insérer le client dans la base de données.
 */
app.post('/register/client', async (req, res) => {
    const { prenom, nom, email, telephone, password } = req.body;

    if (!prenom || !nom || !email || !telephone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validateTelephone(telephone)) {
        return res.status(400).json({ error: 'Invalid telephone format' });
    }

    try {
        const existingClient = await db('client').where({ email }).first();
        if (existingClient) {
            return res.status(409).json({ message: 'Un client avec cet email existe déjà.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.raw(`
            EXEC CreateClient @prenom = ?, @nom = ?, @email = ?, @telephone = ?, @password = ?
        `, [prenom, nom, email, telephone, hashedPassword]);

        res.status(201).json({ clientID: result[0].ClientID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du client.', error: error.message });
    }
});

/**
 * 
 * 
 * 
 * 
 */
app.post('/login/client', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    try {
        console.log('Email :', email);

        const client = await db('client').where({ email }).first();
    
        if (!client) {
          return res.status(401).json({ message:  "L'email saisie ne correspond à aucun client." });
        }
    
        const isMatch = await bcrypt.compare(password, client.password);
    
        if (!isMatch) {
          // Mot de passe incorrect
          return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        const token = jwt.sign(
            { userId: client.id, email: client.email, role: 'client' }, // Include role
            SECRET_KEY,
            { expiresIn: '1h' }
        );
    
        console.log('Utilisateur authentifié :', client.email);
        console.log('Token généré :', token);
    
        // Envoyer le token au client
        res.status(200).json({ token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Erreur interne.' });
    }
});

app.get('/client', verifyAvocatToken, async (req, res) => {
    try {
        const clients = await db('client').select('*');
        res.status(200).json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des clients.', error: error.message });
    }
});

app.put('/client/:id', verifyAvocatOrClientToken, async (req, res) => {
    const { id } = req.params;
    const { prenom, nom, email, telephone } = req.body;

    if (!prenom || !nom || !email || !telephone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validateTelephone(telephone)) {
        return res.status(400).json({ error: 'Invalid telephone format' });
    }

    try {
        const existingClient = await db('client').where({ clientID: id }).first();
        if (!existingClient) {
            return res.status(404).json({ message: 'Client introuvable.' });
        }

        await db('client').where({ clientID: id }).update({ prenom, nom, email, telephone });
        res.status(200).json({ message: 'Client modifié avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification du client.', error: error.message });
    }
});

app.delete('/client/:id', verifyAvocatOrClientToken, async (req, res) => {
    const { id } = req.params;

    try {
        const existingClient = await db('client').where({ clientID: id }).first();
        if (!existingClient) {
            return res.status(404).json({ message: 'Client introuvable.' });
        }

        await db.raw(`
            EXEC DeleteClient @clientID = ?
        `, [id]);

        res.status(200).json({ message: 'Client supprimé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du client.', error: error.message });
    }
});

app.get('/dossier', verifyAvocatToken, async (req, res) => {
    try {
        const dossiers = await db('dossier').select('*');
        res.status(200).json(dossiers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.', error: error.message });
    }
});

/**
 * POST /dossier
 * Cette route permet de créer un nouveau dossier avec les informations fournies dans le corps de la requête.
 * Elle vérifie d'abord si tous les champs requis sont présents.
 * Ensuite, elle exécute la procédure stockée CreateDossier pour insérer le dossier dans la base de données.
 */
app.post('/dossier', verifyAvocatToken, async (req, res) => {
    const { avocatID, dossierNom, dossierType, description, clientID } = req.body;

    if (!avocatID || !dossierNom || !dossierType || !description) {
        return res.status(400).json({ error: 'Tous les champs sauf clientID sont requis.' });
    }

    try {
        // Check if the avocatID exists
        const existingAvocat = await db('avocat').where({ avocatID }).first();
        if (!existingAvocat) {
            return res.status(404).json({ error: "L'avocat spécifié n'existe pas." });
        }

        // Check if the clientID exists (if provided)
        if (clientID) {
            const existingClient = await db('client').where({ clientID }).first();
            if (!existingClient) {
                return res.status(404).json({ error: "Le client spécifié n'existe pas." });
            }
        }

        // Check if a dossier with the same name already exists
        const existingDossier = await db('dossier').where({ dossierNom }).first();
        if (existingDossier) {
            return res.status(409).json({ error: "Un dossier avec ce nom existe déjà." });
        }

        const result = await db.raw(`
            EXEC CreateDossier @avocatID = ?, @dossierNom = ?, @dossierType = ?, @description = ?, @clientID = ?
        `, [avocatID, dossierNom, dossierType, description, clientID || null]);

        res.status(201).json({ dossierID: result[0].DossierID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du dossier.', error: error.message });
    }
});

app.put('/dossier/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;
    const { avocatID, dossierNom, status, dossierType, description, clientID } = req.body;

        // List of allowed status values
    const allowedStatuses = ['En cours', 'En attente', 'Terminé', 'Annulé', 'En attente d\'approbation'];

    // Check if the status is valid
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(', ')}.`
        });
    }

    if (!avocatID || !dossierNom || !status || !dossierType || !description) {
        return res.status(400).json({ error: 'All fields except clientID are required' });
    }

    try {
        const existingDossier = await db('dossier').where({ dossierID: id }).first();
        if (!existingDossier) {
            return res.status(404).json({ message: 'Dossier introuvable.' });
        }

        // Check if the avocatID exists
        const existingAvocat = await db('avocat').where({ avocatID }).first();
        if (!existingAvocat) {
            return res.status(404).json({ error: "L'avocat spécifié n'existe pas." });
        }

        // Check if the clientID exists (if provided)
        if (clientID) {
            const existingClient = await db('client').where({ clientID }).first();
            if (!existingClient) {
                return res.status(404).json({ error: "Le client spécifié n'existe pas." });
            }
        }

        await db('dossier').where({ dossierID: id }).update({ avocatID, dossierNom, status, dossierType, description, clientID });
        res.status(200).json({ message: 'Dossier modifié avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification du dossier.', error: error.message });
    }
});

/**
 * 
 * 
 * 
 * 
 */
app.delete('/dossier/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;

    try {
        const existingDossier = await db('dossier').where({ dossierID: id }).first();
        if (!existingDossier) {
            return res.status(404).json({ message: 'Dossier introuvable.' });
        }

        await db('dossier').where({ dossierID: id }).delete();

        res.status(200).json({ message: 'Dossier supprimé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du dossier.', error: error.message });
    }
});

app.post('/dossier/close/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Ensure all sessions for this dossier are closed
        const activeSessions = await db('session')
            .where({ dossierID: id })
            .andWhere('clockOutTime', null);
        if (activeSessions.length > 0) {
            return res.status(400).json({ 
                message: 'Veuillez clôturer toutes les sessions actives avant de fermer le dossier.' 
            });
        }

        // Call the stored procedure CloseDossier
        const result = await db.raw('EXEC CloseDossier @dossierID = ?', [id]);
        // The procedure returns the total hours in a "TotalHeures" field.
        // Depending on your DB driver, the returned structure may vary.
        const totalHours =
            result && result[0] && result[0][0] && result[0][0].TotalHeures !== undefined 
                ? result[0][0].TotalHeures 
                : null;
        return res.status(200).json({ 
            message: 'Dossier fermé avec succès.', 
            totalHours 
        });
    } catch (error) {
        // Check for errors from the procedure indicating a double close or missing dossier
        if (error.message && error.message.includes('Le dossier est déjà fermé')) {
            return res.status(400).json({ message: 'Le dossier est déjà fermé.' });
        }
        if (error.message && error.message.includes("n'existe pas")) {
            return res.status(404).json({ message: 'Le dossier spécifié n\'existe pas.' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Erreur lors de la fermeture du dossier.', error: error.message });
    }
});

app.get('/document', verifyAvocatToken, async (req, res) => {
    try {
        const documents = await db('document').select('*');
        res.status(200).json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des documents.', error: error.message });
    }
});

app.post('/document', verifyAvocatToken, async (req, res) => {
    const { avocatID, documentNom, description, fichier, dossierID } = req.body;

    if (!avocatID || !documentNom || !description || !fichier) {
        return res.status(400).json({ error: 'All fields except dossierID are required' });
    }

    try {
        // Check if the dossierID exists (if provided)
        if (dossierID) {
            const existingDossier = await db('dossier').where({ dossierID }).first();
            if (!existingDossier) {
                return res.status(404).json({ message: 'Dossier introuvable.' });
            }
        }

        // Check if a document with the same name already exists
        const existingDocument = await db('document').where({ documentNom }).first();
        if (existingDocument) {
            return res.status(409).json({ error: 'Un document avec ce nom existe déjà.' });
        }

        const result = await db.raw(`
            EXEC CreateDocument @avocatID = ?, @documentNom = ?, @description = ?, @fichier = ?, @dossierID = ?
        `, [avocatID, documentNom, description, fichier, dossierID]);

        res.status(201).json({ documentID: result[0].DocumentID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du document.', error: error.message });
    }
});

app.put('/document/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;
    const { avocatID, documentNom, description, fichier } = req.body;

    if (!avocatID || !documentNom || !description || !fichier) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingDocument = await db('document').where({ documentID: id }).first();
        if (!existingDocument) {
            return res.status(404).json({ message: 'Document introuvable.' });
        }

        await db('document').where({ documentID: id }).update({ avocatID, documentNom, description, fichier });
        res.status(200).json({ message: 'Document modifié avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification du document.', error: error.message });
    }
});

app.delete('/document/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the document exists
        const existingDocument = await db('document').where({ documentID: id }).first();
        if (!existingDocument) {
            return res.status(404).json({ message: 'Document introuvable.' });
        }

        // Call the stored procedure to delete the document and related records
        await db.raw(`
            EXEC DeleteDocument @documentID = ?
        `, [id]);

        res.status(200).json({ message: 'Document supprimé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du document.', error: error.message });
    }
});

app.get('/tache', verifyAvocatToken, async (req, res) => {
    try {
        const taches = await db('tache').select('*');
        res.status(200).json(taches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches.', error: error.message });
    }
});

app.post('/tache', verifyAvocatToken, async (req, res) => {
    const { avocatID, dossierID, documentNom, description, status } = req.body;

    // List of allowed status values
    const allowedStatuses = ['Non commencée', 'En cours', 'Terminée', 'Bloquée', 'Annulée'];

    // Check if the status is valid
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(', ')}.`
        });
    }

    if (!avocatID || !dossierID || !documentNom || !description || !status) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        // Check if the avocatID exists
        const existingAvocat = await db('avocat').where({ avocatID }).first();
        if (!existingAvocat) {
            return res.status(404).json({ error: "L'avocat spécifié n'existe pas." });
        }

        // Check if the dossierID exists
        const existingDossier = await db('dossier').where({ dossierID }).first();
        if (!existingDossier) {
            return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
        }

        const result = await db.raw(`
            EXEC CreateTache @avocatID = ?, @dossierID = ?, @documentNom = ?, @description = ?, @status = ?
        `, [avocatID, dossierID, documentNom, description, status]);

        res.status(201).json({ tacheID: result[0].TacheID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la tâche.', error: error.message });
    }
});

app.put('/tache/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;
    const { avocatID, dossierID, documentNom, description, status } = req.body;

    // List of allowed status values
    const allowedStatuses = ['Non commencée', 'En cours', 'Terminée', 'Bloquée', 'Annulée'];

    // Check if the status is valid
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: `Le statut fourni est invalide. Les statuts valides sont : ${allowedStatuses.join(', ')}.`
        });
    }

    if (!avocatID || !dossierID || !documentNom || !description || !status) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        const existingTache = await db('tache').where({ tacheID: id }).first();
        if (!existingTache) {
            return res.status(404).json({ message: 'Tâche introuvable.' });
        }

        // Check if the avocatID exists
        const existingAvocat = await db('avocat').where({ avocatID }).first();
        if (!existingAvocat) {
            return res.status(404).json({ error: "L'avocat spécifié n'existe pas." });
        }

        // Check if the dossierID exists
        const existingDossier = await db('dossier').where({ dossierID }).first();
        if (!existingDossier) {
            return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
        }

        await db('tache').where({ tacheID: id }).update({ avocatID, dossierID, documentNom, description, status });
        res.status(200).json({ message: 'Tâche modifiée avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification de la tâche.', error: error.message });
    }
});

app.delete('/tache/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;

    try {
        const existingTache = await db('tache').where({ tacheID: id }).first();
        if (!existingTache) {
            return res.status(404).json({ message: 'Tâche introuvable.' });
        }

        await db('tache').where({ tacheID: id }).delete();
        res.status(200).json({ message: 'Tâche supprimée avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la tâche.', error: error.message });
    }
});

app.get('/session', verifyAvocatToken, async (req, res) => {
    try {
        const sessions = await db('session').select('*');
        res.status(200).json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des sessions.', error: error.message });
    }
});

app.post('/session', verifyAvocatToken, async (req, res) => {
    const { avocatID, dossierID, description } = req.body;

    if (!avocatID || !dossierID || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if the avocatID exists
        const existingAvocat = await db('avocat').where({ avocatID }).first();
        if (!existingAvocat) {
            return res.status(404).json({ error: "L'avocat spécifié n'existe pas." });
        }

        // Check if the dossierID exists
        const existingDossier = await db('dossier').where({ dossierID }).first();
        if (!existingDossier) {
            return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
        }

        const result = await db.raw(`
            EXEC CreateSession @avocatID = ?, @dossierID = ?, @description = ?
        `, [avocatID, dossierID, description]);

        res.status(201).json({ sessionID: result[0].SessionID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la session.', error: error.message });
    }
});

app.put('/session/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;
    const { avocatID, dossierID, description } = req.body;

    if (!avocatID || !dossierID || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingSession = await db('session').where({ sessionID: id }).first();
        if (!existingSession) {
            return res.status(404).json({ message: 'Session introuvable.' });
        }

        // Check if the avocatID exists
        const existingAvocat = await db('avocat').where({ avocatID }).first();
        if (!existingAvocat) {
            return res.status(404).json({ error: "L'avocat spécifié n'existe pas." });
        }

        // Check if the dossierID exists
        const existingDossier = await db('dossier').where({ dossierID }).first();
        if (!existingDossier) {
            return res.status(404).json({ error: "Le dossier spécifié n'existe pas." });
        }

        await db('session').where({ sessionID: id }).update({ avocatID, dossierID, description });
        res.status(200).json({ message: 'Session modifiée avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification de la session.', error: error.message });
    }
});

app.delete('/session/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;

    try {
        const existingSession = await db('session').where({ sessionID: id }).first();
        if (!existingSession) {
            return res.status(404).json({ message: 'Session introuvable.' });
        }

        await db('session').where({ sessionID: id }).delete();
        res.status(200).json({ message: 'Session supprimée avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la session.', error: error.message });
    }
});

app.post('/session/end/:id', verifyAvocatToken, async (req, res) => {
    const { id } = req.params;
    const { description } = req.body; // Optional updated description

    try {
        // Call the stored procedure EndSession. Only an existing session that isn't already ended can be marked as ended.
        const result = await db.raw(
            'EXEC EndSession @sessionID = ?, @description = ?',
            [id, description || null]
        );
        // Depending on your driver, adjust how you access the returned data.
        const updatedSession =
            result && result[0] && result[0][0]
                ? result[0][0]
                : null;

        return res.status(200).json({
            message: 'Session clôturée avec succès.',
            session: updatedSession
        });
    } catch (error) {
        // Handle errors coming from the procedure
        if (error.message && error.message.includes('This session has already been ended')) {
            return res.status(400).json({ message: 'Cette session a déjà été clôturée.' });
        }
        if (error.message && error.message.includes('Session ID does not exist')) {
            return res.status(404).json({ message: 'Session introuvable.' });
        }
        console.error(error);
        return res.status(500).json({
            message: 'Erreur lors de la clôture de la session.',
            error: error.message
        });
    }
});

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// Extras
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailPattern.test(email);
}

function validateTelephone(telephone) {
    const phonePattern = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
    
    return phonePattern.test(telephone);
}

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});