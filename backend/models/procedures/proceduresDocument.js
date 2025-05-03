const db = require('../../config/db');

// Create a new document
async function createDocument(userID, documentNom, description, fichier, dossierID = null) {
    try {
        const user = await db('users').where({ userID }).first();
        if (!user) {
            throw new Error('L\'utilisateur spécifié n\'existe pas.');
        }
        const result = await db.transaction(async trx => {
            const [documentID] = await trx('document').insert({
                userID,
                documentNom,
                description,
                fichier,
                dateCreated: new Date().toISOString()
            });
            if (dossierID !== null) {
                const dossier = await trx('dossier').where({ dossierID }).first();
                if (!dossier) {
                    throw new Error('Le dossier spécifié n\'existe pas.');
                }
                await trx('dossier_document').insert({
                    dossierID,
                    documentID
                });
            }
            return documentID;
        });
        return { documentID: result };
    } catch (error) {
        console.error('Error in createDocument:', error);
        throw new Error(`Échec de création du document: ${error.message}`);
    }
}

// Link a document to a dossier
async function linkDocumentToDossier(documentID, dossierID) {
    try {
        const documentExists = await db('document').where({ documentID }).first();
        if (!documentExists) {
            throw new Error('ID de document inexistant.');
        }
        const dossierExists = await db('dossier').where({ dossierID }).first();
        if (!dossierExists) {
            throw new Error('ID de dossier inexistant.');
        }
        const linkExists = await db('dossier_document')
            .where({ documentID, dossierID })
            .first();
        if (linkExists) {
            throw new Error('Le document est déjà lié à ce dossier.');
        }
        await db('dossier_document').insert({ dossierID, documentID });
        const result = await db('dossier_document as dd')
            .join('document as doc', 'dd.documentID', 'doc.documentID')
            .join('dossier as d', 'dd.dossierID', 'd.dossierID')
            .where({ 'dd.documentID': documentID, 'dd.dossierID': dossierID })
            .select(
                'doc.documentID',
                'doc.documentNom',
                'd.dossierID',
                'd.dossierNom'
            )
            .first();
        return result;
    } catch (error) {
        console.error('Error in linkDocumentToDossier:', error);
        throw new Error(`Échec de liaison du document au dossier: ${error.message}`);
    }
}

// Delete a document and related records
async function deleteDocument(documentID) {
    try {
        await db.transaction(async trx => {
            await trx('dossier_document')
                .where({ documentID })
                .del();
            const deleted = await trx('document')
                .where({ documentID })
                .del();
            if (!deleted) {
                throw new Error('Document introuvable');
            }
        });
        return { message: 'Document et enregistrements associés supprimés avec succès.' };
    } catch (error) {
        console.error('Error in deleteDocument:', error);
        throw new Error(`Échec de suppression du document: ${error.message}`);
    }
}

module.exports = {
    createDocument,
    linkDocumentToDossier,
    deleteDocument
};