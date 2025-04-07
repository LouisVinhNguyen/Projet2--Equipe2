const db = require('../knex');

/**
 * 1. Create a new client
 * @param {string} prenom - First name
 * @param {string} nom - Last name
 * @param {string} email - Email address
 * @param {string} telephone - Phone number
 * @param {string} password - Password (hashed)
 * @returns {Promise<Object>} The new client ID
 */
async function createClient(prenom, nom, email, telephone, password) {
    try {
        const [clientID] = await db('client').insert({
            prenom,
            nom,
            email,
            telephone,
            password
        });
        
        return { clientID };
    } catch (error) {
        console.error('Error in createClient:', error);
        throw new Error(`Échec de création du client: ${error.message}`);
    }
}

/**
 * 2. Create a new lawyer
 * @param {string} prenom - First name
 * @param {string} nom - Last name
 * @param {string} email - Email address
 * @param {string} telephone - Phone number
 * @param {string} password - Password (hashed)
 * @returns {Promise<Object>} The new lawyer ID
 */
async function createAvocat(prenom, nom, email, telephone, password) {
    try {
        const [avocatID] = await db('avocat').insert({
            prenom,
            nom,
            email,
            telephone,
            password
        });
        
        return { avocatID };
    } catch (error) {
        console.error('Error in createAvocat:', error);
        throw new Error(`Échec de création de l'avocat: ${error.message}`);
    }
}

/**
 * 3. Create a new dossier (case file)
 * @param {number} avocatID - Lawyer ID
 * @param {string} dossierNom - Case name
 * @param {string} dossierType - Case type
 * @param {string} description - Case description
 * @param {number|null} clientID - Optional client ID to link
 * @returns {Promise<Object>} The new dossier ID
 */
