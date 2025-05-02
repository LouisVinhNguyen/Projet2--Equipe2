const procedures = require('../models/procedures');
const db = require('../config/db');
const bcrypt = require('bcrypt');

async function clearAllTables() {
    try {
        // Désactiver temporairement les contraintes de clé étrangère (pour SQLite)
        await db.raw('PRAGMA foreign_keys = OFF');
        // Vider les tables dans l'ordre inverse des dépendances
        await db('client_dossier').del();
        await db('dossier_document').del();
        await db('tache').del();
        await db('session').del();
        await db('rappel').del();
        await db('paiement').del();
        await db('facture').del();
        await db('document').del();
        await db('dossier').del();
        await db('users').del();
        // Réactiver les contraintes de clé étrangère
        await db.raw('PRAGMA foreign_keys = ON');
        console.log('Toutes les tables ont été vidées.');
    } catch (error) {
        console.error('Erreur lors du vidage des tables:', error);
        throw error;
    }
}

async function generateTestData() {
    try {
        await clearAllTables();
        console.log('--- DÉBUT : Génération de données de test ---');
        
        const saltRounds = 10;
        const avocats = [];
        const clients = [];
        const defaultUsers = [];

        // -------- CRÉATION DES UTILISATEURS --------
        console.log('Création des utilisateurs...');

        // Avocats
        const avocatData = [
            {prenom: 'Sophie', nom: 'Tremblay', email: 'sophie.tremblay@cabinet.ca', tel: '514-555-1234', password: 'MotDePasse123'},
            {prenom: 'Marc', nom: 'Bélanger', email: 'marc.belanger@cabinet.ca', tel: '514-555-2345', password: 'AvoMB2023'},
            {prenom: 'Isabelle', nom: 'Gagnon', email: 'isabelle.gagnon@cabinet.ca', tel: '514-555-3456', password: 'DroitQc2023'},
            {prenom: 'Olivier', nom: 'Roy', email: 'olivier.roy@cabinet.ca', tel: '514-555-4567', password: 'OlivierR2023'}
        ];
        
        for (const avocat of avocatData) {
            const hashed = await bcrypt.hash(avocat.password, saltRounds);
            const created = await procedures.createUser(avocat.prenom, avocat.nom, avocat.email, avocat.tel, hashed, 'avocat');
            avocats.push(created.userID);
        }

        // Admin & autres utilisateurs
        const usersData = [
            {prenom: 'admin', nom: 'admin', email: 'admin@gmail.com', tel: '514-111-1111', password: 'admin', role: 'admin'},
            {prenom: 'avocat', nom: 'avocat', email: 'avocat@gmail.com', tel: '514-222-2222', password: 'avocat', role: 'avocat'},
            {prenom: 'client', nom: 'client', email: 'client@gmail.com', tel: '514-333-3333', password: 'client', role: 'client'}
        ];

        for (const user of usersData) {
            const hashed = await bcrypt.hash(user.password, saltRounds);
            const created = await procedures.createUser(user.prenom, user.nom, user.email, user.tel, hashed, user.role);
            defaultUsers.push(created.userID);
        }

        // Clients
        const clientsData = [
            {prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@gmail.com', tel: '514-555-6789', password: 'Client123'},
            {prenom: 'Marie', nom: 'Lavoie', email: 'marie.lavoie@hotmail.com', tel: '514-555-7890', password: 'ML2023!'},
            {prenom: 'Pierre', nom: 'Leclerc', email: 'pierre.leclerc@yahoo.ca', tel: '514-555-8901', password: 'PLeclerc2023'},
            {prenom: 'Émilie', nom: 'Côté', email: 'emilie.cote@gmail.com', tel: '514-555-9012', password: 'ECote123!'},
            {prenom: 'Simon', nom: 'Marchand', email: 'simon.marchand@outlook.com', tel: '514-555-9123', password: 'Sim0nM!'},
            {prenom: 'Alice', nom: 'Martin', email: 'alice.martin@gmail.com', tel: '514-555-1235', password: 'AliceM2023'},
            {prenom: 'Luc', nom: 'Bergeron', email: 'luc.bergeron@hotmail.com', tel: '514-555-2346', password: 'LucB123!'},
            {prenom: 'Chantal', nom: 'Dubois', email: 'chantal.dubois@yahoo.ca', tel: '514-555-3457', password: 'ChantalD2023'},
            {prenom: 'François', nom: 'Girard', email: 'francois.girard@gmail.com', tel: '514-555-4568', password: 'FGirard123!'},
            {prenom: 'Julie', nom: 'Lemieux', email: 'julie.lemieux@outlook.com', tel: '514-555-5679', password: 'JulieL!'},
            {prenom: 'Antoine', nom: 'Moreau', email: 'antoine.moreau@gmail.com', tel: '514-555-6780', password: 'AntoineM2023'},
            {prenom: 'Caroline', nom: 'Fortin', email: 'caroline.fortin@hotmail.com', tel: '514-555-7891', password: 'CFortin123!'},
            {prenom: 'David', nom: 'Pelletier', email: 'david.pelletier@yahoo.ca', tel: '514-555-8902', password: 'DPelletier2023'},
            {prenom: 'Sophie', nom: 'Bouchard', email: 'sophie.bouchard@gmail.com', tel: '514-555-9013', password: 'SBouchard123!'},
            {prenom: 'Maxime', nom: 'Tremblay', email: 'maxime.tremblay@outlook.com', tel: '514-555-9124', password: 'MaximeT!'},
            {prenom: 'Isabelle', nom: 'Deschamps', email: 'isabelle.deschamps@gmail.com', tel: '514-555-1236', password: 'IsabelleD2023'},
            {prenom: 'Philippe', nom: 'Laroche', email: 'philippe.laroche@hotmail.com', tel: '514-555-2347', password: 'PLaroche123!'},
            {prenom: 'Nathalie', nom: 'Simard', email: 'nathalie.simard@yahoo.ca', tel: '514-555-3458', password: 'NSimard2023'},
            {prenom: 'Vincent', nom: 'Beaulieu', email: 'vincent.beaulieu@gmail.com', tel: '514-555-4569', password: 'VBeaulieu123!'},
            {prenom: 'Catherine', nom: 'Roy', email: 'catherine.roy@outlook.com', tel: '514-555-5670', password: 'CatherineR!'}
        ];

        for (const client of clientsData) {
            const hashed = await bcrypt.hash(client.password, saltRounds);
            const created = await procedures.createUser(client.prenom, client.nom, client.email, client.tel, hashed, 'client');
            clients.push(created.userID);
        }

        // -------- CRÉATION DES DOSSIERS --------
        console.log('Création des dossiers...');

        const dossiers = [];
        dossiers.push((await procedures.createDossier(avocats[0], 'Divorce Jean Dupont', 'Familial', 'Procédure de divorce en cours', clients[0])).dossierID);
        dossiers.push((await procedures.createDossier(avocats[1], 'Contrat pour Lavoie Inc.', 'Commercial', 'Élaboration d\'un nouveau contrat commercial', clients[1])).dossierID);
        dossiers.push((await procedures.createDossier(avocats[2], 'Litige immobilier Leclerc', 'Immobilier', 'Litige sur la démarcation des terrains', clients[2])).dossierID);
        dossiers.push((await procedures.createDossier(avocats[0], 'Testament Émilie Côté', 'Succession', 'Rédaction de testament personnalisé')).dossierID);
        dossiers.push((await procedures.createDossier(avocats[3], 'Création d\'entreprise Simon Marchand', 'Commercial', 'Accompagnement juridique pour la création d\'entreprise', clients[4])).dossierID);
        
        // Pour l'avocat défault
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Contrat de travail Alice Martin', 'Travail', 'Rédaction d\'un contrat de travail pour poste de direction.', clients[5])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Litige construction Benoît Caron', 'Immobilier', 'Conflit concernant la construction d\'un immeuble résidentiel.', clients[6])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Divorce Julie Perron', 'Familial', 'Procédure de divorce amiable.', clients[7])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Création entreprise Luc Tremblay', 'Commercial', 'Accompagnement juridique pour création d\'une société par actions.', clients[8])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Testament Monique Gagné', 'Succession', 'Rédaction et dépôt d\'un testament notarié.', clients[9])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Réclamation assurance François Lefebvre', 'Assurance', 'Assistance juridique pour litige d\'assurance habitation.', clients[5])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Médiation familiale André Bergeron', 'Familial', 'Médiation pour garde partagée après séparation.', clients[6])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Vente d\'immeuble Claire Moreau', 'Immobilier', 'Vérification légale avant la vente d\'un duplex.', clients[7])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Partage d\'héritage Jean Fortin', 'Succession', 'Négociation d\'un partage d\'héritage complexe.', clients[8])).dossierID);
        dossiers.push((await procedures.createDossier(defaultUsers[1], 'Bail commercial Stéphanie Robert', 'Commercial', 'Négociation d\'un bail commercial pour ouverture de boutique.', clients[9])).dossierID);

        await procedures.linkClientToDossier(clients[3], dossiers[3]);
        await procedures.linkClientToDossier(clients[0], dossiers[3]); // Jean aussi lié au testament pour exemple

        // --- ASSOCIATION DU CLIENT 'client@gmail.com' À DES DOSSIERS ---
        // Associer le client par défaut à deux dossiers existants
        await procedures.linkClientToDossier(defaultUsers[2], dossiers[0]); // Divorce Jean Dupont
        await procedures.linkClientToDossier(defaultUsers[2], dossiers[1]); // Contrat pour Lavoie Inc.

        // Créer un nouveau dossier dont ce client est le client principal
        const dossierClient = await procedures.createDossier(
            avocats[0],
            'Litige personnel Client Test',
            'Civil',
            'Litige de test pour client@gmail.com',
            defaultUsers[2]
        );
        dossiers.push(dossierClient.dossierID);
        // Ajouter un document à ce dossier
        await procedures.createDocument(
            avocats[0],
            'Lettre officielle',
            'Lettre officielle pour le litige personnel.',
            'https://placeholder.com/docs/lettre_officielle.pdf',
            dossierClient.dossierID
        );
        // Ajouter une tâche à ce dossier
        await procedures.createTache(
            avocats[0],
            dossierClient.dossierID,
            'Préparer la défense',
            'Préparer les arguments pour la défense du client.',
            'En cours'
        );
        // Ajouter une session à ce dossier
        await procedures.createSession(
            avocats[0],
            dossierClient.dossierID,
            'Consultation initiale avec client@gmail.com'
        );

        // -------- CRÉATION DES DOCUMENTS --------
        console.log('Création des documents...');

        const documents = [
            {avocat: avocats[0], nom: 'Requête Divorce', desc: 'Demande officielle de divorce.', url: 'https://placeholder.com/docs/divorce_request.pdf', dossier: dossiers[0]},
            {avocat: avocats[1], nom: 'Contrat V2', desc: 'Deuxième version du contrat commercial.', url: 'https://placeholder.com/docs/contract_v2.pdf', dossier: dossiers[1]},
            {avocat: avocats[2], nom: 'Photos terrain', desc: 'Photos de propriété litigieuse.', url: 'https://placeholder.com/docs/terrain_photos.jpg', dossier: dossiers[2]},
            {avocat: avocats[0], nom: 'Testament Côté', desc: 'Ébauche du testament.', url: 'https://placeholder.com/docs/draft_will_cote.pdf', dossier: dossiers[3]},
            {avocat: avocats[3], nom: 'Statuts Entreprise', desc: 'Rédaction des statuts de société.', url: 'https://placeholder.com/docs/statuts_marchand.pdf', dossier: dossiers[4]},
            {avocat: defaultUsers[1], nom: 'Contrat de travail Martin', desc: 'Contrat de travail pour Alice Martin.', url: 'https://placeholder.com/docs/contrat_travail_martin.pdf', dossier: dossiers[5]},
            {avocat: defaultUsers[1], nom: 'Litige construction Caron', desc: 'Documents relatifs au litige de construction.', url: 'https://placeholder.com/docs/litige_construction_caron.pdf', dossier: dossiers[6]},
            {avocat: defaultUsers[1], nom: 'Requête Divorce Perron', desc: 'Demande de divorce pour Julie Perron.', url: 'https://placeholder.com/docs/divorce_perron.pdf', dossier: dossiers[7]},
            {avocat: defaultUsers[1], nom: 'Statuts Entreprise Tremblay', desc: 'Documents de création d\'entreprise pour Luc Tremblay.', url: 'https://placeholder.com/docs/statuts_tremblay.pdf', dossier: dossiers[8]},
        ];

        for (const doc of documents) {
            await procedures.createDocument(doc.avocat, doc.nom, doc.desc, doc.url, doc.dossier);
        }

        // -------- CRÉATION DES TÂCHES --------
        console.log('Création des tâches...');

        const taches = [
            {avocat: avocats[0], dossier: dossiers[0], titre: 'Rassembler documents', desc: 'Collecte des documents financiers.', statut: 'En cours'},
            {avocat: avocats[1], dossier: dossiers[1], titre: 'Révision juridique', desc: 'Réviser clauses spécifiques.', statut: 'Non commencée'},
            {avocat: avocats[2], dossier: dossiers[2], titre: 'Analyse dossier', desc: 'Analyser preuves pour litige.', statut: 'Terminée'},
            {avocat: avocats[0], dossier: dossiers[3], titre: 'Planification successorale', desc: 'Organiser actifs et dettes.', statut: 'En cours'},
            {avocat: avocats[3], dossier: dossiers[4], titre: 'Constitution entreprise', desc: 'Préparation des documents officiels.', statut: 'En cours'},

            {avocat: defaultUsers[1], dossier: dossiers[5], titre: 'Révision contrat', desc: 'Vérifier les clauses de non-concurrence.', statut: 'En cours'},
            {avocat: defaultUsers[1], dossier: dossiers[6], titre: 'Visite chantier', desc: 'Inspection du chantier pour évaluation.', statut: 'Non commencée'},
            {avocat: defaultUsers[1], dossier: dossiers[7], titre: 'Préparation documents', desc: 'Préparer les documents pour le tribunal.', statut: 'Terminée'},
        ];

        for (const tache of taches) {
            await procedures.createTache(tache.avocat, tache.dossier, tache.titre, tache.desc, tache.statut);
        }

        // -------- CRÉATION DES SESSIONS --------
        console.log('Création des sessions...');
        
        const sessions = [];
        sessions.push((await procedures.createSession(avocats[0], dossiers[0], 'Entrevue initiale')).sessionID);
        sessions.push((await procedures.createSession(avocats[1], dossiers[1], 'Négociation contrat')).sessionID);
        sessions.push((await procedures.createSession(avocats[2], dossiers[2], 'Inspection terrain')).sessionID);
        sessions.push((await procedures.createSession(avocats[0], dossiers[3], 'Consultation testament')).sessionID);
        sessions.push((await procedures.createSession(avocats[3], dossiers[4], 'Formation société')).sessionID);

        sessions.push((await procedures.createSession(defaultUsers[1], dossiers[5], 'Réunion contrat')).sessionID);
        sessions.push((await procedures.createSession(defaultUsers[1], dossiers[6], 'Visite chantier')).sessionID);
        sessions.push((await procedures.createSession(defaultUsers[1], dossiers[7], 'Consultation divorce')).sessionID);

        await procedures.endSession(sessions[0], 'Entrevue terminée avec recommandations.');
        await procedures.endSession(sessions[1], 'Négociations achevées.');
        await procedures.endSession(sessions[2], 'Analyse terrain complète.');
        await procedures.endSession(sessions[4], 'Documents de formation déposés.');

        await procedures.endSession(sessions[5], 'Réunion terminée avec le client.');
        await procedures.endSession(sessions[6], 'Visite du chantier effectuée.');
        await procedures.endSession(sessions[7], 'Consultation terminée avec le client.');

        await manipulateSessionDates();
        
        // -------- RAPPELS --------
        console.log('Création des rappels...');
        
        const today = new Date();
        const futureDates = [
            {daysAhead: 5, label: 'Rendez-vous divorce'},
            {daysAhead: 15, label: 'Révision contrat'},
            {daysAhead: 25, label: 'Inspection propriété'}
        ];

        for (const reminder of futureDates) {
            const date = new Date();
            date.setDate(today.getDate() + reminder.daysAhead);
            await procedures.createRappel(avocats[Math.floor(Math.random() * avocats.length)], reminder.label, 'Ne pas oublier.', date.toISOString());
        }

        // -------- FACTURES --------
        console.log('Création des factures...');

        const factureInfos = [
            {dossier: dossiers[0], heures: 10, taux: 200},
            {dossier: dossiers[1], heures: 6.5, taux: 180},
            {dossier: dossiers[2], heures: 8, taux: 160}
        ];
        
        for (const info of factureInfos) {
            await procedures.createFacture(info.dossier, info.heures, info.taux);
        }
        await manipulateFactureDates();

        console.log('--- FIN : Données de test générées avec succès! ---');
        
    } catch (error) {
        console.error('Erreur lors de la génération:', error);
    }
}

