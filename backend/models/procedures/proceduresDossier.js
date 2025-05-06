const db = require('../../config/db');

// Create a new dossier (case file)
async function createDossier(avocatUserID, dossierNom, dossierType, description, clientUserID = null) {
    try {
        const avocat = await db('users').where({ userID: avocatUserID, role: 'avocat' }).first();
        if (!avocat) {
            throw new Error('L\'utilisateur spécifié n\'existe pas ou n\'est pas un avocat.');
        }
        const result = await db.transaction(async trx => {
            const [dossierID] = await trx('dossier').insert({
                avocatUserID,
                dossierNom,
                status: 'En cours',
                dossierType,
                description,
                dateCreated: new Date().toISOString()
            });
            if (clientUserID !== null) {
                const client = await trx('users').where({ userID: clientUserID, role: 'client' }).first();
                if (!client) {
                    throw new Error('L\'utilisateur spécifié n\'existe pas ou n\'est pas un client.');
                }
                await trx('client_dossier').insert({
                    clientUserID,
                    dossierID
                });
            }
            return dossierID;
        });
        return { dossierID: result };
    } catch (error) {
        console.error('Error in createDossier:', error);
        throw new Error(`Échec de création du dossier: ${error.message}`);
    }
}

// Link a client to a dossier
async function linkClientToDossier(clientUserID, dossierID) {
    try {
        const clientExists = await db('users').where({ userID: clientUserID, role: 'client' }).first();
        if (!clientExists) {
            throw new Error('ID de client inexistant ou l\'utilisateur n\'est pas un client.');
        }
        const dossierExists = await db('dossier').where({ dossierID }).first();
        if (!dossierExists) {
            throw new Error('ID de dossier inexistant.');
        }
        const linkExists = await db('client_dossier')
            .where({ clientUserID, dossierID })
            .first();
        if (linkExists) {
            throw new Error('Le client est déjà lié à ce dossier.');
        }
        await db('client_dossier').insert({ clientUserID, dossierID });
        const result = await db('client_dossier as cd')
            .join('users as u', 'cd.clientUserID', 'u.userID')
            .join('dossier as d', 'cd.dossierID', 'd.dossierID')
            .where({ 'cd.clientUserID': clientUserID, 'cd.dossierID': dossierID })
            .select(
                'u.userID as clientUserID',
                db.raw("u.nom || ', ' || u.prenom as clientNom"),
                'd.dossierID',
                'd.dossierNom'
            )
            .first();
        return result;
    } catch (error) {
        console.error('Error in linkClientToDossier:', error);
        throw new Error(`Échec de liaison du client au dossier: ${error.message}`);
    }
}

// Close a dossier and create invoice
async function closeDossier(dossierID) {
    try {
        const dossier = await db('dossier').where({ dossierID }).first();
        if (!dossier) {
            throw new Error('Le dossier spécifié n\'existe pas.');
        }
        if (dossier.status === 'Terminé') {
            throw new Error('Le dossier est déjà fermé.');
        }
        const result = await db.transaction(async trx => {
            const sessionsResult = await trx('session')
                .where({ dossierID })
                .whereNotNull('clockOutTime')
                .sum('tempsTotal as totalHours')
                .first();
            const totalHours = sessionsResult.totalHours || 0;
            await trx('dossier')
                .where({ dossierID })
                .update({
                    status: 'Terminé',
                    dateClosed: new Date().toISOString()
                });
            const hourlyRate = 50;
            const dateLimite = new Date();
            dateLimite.setDate(dateLimite.getDate() + 30);
            const [factureID] = await trx('facture').insert({
                dossierID,
                montant: Math.round(totalHours * hourlyRate * 100) / 100,
                status: 'Non payée',
                dateCreated: new Date().toISOString(),
                dateLimite: dateLimite.toISOString()
            });
            return {
                totalHours,
                factureID
            };
        });
        return result;
    } catch (error) {
        console.error('Error in closeDossier:', error);
        throw new Error(`Échec de fermeture du dossier: ${error.message}`);
    }
}

module.exports = {
    createDossier,
    linkClientToDossier,
    closeDossier
};