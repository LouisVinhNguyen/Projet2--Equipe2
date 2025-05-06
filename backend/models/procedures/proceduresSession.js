const db = require('../../config/db');

// Create a new session (start time tracking)
async function createSession(userID, dossierID, description) {
    try {
        const user = await db('users').where({ userID }).first();
        if (!user) {
            throw new Error('L\'utilisateur spécifié n\'existe pas.');
        }
        const dossier = await db('dossier').where({ dossierID }).first();
        if (!dossier) {
            throw new Error('Le dossier spécifié n\'existe pas.');
        }
        const existingSession = await db('session')
            .where({ userID, dossierID })
            .whereNull('clockOutTime')
            .first();
        if (existingSession) {
            throw new Error('Une session active existe déjà pour cet utilisateur et ce dossier.');
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

// End a session (stop time tracking)
async function endSession(sessionID) {
    try {
        const session = await db('session').where({ sessionID }).first();
        if (!session) {
            throw new Error('ID de session inexistant.');
        }
        if (session.clockOutTime) {
            throw new Error('Cette session est déjà terminée.');
        }
        const currentTime = new Date();
        const clockInTime = new Date(session.clockInTime);
        const tempsTotalHeures = (currentTime - clockInTime) / (1000 * 60 * 60);
        const updateData = {
            clockOutTime: currentTime.toISOString(),
            tempsTotal: tempsTotalHeures
        };
        await db('session')
            .where({ sessionID })
            .update(updateData);
        const updatedSession = await db('session')
            .where({ sessionID })
            .first();
        return updatedSession;
    } catch (error) {
        console.error('Error in endSession:', error);
        throw new Error(`Échec de fin de session: ${error.message}`);
    }
}

module.exports = {
    createSession,
    endSession
};