async function manipulateSessionDates() {
    // Modifier les dates des sessions dans la base de données directement
    try {
        // Session 1: il y a 5 jours
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const fourHoursLater = new Date(fiveDaysAgo);
        fourHoursLater.setHours(fourHoursLater.getHours() + 4);
        
        await db('session')
            .where('sessionID', 1)
            .update({
                clockInTime: fiveDaysAgo.toISOString(),
                clockOutTime: fourHoursLater.toISOString(),
                tempsTotal: 4 // 4 heures
            });
        
        // Session 2: il y a 3 jours
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const twoHoursLater = new Date(threeDaysAgo);
        twoHoursLater.setHours(twoHoursLater.getHours() + 2);
        
        await db('session')
            .where('sessionID', 2)
            .update({
                clockInTime: threeDaysAgo.toISOString(),
                clockOutTime: twoHoursLater.toISOString(),
                tempsTotal: 2 // 2 heures
            });
        
        // Session 3: hier
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const oneHourLater = new Date(yesterday);
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        
        await db('session')
            .where('sessionID', 3)
            .update({
                clockInTime: yesterday.toISOString(),
                clockOutTime: oneHourLater.toISOString(),
                tempsTotal: 1 // 1 heure
            });
        
        // Session 4: reste telle quelle (en cours)
        
        // Session 5: plus tôt aujourd'hui 
        const earlierToday = new Date();
        earlierToday.setHours(earlierToday.getHours() - 5);
        const threeHoursLater = new Date(earlierToday);
        threeHoursLater.setHours(threeHoursLater.getHours() + 3);
        
        await db('session')
            .where('sessionID', 5)
            .update({
                clockInTime: earlierToday.toISOString(),
                clockOutTime: threeHoursLater.toISOString(),
                tempsTotal: 3 // 3 heures
            });
            
        console.log('Dates des sessions modifiées avec succès');
    } catch (error) {
        console.error('Erreur lors de la modification des dates des sessions:', error);
    }
}

