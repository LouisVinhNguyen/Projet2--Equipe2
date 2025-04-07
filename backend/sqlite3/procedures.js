const db = require('../knex');

/**
 * 1. Create a new user (client, avocat, or admin)
 * @param {string} prenom - First name
 * @param {string} nom - Last name
 * @param {string} email - Email address
 * @param {string} telephone - Phone number
 * @param {string} password - Password (hashed)
 * @param {string} role - User role ('client', 'avocat', or 'admin')
 * @returns {Promise<Object>} The new user ID
 */
async function createUser(prenom, nom, email, telephone, password, role) {
    try {
        // Validate role
        const validRoles = ['client', 'avocat', 'admin'];
        if (!validRoles.includes(role)) {
            throw new Error(`Role invalide. Doit être l'un des suivants: ${validRoles.join(', ')}`);
        }

        const [userID] = await db('users').insert({
            prenom,
            nom,
            email,
            telephone,
            password,
            role
        });
        
        return { userID };
    } catch (error) {
        console.error(`Error in createUser (${role}):`, error);
        throw new Error(`Échec de création de l'utilisateur: ${error.message}`);
    }
}

/**
 * 3. Create a new dossier (case file)
 * @param {number} avocatUserID - Lawyer user ID
 * @param {string} dossierNom - Case name
 * @param {string} dossierType - Case type
 * @param {string} description - Case description
 * @param {number|null} clientUserID - Optional client user ID to link
 * @returns {Promise<Object>} The new dossier ID
 */
