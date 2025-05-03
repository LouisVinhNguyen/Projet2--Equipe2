const db = require('../../config/db');

// Create a new payment (paiement)
async function createPaiement(factureID, montant, paiementDate, methode, status) {
    try {
        // Check if facture exists
        const facture = await db('facture').where({ factureID }).first();
        if (!facture) {
            throw new Error('Facture introuvable.');
        }
        // Insert the new payment
        const [paiementID] = await db('paiement').insert({
            factureID,
            montant,
            paiementDate,
            methode,
            status
        });
        return { paiementID };
    } catch (error) {
        console.error('Error in createPaiement:', error);
        throw new Error(`Échec de création du paiement: ${error.message}`);
    }
}

module.exports = {
    createPaiement,
};