// Fonction pour manipuler les dates des factures
async function manipulateFactureDates() {
    try {
        // Facture 1: créée il y a 45 jours (échue)
        const date1 = new Date();
        date1.setDate(date1.getDate() - 45);
        const dueDate1 = new Date(date1);
        dueDate1.setDate(date1.getDate() + 30);
        
        await db('facture')
            .where('factureID', 1)
            .update({
                dateCreated: date1.toISOString(),
                dateLimite: dueDate1.toISOString()
            });
            
        // Facture 2: créée il y a 10 jours (à venir)
        const date2 = new Date();
        date2.setDate(date2.getDate() - 10);
        const dueDate2 = new Date(date2);
        dueDate2.setDate(date2.getDate() + 30);
        
        await db('facture')
            .where('factureID', 2)
            .update({
                dateCreated: date2.toISOString(),
                dateLimite: dueDate2.toISOString()
            });
            
        // Facture 3: créée il y a 35 jours et marquée comme payée
        const date3 = new Date();
        date3.setDate(date3.getDate() - 35);
        const dueDate3 = new Date(date3);
        dueDate3.setDate(date3.getDate() + 30);
        
        await db('facture')
            .where('factureID', 3)
            .update({
                dateCreated: date3.toISOString(),
                dateLimite: dueDate3.toISOString(),
                status: 'Payée'
            });
            
        console.log('Dates des factures modifiées avec succès');
    } catch (error) {
        console.error('Erreur lors de la modification des dates des factures:', error);
    }
}

// Exécuter la fonction de génération de données
generateTestData()
    .then(() => {
        console.log('Script terminé!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Erreur:', err);
        process.exit(1);
    });