async function createDossier(avocatID, dossierNom, dossierType, description, clientID = null) {
    try {
        // Begin transaction
        const result = await db.transaction(async trx => {
            // Insert dossier with default status
            const [dossierID] = await trx('dossier').insert({
                avocatID,
                dossierNom,
                status: 'En cours',
                dossierType,
                description,
                dateCreated: new Date().toISOString()
            });
            
            // If client ID provided, link the client to the dossier
            if (clientID !== null) {
                await trx('client_dossier').insert({
                    clientID,
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

/**
 * 4. Create a new document
 * @param {number} avocatID - Lawyer ID
 * @param {string} documentNom - Document name
 * @param {string} description - Document description
 * @param {string} fichier - Document file URL
 * @param {number|null} dossierID - Optional dossier ID to link
 * @returns {Promise<Object>} The new document ID
 */
async function createDocument(avocatID, documentNom, description, fichier, dossierID = null) {
    try {
        // Begin transaction
        const result = await db.transaction(async trx => {
            // Insert document
            const [documentID] = await trx('document').insert({
                avocatID,
                documentNom,
                description,
                fichier,
                dateCreated: new Date().toISOString()
            });
            
            // If dossier ID provided, link the document to the dossier
            if (dossierID !== null) {
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

/**
 * 5. Create a new session (start time tracking)
 * @param {number} avocatID - Lawyer ID
 * @param {number} dossierID - Dossier ID
 * @param {string} description - Session description
 * @returns {Promise<Object>} The new session ID
 */
async function createSession(avocatID, dossierID, description) {
    try {
        const [sessionID] = await db('session').insert({
            avocatID,
            dossierID,
            clockInTime: new Date().toISOString(),
            clockOutTime: null,
            tempsTotal: 0,
            description
        });
        
        return { sessionID };
    } catch (error) {
        console.error('Error in createSession:', error);
        throw new Error(`Échec de création de la session: ${error.message}`);
    }
}

/**
 * 6. End a session (stop time tracking)
 * @param {number} sessionID - Session ID
 * @param {string|null} description - Optional updated description
 * @returns {Promise<Object>} The updated session details
 */
async function endSession(sessionID, description = null) {
    try {
        // Check if session exists and is not already ended
        const session = await db('session').where({ sessionID }).first();
        
        if (!session) {
            throw new Error('ID de session inexistant.');
        }
        
        if (session.clockOutTime) {
            throw new Error('Cette session est déjà terminée.');
        }
        
        // Get current time and calculate total time in hours
        const currentTime = new Date();
        const clockInTime = new Date(session.clockInTime);
        const tempsTotalHeures = (currentTime - clockInTime) / (1000 * 60 * 60); // Convert milliseconds to hours
        
        // Update session with end time and calculated total time
        const updateData = {
            clockOutTime: currentTime.toISOString(),
            tempsTotal: tempsTotalHeures
        };
        
        // Add description if provided
        if (description !== null) {
            updateData.description = description;
        }
        
        await db('session')
            .where({ sessionID })
            .update(updateData);
        
        // Return updated session information
        const updatedSession = await db('session')
            .where({ sessionID })
            .first();
        
        return updatedSession;
    } catch (error) {
        console.error('Error in endSession:', error);
        throw new Error(`Échec de fin de session: ${error.message}`);
    }
}

/**
 * 7. Create a new task
 * @param {number} avocatID - Lawyer ID
 * @param {number} dossierID - Dossier ID
 * @param {string} documentNom - Document name
 * @param {string} description - Task description
 * @param {string} status - Task status
 * @returns {Promise<Object>} The new task ID
 */
async function createTache(avocatID, dossierID, documentNom, description, status) {
    try {
        // Valid status values
        const validStatuses = ['Non commencée', 'En cours', 'Terminée', 'Bloquée', 'Annulée'];
        
        if (!validStatuses.includes(status)) {
            throw new Error(`Statut invalide. Doit être l'un des suivants: ${validStatuses.join(', ')}`);
        }
        
        const [tacheID] = await db('tache').insert({
            avocatID,
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

/**
 * Update an existing task
 * @param {number} tacheID - Task ID to update
 * @param {number} avocatID - Lawyer ID
 * @param {number} dossierID - Dossier ID
 * @param {string} documentNom - Document name
 * @param {string} description - Task description
 * @param {string} status - Task status
 * @returns {Promise<Object>} Confirmation message
 */
async function updateTache(tacheID, avocatID, dossierID, documentNom, description, status) {
    try {
        // Valid status values
        const validStatuses = ['Non commencée', 'En cours', 'Terminée', 'Bloquée', 'Annulée'];
        
        if (!validStatuses.includes(status)) {
            throw new Error(`Statut invalide. Doit être l'un des suivants: ${validStatuses.join(', ')}`);
        }
        
        // Use a transaction to ensure data consistency
        await db.transaction(async trx => {
            // Check if task exists
            const existingTache = await trx('tache').where({ tacheID }).first();
            if (!existingTache) {
                throw new Error('Tâche introuvable');
            }
            
            // Check if the avocat exists
            const existingAvocat = await trx('avocat').where({ avocatID }).first();
            if (!existingAvocat) {
                throw new Error('L\'avocat spécifié n\'existe pas');
            }
            
            // Check if the dossier exists
            const existingDossier = await trx('dossier').where({ dossierID }).first();
            if (!existingDossier) {
                throw new Error('Le dossier spécifié n\'existe pas');
            }
            
            // Update the task
            await trx('tache')
                .where({ tacheID })
                .update({
                    avocatID,
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

// Don't forget to add this to the module.exports

/**
 * 8. Link a client to a dossier
 * @param {number} clientID - Client ID
 * @param {number} dossierID - Dossier ID
 * @returns {Promise<Object>} Confirmation details
 */
async function linkClientToDossier(clientID, dossierID) {
    try {
        // Check if client exists
        const clientExists = await db('client').where({ clientID }).first();
        if (!clientExists) {
            throw new Error('ID de client inexistant.');
        }
        
        // Check if dossier exists
        const dossierExists = await db('dossier').where({ dossierID }).first();
        if (!dossierExists) {
            throw new Error('ID de dossier inexistant.');
        }
        
        // Check if relationship already exists
        const linkExists = await db('client_dossier')
            .where({ clientID, dossierID })
            .first();
            
        if (linkExists) {
            throw new Error('Le client est déjà lié à ce dossier.');
        }
        
        // Create the link
        await db('client_dossier').insert({ clientID, dossierID });
        
        // Return confirmation with details
        const result = await db('client_dossier as cd')
            .join('client as c', 'cd.clientID', 'c.clientID')
            .join('dossier as d', 'cd.dossierID', 'd.dossierID')
            .where({ 'cd.clientID': clientID, 'cd.dossierID': dossierID })
            .select(
                'c.clientID',
                db.raw("c.nom || ', ' || c.prenom as clientNom"),
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

/**
 * 9. Create a reminder
 * @param {number} avocatID - Lawyer ID
 * @param {string} rappelNom - Reminder name
 * @param {string} description - Reminder description
 * @param {string} dateAnnonce - Announcement date (ISO string)
 * @returns {Promise<Object>} The created reminder details
 */
async function createRappel(avocatID, rappelNom, description, dateAnnonce) {
    try {
        // Check if avocat exists
        const avocatExists = await db('avocat').where({ avocatID }).first();
        if (!avocatExists) {
            throw new Error('ID d\'avocat inexistant.');
        }
        
        // Validate that announcement date is in the future
        const announcementDate = new Date(dateAnnonce);
        const currentDate = new Date();
        
        if (announcementDate <= currentDate) {
            throw new Error('La date d\'annonce doit être dans le futur.');
        }
        
        // Create the rappel
        const [rappelID] = await db('rappel').insert({
            avocatID,
            rappelNom,
            description,
            dateCreated: currentDate.toISOString(),
            dateAnnonce: announcementDate.toISOString()
        });
        
        // Return the created rappel
        const rappel = await db('rappel')
            .where({ rappelID })
            .first();
            
        return rappel;
    } catch (error) {
        console.error('Error in createRappel:', error);
        throw new Error(`Échec de création du rappel: ${error.message}`);
    }
}

/**
 * 10. Link a document to a dossier
 * @param {number} documentID - Document ID
 * @param {number} dossierID - Dossier ID
 * @returns {Promise<Object>} Confirmation details
 */
async function linkDocumentToDossier(documentID, dossierID) {
    try {
        // Check if document exists
        const documentExists = await db('document').where({ documentID }).first();
        if (!documentExists) {
            throw new Error('ID de document inexistant.');
        }
        
        // Check if dossier exists
        const dossierExists = await db('dossier').where({ dossierID }).first();
        if (!dossierExists) {
            throw new Error('ID de dossier inexistant.');
        }
        
        // Check if relationship already exists
        const linkExists = await db('dossier_document')
            .where({ documentID, dossierID })
            .first();
            
        if (linkExists) {
            throw new Error('Le document est déjà lié à ce dossier.');
        }
        
        // Create the link
        await db('dossier_document').insert({ dossierID, documentID });
        
        // Return confirmation with details
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

/**
 * 11. Delete a client and related records
 * @param {number} clientID - Client ID to delete
 * @returns {Promise<Object>} Confirmation message
 */
async function deleteClient(clientID) {
    try {
        // Begin transaction to ensure all operations succeed or fail together
        await db.transaction(async trx => {
            // Delete related records in client_dossier
            await trx('client_dossier')
                .where({ clientID })
                .del();
            
            // Delete the client
            const deleted = await trx('client')
                .where({ clientID })
                .del();
            
            if (!deleted) {
                throw new Error('Client introuvable');
            }
        });
        
        return { message: 'Client et enregistrements associés supprimés avec succès.' };
    } catch (error) {
        console.error('Error in deleteClient:', error);
        throw new Error(`Échec de suppression du client: ${error.message}`);
    }
}

/**
 * 12. Delete a document and related records
 * @param {number} documentID - Document ID to delete
 * @returns {Promise<Object>} Confirmation message
 */
async function deleteDocument(documentID) {
    try {
        // Begin transaction to ensure all operations succeed or fail together
        await db.transaction(async trx => {
            // Delete related records in dossier_document
            await trx('dossier_document')
                .where({ documentID })
                .del();
            
            // Delete the document
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

/**
 * 13. Create a new invoice (facture)
 * @param {number} dossierID - Dossier ID
 * @param {number} timeWorked - Time worked in hours
 * @param {number} hourlyRate - Hourly rate in dollars
 * @returns {Promise<Object>} The new invoice details
 */
async function createFacture(dossierID, timeWorked, hourlyRate) {
    try {
        // Check if dossier exists
        const dossierExists = await db('dossier').where({ dossierID }).first();
        if (!dossierExists) {
            throw new Error('ID de dossier inexistant.');
        }
        
        // Calculate total invoice amount
        const montant = timeWorked * hourlyRate;
        
        // Set creation date and due date (30 days from creation)
        const dateCreated = new Date();
        const dateLimite = new Date();
        dateLimite.setDate(dateCreated.getDate() + 30);
        
        // Set default status
        const status = 'Non payée';
        
        // Insert the new facture
        const [factureID] = await db('facture').insert({
            dossierID,
            montant,
            status,
            dateCreated: dateCreated.toISOString(),
            dateLimite: dateLimite.toISOString()
        });
        
        // Return the newly created facture details
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

/**
 * 14. Close a dossier and create invoice
 * @param {number} dossierID - Dossier ID to close
 * @returns {Promise<Object>} The total hours worked and operation result
 */
async function closeDossier(dossierID) {
    try {
        // Verify that the dossier exists
        const dossier = await db('dossier').where({ dossierID }).first();
        if (!dossier) {
            throw new Error('Le dossier spécifié n\'existe pas.');
        }
        
        // Check if the dossier is already closed
        if (dossier.status === 'Terminé') {
            throw new Error('Le dossier est déjà fermé.');
        }
        
        // Begin transaction
        const result = await db.transaction(async trx => {
            // Sum the total hours worked on this dossier from all closed sessions
            const sessionsResult = await trx('session')
                .where({ dossierID })
                .whereNotNull('clockOutTime')
                .sum('tempsTotal as totalHours')
                .first();
                
            const totalHours = sessionsResult.totalHours || 0;
            
            // Update dossier status to 'Terminé' and mark the dateClosed as current time
            await trx('dossier')
                .where({ dossierID })
                .update({
                    status: 'Terminé',
                    dateClosed: new Date().toISOString()
                });
                
            // Create invoice with total hours and default hourly rate of 50
            const hourlyRate = 50;
            
            // Insert the new facture
            const dateLimite = new Date();
            dateLimite.setDate(dateLimite.getDate() + 30);
            
            const [factureID] = await trx('facture').insert({
                dossierID,
                montant: totalHours * hourlyRate,
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
    createClient,
    createAvocat,
    createDossier,
    createDocument,
    createSession,
    endSession,
    createTache,
    updateTache,
    linkClientToDossier,
    createRappel,
    linkDocumentToDossier,
    deleteClient,
    deleteDocument,
    createFacture,
    closeDossier
};