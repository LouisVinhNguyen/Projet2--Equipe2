const db = require('../../config/db');

// Create a new reminder (rappel)
async function createRappel(userID, rappelNom, description, dateAnnonce) {
    try {
        const userExists = await db('users').where({ userID }).first();
        if (!userExists) {
            throw new Error('ID d\'utilisateur inexistant.');
        }
        const announcementDate = new Date(dateAnnonce);
        const currentDate = new Date();
        if (announcementDate <= currentDate) {
            throw new Error('La date d\'annonce doit être dans le futur.');
        }
        const [rappelID] = await db('rappel').insert({
            userID,
            rappelNom,
            description,
            dateCreated: currentDate.toISOString(),
            dateAnnonce: announcementDate.toISOString()
        });
        const rappel = await db('rappel')
            .where({ rappelID })
            .first();
        return rappel;
    } catch (error) {
        console.error('Error in createRappel:', error);
        throw new Error(`Échec de création du rappel: ${error.message}`);
    }
}

module.exports = {
    createRappel
};