const procedures = require('./procedures');
const db = require('../knex');
const bcrypt = require('bcrypt');

async function generateTestData() {
    try {
        console.log('Commençant la génération des données de test...');
        
        // -------- CRÉATION DES AVOCATS --------
        console.log('Création des avocats...');
        const avocats = [];
        
        // Hash all passwords before creating users
        const saltRounds = 10;
        
        const hashedPassword1 = await bcrypt.hash('MotDePasse123', saltRounds);
        const avocat1 = await procedures.createAvocat(
            'Sophie', 'Tremblay', 'sophie.tremblay@cabinet-juridique.ca', 
            '514-555-1234', hashedPassword1
        );
        avocats.push(avocat1.avocatID);
        
        const hashedPassword2 = await bcrypt.hash('AvoMB2023', saltRounds);
        const avocat2 = await procedures.createAvocat(
            'Marc', 'Bélanger', 'marc.belanger@cabinet-juridique.ca', 
            '514-555-2345', hashedPassword2
        );
        avocats.push(avocat2.avocatID);
        
        const hashedPassword3 = await bcrypt.hash('DroitQc2023', saltRounds);
        const avocat3 = await procedures.createAvocat(
            'Isabelle', 'Gagnon', 'isabelle.gagnon@cabinet-juridique.ca', 
            '514-555-3456', hashedPassword3
        );
        avocats.push(avocat3.avocatID);
        
        // -------- CRÉATION DES CLIENTS --------
        console.log('Création des clients...');
        const clients = [];
        
        const hashedClientPassword1 = await bcrypt.hash('Client123', saltRounds);
        const client1 = await procedures.createClient(
            'Jean', 'Dupont', 'jean.dupont@gmail.com',
            '514-555-6789', hashedClientPassword1
        );
        clients.push(client1.clientID);
        
        const hashedClientPassword2 = await bcrypt.hash('ML2023!', saltRounds);
        const client2 = await procedures.createClient(
            'Marie', 'Lavoie', 'marie.lavoie@hotmail.com',
            '514-555-7890', hashedClientPassword2
        );
        clients.push(client2.clientID);
        
        const hashedClientPassword3 = await bcrypt.hash('PLeclerc2023', saltRounds);
        const client3 = await procedures.createClient(
            'Pierre', 'Leclerc', 'pierre.leclerc@yahoo.ca',
            '514-555-8901', hashedClientPassword3
        );
        clients.push(client3.clientID);
        
        const hashedClientPassword4 = await bcrypt.hash('ECote123!', saltRounds);
        const client4 = await procedures.createClient(
            'Émilie', 'Côté', 'emilie.cote@gmail.com',
            '514-555-9012', hashedClientPassword4
        );
        clients.push(client4.clientID);
        
        // -------- CRÉATION DES DOSSIERS --------
        console.log('Création des dossiers...');
        const dossiers = [];
        
        const dossier1 = await procedures.createDossier(
            avocats[0], 'Divorce Dupont', 'Familial',
            'Procédure de divorce à l\'amiable entre Jean Dupont et son épouse'
        );
        dossiers.push(dossier1.dossierID);
        
        const dossier2 = await procedures.createDossier(
            avocats[1], 'Contrat Lavoie Inc.', 'Commercial',
            'Révision du contrat commercial pour l\'entreprise de Marie Lavoie'
        );
        dossiers.push(dossier2.dossierID);
        
        const dossier3 = await procedures.createDossier(
            avocats[2], 'Litige Propriété Leclerc', 'Immobilier',
            'Litige concernant les limites de propriété de M. Leclerc avec son voisin'
        );
        dossiers.push(dossier3.dossierID);
        
        const dossier4 = await procedures.createDossier(
            avocats[0], 'Testament Côté', 'Succession',
            'Préparation du testament et planification successorale pour Mme Côté'
        );
        dossiers.push(dossier4.dossierID);
        
        // -------- LIAISON CLIENTS-DOSSIERS --------
        console.log('Liaison des clients aux dossiers...');
        
        await procedures.linkClientToDossier(clients[0], dossiers[0]);
        await procedures.linkClientToDossier(clients[1], dossiers[1]);
        await procedures.linkClientToDossier(clients[2], dossiers[2]);
        await procedures.linkClientToDossier(clients[3], dossiers[3]);
        
        // Liaison supplémentaire pour montrer un client avec plusieurs dossiers
        await procedures.linkClientToDossier(clients[0], dossiers[3]);
        
        // -------- CRÉATION DES DOCUMENTS --------
        console.log('Création des documents...');
        const documents = [];
        
        const document1 = await procedures.createDocument(
            avocats[0], 'Requête en divorce', 
            'Document officiel pour la demande de divorce de M. Dupont',
            'https://placeholder.com/documents/divorce_request.pdf'
        );
        documents.push(document1.documentID);
        
        const document2 = await procedures.createDocument(
            avocats[0], 'État financier Dupont',
            'Rapport détaillé de la situation financière pour procédure de divorce',
            'https://placeholder.com/documents/financial_report.pdf'
        );
        documents.push(document2.documentID);
        
        const document3 = await procedures.createDocument(
            avocats[1], 'Contrat commercial v1',
            'Première version du contrat commercial pour Lavoie Inc.',
            'https://placeholder.com/documents/commercial_contract_v1.pdf'
        );
        documents.push(document3.documentID);
        
        const document4 = await procedures.createDocument(
            avocats[2], 'Photos terrain Leclerc',
            'Photos montrant les limites contestées de la propriété',
            'https://placeholder.com/documents/property_photos.jpg'
        );
        documents.push(document4.documentID);
        
        const document5 = await procedures.createDocument(
            avocats[0], 'Testament brouillon',
            'Première ébauche du testament de Mme Côté',
            'https://placeholder.com/documents/draft_will.pdf'
        );
        documents.push(document5.documentID);
        
        // -------- LIAISON DOCUMENTS-DOSSIERS --------
        console.log('Liaison des documents aux dossiers...');
        
        await procedures.linkDocumentToDossier(documents[0], dossiers[0]);
        await procedures.linkDocumentToDossier(documents[1], dossiers[0]);
        await procedures.linkDocumentToDossier(documents[2], dossiers[1]);
        await procedures.linkDocumentToDossier(documents[3], dossiers[2]);
        await procedures.linkDocumentToDossier(documents[4], dossiers[3]);
        
        // -------- CRÉATION DES TÂCHES --------
        console.log('Création des tâches...');
        
        await procedures.createTache(
            avocats[0], dossiers[0], 'Demande de documents',
            'Envoyer une lettre demandant les documents financiers manquants',
            'Non commencée'
        );
        
        await procedures.createTache(
            avocats[1], dossiers[1], 'Révision clause 5',
            'Revoir la clause 5 du contrat concernant les pénalités',
            'En cours'
        );
        
        await procedures.createTache(
            avocats[2], dossiers[2], 'Contact géomètre',
            'Contacter un géomètre pour obtenir un rapport officiel sur les limites',
            'Non commencée'
        );
        
        await procedures.createTache(
            avocats[0], dossiers[3], 'Liste actifs',
            'Préparer une liste détaillée des actifs pour le testament',
            'Non commencée'
        );
        
        await procedures.createTache(
            avocats[2], dossiers[2], 'Rédiger mise en demeure',
            'Préparer une mise en demeure pour le voisin',
            'Terminée'
        );
        
        // -------- CRÉATION DES SESSIONS --------
        console.log('Création des sessions...');
        const sessions = [];
        
        // Session 1 - complétée il y a 5 jours
        const session1 = await procedures.createSession(
            avocats[0], dossiers[0], 'Entretien initial avec client'
        );
        sessions.push(session1.sessionID);
        
        // Session 2 - complétée il y a 3 jours
        const session2 = await procedures.createSession(
            avocats[1], dossiers[1], 'Analyse du contrat actuel'
        );
        sessions.push(session2.sessionID);
        
        // Session 3 - complétée hier
        const session3 = await procedures.createSession(
            avocats[2], dossiers[2], 'Examen des photos et documents'
        );
        sessions.push(session3.sessionID);
        
        // Session 4 - en cours
        const session4 = await procedures.createSession(
            avocats[0], dossiers[3], 'Rédaction du testament'
        );
        sessions.push(session4.sessionID);
        
        // Session 5 - complétée aujourd'hui
        const session5 = await procedures.createSession(
            avocats[0], dossiers[0], 'Préparation des documents'
        );
        sessions.push(session5.sessionID);
        
        // -------- TERMINER DES SESSIONS --------
        console.log('Terminer des sessions et ajuster les dates...');
        
        // Compléter les sessions
        await procedures.endSession(sessions[0], 'Entretien initial complété, notes prises');
        await procedures.endSession(sessions[1], 'Analyse complétée, points à modifier identifiés');
        await procedures.endSession(sessions[2], 'Examen complété, besoin d\'expertise supplémentaire');
        // La session 4 reste active
        await procedures.endSession(sessions[4], 'Préparation complétée');
        
        // Ajuster les dates des sessions artificiellement
        await manipulateSessionDates();
        
        // -------- CRÉATION DES RAPPELS --------
        console.log('Création des rappels...');
        
        // Date d'annonce: demain
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Date d'annonce: dans une semaine
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        // Date d'annonce: dans deux semaines
        const twoWeeks = new Date();
        twoWeeks.setDate(twoWeeks.getDate() + 14);
        
        await procedures.createRappel(
            avocats[0], 'Audience Dupont',
            'Comparution au tribunal pour le divorce Dupont',
            nextWeek.toISOString()
        );
        
        await procedures.createRappel(
            avocats[1], 'Réunion Lavoie Inc.',
            'Présentation du contrat révisé',
            tomorrow.toISOString()
        );
        
        await procedures.createRappel(
            avocats[2], 'Date limite expertise',
            'Dernière date pour soumettre l\'expertise du géomètre',
            twoWeeks.toISOString()
        );
        
        // -------- CRÉATION DES FACTURES --------
        console.log('Création des factures...');
        const factures = [];
        
        // Créer des factures pour différents dossiers
        const facture1 = await procedures.createFacture(
            dossiers[0], 12.5, 200 // 12.5h à 200$/h pour le dossier de divorce
        );
        factures.push(facture1.factureID);
        
        const facture2 = await procedures.createFacture(
            dossiers[1], 6, 175 // 6h à 175$/h pour le contrat commercial
        );
        factures.push(facture2.factureID);
        
        const facture3 = await procedures.createFacture(
            dossiers[2], 8.25, 150 // 8.25h à 150$/h pour le litige immobilier
        );
        factures.push(facture3.factureID);
        
        // Manipuler les dates des factures pour avoir des exemples variés
        await manipulateFactureDates();
        
        // -------- FERMETURE DE DOSSIER --------
        console.log('Fermeture d\'un dossier...');
        
        // Fermer le dossier de divorce (déjà facturé mais on va le marquer comme terminé)
        const closureResult = await procedures.closeDossier(dossiers[3]);
        console.log(`Dossier ${dossiers[3]} fermé avec ${closureResult.totalHours}h travaillées.`);
        console.log(`Facture finale créée: ID ${closureResult.factureID}`);
        
        console.log('Génération des données de test terminée avec succès!');
        
    } catch (error) {
        console.error('Erreur lors de la génération des données de test:', error);
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