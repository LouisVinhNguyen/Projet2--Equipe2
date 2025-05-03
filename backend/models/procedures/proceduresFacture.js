const db = require('../../config/db');

// Create a new invoice (facture)
async function createFacture(dossierID, timeWorked, hourlyRate) {
    try {
        const dossierExists = await db('dossier').where({ dossierID }).first();
        if (!dossierExists) {
            throw new Error('ID de dossier inexistant.');
        }
        const montant = Math.round(timeWorked * hourlyRate * 100) / 100;
        const dateCreated = new Date();
        const dateLimite = new Date();
        dateLimite.setDate(dateCreated.getDate() + 30);
        const status = 'Non payée';
        const [factureID] = await db('facture').insert({
            dossierID,
            montant,
            status,
            dateCreated: dateCreated.toISOString(),
            dateLimite: dateLimite.toISOString()
        });
        const facture = {
            factureID,
            dossierID,
            montant,
            status,
            dateCreated: dateCreated.toISOString(),
            dateLimite: dateLimite.toISOString()
        };
        return facture;
    } catch (error) {
        console.error('Error in createFacture:', error);
        throw new Error(`Échec de création de la facture: ${error.message}`);
    }
}

module.exports = {
    createFacture
};