const db = require('../../config/db');

// Create a new task
async function createTache(userID, dossierID, documentNom, description, status) {
    try {
        // Check if user exists
        const user = await db('users').where({ userID }).first();
        if (!user) {
            throw new Error('L\'utilisateur spécifié n\'existe pas.');
        }
        // Check if dossier exists
        const dossier = await db('dossier').where({ dossierID }).first();
        if (!dossier) {
            throw new Error('Le dossier spécifié n\'existe pas.');
        }
        // Valid status values
        const validStatuses = ['Non commencée', 'En cours', 'Terminée', 'Bloquée', 'Annulée'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Statut invalide. Doit être l'un des suivants: ${validStatuses.join(', ')}`);
        }
        const [tacheID] = await db('tache').insert({
            userID,
            dossierID,
            documentNom,
            description,
            status,
            dateCreated: new Date().toISOString()
        });
        return { tacheID };
    } catch (error) {
        console.error('Error in createTache:', error);
        throw new Error(`Échec de création de la tâche: ${error.message}`);
    }
}

// Update an existing task
async function updateTache(tacheID, userID, dossierID, documentNom, description, status) {
    try {
        const validStatuses = ['Non commencée', 'En cours', 'Terminée', 'Bloquée', 'Annulée'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Statut invalide. Doit être l'un des suivants: ${validStatuses.join(', ')}`);
        }
        await db.transaction(async trx => {
            const existingTache = await trx('tache').where({ tacheID }).first();
            if (!existingTache) {
                throw new Error('Tâche introuvable');
            }
            const existingUser = await trx('users').where({ userID }).first();
            if (!existingUser) {
                throw new Error('L\'utilisateur spécifié n\'existe pas');
            }
            const existingDossier = await trx('dossier').where({ dossierID }).first();
            if (!existingDossier) {
                throw new Error('Le dossier spécifié n\'existe pas');
            }
            await trx('tache')
                .where({ tacheID })
                .update({
                    userID,
                    dossierID,
                    documentNom,
                    description,
                    status
                });
        });
        return { message: 'Tâche modifiée avec succès.' };
    } catch (error) {
        console.error('Error in updateTache:', error);
        throw new Error(`Échec de mise à jour de la tâche: ${error.message}`);
    }
}

module.exports = {
    createTache,
    updateTache
};