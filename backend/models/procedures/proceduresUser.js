const db = require('../../config/db');

// Create a new user (client, avocat, or admin)
async function createUser(prenom, nom, email, telephone, password, role) {
    try {
        const validRoles = ['client', 'avocat', 'admin'];
        if (!validRoles.includes(role)) {
            throw new Error(`Role invalide. Doit être l'un des suivants: ${validRoles.join(', ')}`);
        }
        const [userID] = await db('users').insert({ prenom, nom, email, telephone, password, role });
        return { userID };
    } catch (error) {
        console.error(`Error in createUser (${role}):`, error);
        throw new Error(`Échec de création de l'utilisateur: ${error.message}`);
    }
}

// Helper functions for client, avocat, admin creation
async function createClient(prenom, nom, email, telephone, password) {
    return createUser(prenom, nom, email, telephone, password, 'client');
}
async function createAvocat(prenom, nom, email, telephone, password) {
    return createUser(prenom, nom, email, telephone, password, 'avocat');
}
async function createAdmin(prenom, nom, email, telephone, password) {
    return createUser(prenom, nom, email, telephone, password, 'admin');
}

// Delete a user and related records
async function deleteUser(userID) {
    try {
        const user = await db('users').where({ userID }).first();
        if (!user) {
            throw new Error('Utilisateur introuvable');
        }
        await db.transaction(async trx => {
            if (user.role === 'client') {
                await trx('client_dossier').where({ clientUserID: userID }).del();
            }
            const documents = await trx('document').where({ userID }).select('documentID');
            for (const doc of documents) {
                await trx('dossier_document').where({ documentID: doc.documentID }).del();
                await trx('document').where({ documentID: doc.documentID }).del();
            }
            await trx('session').where({ userID }).del();
            await trx('tache').where({ userID }).del();
            await trx('rappel').where({ userID }).del();
            await trx('users').where({ userID }).del();
        });
        return { message: `Utilisateur (${user.role}) et enregistrements associés supprimés avec succès.` };
    } catch (error) {
        console.error('Error in deleteUser:', error);
        throw new Error(`Échec de suppression de l'utilisateur: ${error.message}`);
    }
}

module.exports = {
    createUser,
    createClient,
    createAvocat,
    createAdmin,
    deleteUser
};