async function createDossier(avocatUserID, dossierNom, dossierType, description, clientUserID = null) {
    try {
        // Check if the user exists and is an avocat
        const avocat = await db('users').where({ userID: avocatUserID, role: 'avocat' }).first();
        if (!avocat) {
            throw new Error('L\'utilisateur spécifié n\'existe pas ou n\'est pas un avocat.');
        }
        
        // Begin transaction
        const result = await db.transaction(async trx => {
            // Insert dossier with default status
            const [dossierID] = await trx('dossier').insert({
                avocatUserID,
                dossierNom,
                status: 'En cours',
                dossierType,
                description,
                dateCreated: new Date().toISOString()
            });
            
            // If client ID provided, verify it's a client and link to the dossier
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

/**
 * 4. Create a new document
 * @param {number} userID - User ID (avocat or client)
 * @param {string} documentNom - Document name
 * @param {string} description - Document description
 * @param {string} fichier - Document file URL
 * @param {number|null} dossierID - Optional dossier ID to link
 * @returns {Promise<Object>} The new document ID
 */
async function createDocument(userID, documentNom, description, fichier, dossierID = null) {
    try {
        // Check if the user exists
        const user = await db('users').where({ userID }).first();
        if (!user) {
            throw new Error('L\'utilisateur spécifié n\'existe pas.');
        }
        
        // Begin transaction
        const result = await db.transaction(async trx => {
            // Insert document
            const [documentID] = await trx('document').insert({
                userID,
                documentNom,
                description,
                fichier,
                dateCreated: new Date().toISOString()
            });
            
            // If dossier ID provided, link the document to the dossier
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

/**
 * 5. Create a new session (start time tracking)
 * @param {number} userID - User ID (typically an avocat)
 * @param {number} dossierID - Dossier ID
 * @param {string} description - Session description
 * @returns {Promise<Object>} The new session ID
 */
async function createSession(userID, dossierID, description) {
    try {
        // Check if user exists and is an avocat
        const user = await db('users').where({ userID }).first();
        if (!user) {
            throw new Error('L\'utilisateur spécifié n\'existe pas.');
        }
        
        // Check if dossier exists
        const dossier = await db('dossier').where({ dossierID }).first();
        if (!dossier) {
            throw new Error('Le dossier spécifié n\'existe pas.');
        }

        const [sessionID] = await db('session').insert({
            userID,
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
 * @param {number} userID - User ID (typically an avocat)
 * @param {number} dossierID - Dossier ID
 * @param {string} documentNom - Document name
 * @param {string} description - Task description
 * @param {string} status - Task status
 * @returns {Promise<Object>} The new task ID
 */
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

/**
 * Update an existing task
 * @param {number} tacheID - Task ID to update
 * @param {number} userID - User ID
 * @param {number} dossierID - Dossier ID
 * @param {string} documentNom - Document name
 * @param {string} description - Task description
 * @param {string} status - Task status
 * @returns {Promise<Object>} Confirmation message
 */
async function updateTache(tacheID, userID, dossierID, documentNom, description, status) {
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
            
            // Check if the user exists
            const existingUser = await trx('users').where({ userID }).first();
            if (!existingUser) {
                throw new Error('L\'utilisateur spécifié n\'existe pas');
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

/**
 * 8. Link a client to a dossier
 * @param {number} clientUserID - Client user ID
 * @param {number} dossierID - Dossier ID
 * @returns {Promise<Object>} Confirmation details
 */
async function linkClientToDossier(clientUserID, dossierID) {
    try {
        // Check if client exists and has the correct role
        const clientExists = await db('users').where({ userID: clientUserID, role: 'client' }).first();
        if (!clientExists) {
            throw new Error('ID de client inexistant ou l\'utilisateur n\'est pas un client.');
        }
        
        // Check if dossier exists
        const dossierExists = await db('dossier').where({ dossierID }).first();
        if (!dossierExists) {
            throw new Error('ID de dossier inexistant.');
        }
        
        // Check if relationship already exists
        const linkExists = await db('client_dossier')
            .where({ clientUserID, dossierID })
            .first();
            
        if (linkExists) {
            throw new Error('Le client est déjà lié à ce dossier.');
        }
        
        // Create the link
        await db('client_dossier').insert({ clientUserID, dossierID });
        
        // Return confirmation with details
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

/**
 * 9. Create a reminder
 * @param {number} userID - User ID
 * @param {string} rappelNom - Reminder name
 * @param {string} description - Reminder description
 * @param {string} dateAnnonce - Announcement date (ISO string)
 * @returns {Promise<Object>} The created reminder details
 */
async function createRappel(userID, rappelNom, description, dateAnnonce) {
    try {
        // Check if user exists
        const userExists = await db('users').where({ userID }).first();
        if (!userExists) {
            throw new Error('ID d\'utilisateur inexistant.');
        }
        
        // Validate that announcement date is in the future
        const announcementDate = new Date(dateAnnonce);
        const currentDate = new Date();
        
        if (announcementDate <= currentDate) {
            throw new Error('La date d\'annonce doit être dans le futur.');
        }
        
        // Create the rappel
        const [rappelID] = await db('rappel').insert({
            userID,
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
 * 11. Delete a user and related records
 * @param {number} userID - User ID to delete
 * @returns {Promise<Object>} Confirmation message
 */
async function deleteUser(userID) {
    try {
        // Check if user exists
        const user = await db('users').where({ userID }).first();
        if (!user) {
            throw new Error('Utilisateur introuvable');
        }

        // Begin transaction to ensure all operations succeed or fail together
        await db.transaction(async trx => {
            if (user.role === 'client') {
                // Delete related records in client_dossier if user is a client
                await trx('client_dossier')
                    .where({ clientUserID: userID })
                    .del();
            }
            
            // Delete any documents created by the user
            const documents = await trx('document').where({ userID }).select('documentID');
            for (const doc of documents) {
                await trx('dossier_document')
                    .where({ documentID: doc.documentID })
                    .del();
                
                await trx('document')
                    .where({ documentID: doc.documentID })
                    .del();
            }
            
            // Delete sessions created by the user
            await trx('session')
                .where({ userID })
                .del();
                
            // Delete tasks created by the user
            await trx('tache')
                .where({ userID })
                .del();
                
            // Delete reminders created by the user
            await trx('rappel')
                .where({ userID })
                .del();
                
            // Delete the user
            await trx('users')
                .where({ userID })
                .del();
        });
        
        return { message: `Utilisateur (${user.role}) et enregistrements associés supprimés avec succès.` };
    } catch (error) {
        console.error('Error in deleteUser:', error);
        throw new Error(`Échec de suppression de l'utilisateur: ${error.message}`);
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

// Helper functions for client and avocat creation using the unified user creation function
async function createClient(prenom, nom, email, telephone, password) {
    return createUser(prenom, nom, email, telephone, password, 'client');
}

async function createAvocat(prenom, nom, email, telephone, password) {
    return createUser(prenom, nom, email, telephone, password, 'avocat');
}

async function createAdmin(prenom, nom, email, telephone, password) {
    return createUser(prenom, nom, email, telephone, password, 'admin');
}

module.exports = {
    createUser,
    createClient,
    createAvocat,
    createAdmin,
    createDossier,
    createDocument,
    createSession,
    endSession,
    createTache,
    updateTache,
    linkClientToDossier,
    createRappel,
    linkDocumentToDossier,
    deleteUser,
    deleteDocument,
    createFacture,
    closeDossier
};