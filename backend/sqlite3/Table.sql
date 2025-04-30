-- Drop tables if they exist
DROP TABLE IF EXISTS client_dossier;
DROP TABLE IF EXISTS dossier_document;
DROP TABLE IF EXISTS tache;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS rappel;
DROP TABLE IF EXISTS paiement;
DROP TABLE IF EXISTS facture;
DROP TABLE IF EXISTS document;
DROP TABLE IF EXISTS dossier;
DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS avocat;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS message;

-- Create unified users table
CREATE TABLE users (
    userID INTEGER PRIMARY KEY AUTOINCREMENT,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telephone TEXT,
    password TEXT,
    role TEXT CHECK(role IN ('client', 'avocat', 'admin')) NOT NULL,
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the dossier table
CREATE TABLE dossier (
    dossierID INTEGER PRIMARY KEY AUTOINCREMENT,
    avocatUserID INTEGER NOT NULL,
    dossierNom TEXT NOT NULL,
    status TEXT CHECK(status IN ('En cours', 'En attente', 'Terminé', 'Annulé', 'En attente d''approbation')) NOT NULL,
    dossierType TEXT NOT NULL,
    description TEXT NOT NULL,
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateClosed TIMESTAMP,
    FOREIGN KEY (avocatUserID) REFERENCES users(userID)
);

-- Create the document table
CREATE TABLE document (
    documentID INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    documentNom TEXT NOT NULL,
    description TEXT NOT NULL,
    fichier TEXT NOT NULL, -- Storing URLs as TEXT
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES users(userID)
);

-- Create the facture table
CREATE TABLE facture (
    factureID INTEGER PRIMARY KEY AUTOINCREMENT,
    dossierID INTEGER NOT NULL,
    montant REAL NOT NULL,
    status TEXT CHECK(status IN ('Non payée', 'Partiellement payée', 'Payée', 'En retard', 'Annulée')) NOT NULL,
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateLimite TIMESTAMP NOT NULL,
    FOREIGN KEY (dossierID) REFERENCES dossier(dossierID)
);

-- Create the paiement table
CREATE TABLE paiement (
    paiementID INTEGER PRIMARY KEY AUTOINCREMENT,
    factureID INTEGER NOT NULL,
    montant REAL NOT NULL,
    paiementDate TIMESTAMP NOT NULL,
    methode TEXT NOT NULL,
    status TEXT CHECK(status IN ('En attente', 'Terminé', 'Échoué', 'Remboursé', 'Annulé')) NOT NULL,
    FOREIGN KEY (factureID) REFERENCES facture(factureID)
);

-- Create the rappel table
CREATE TABLE rappel (
    rappelID INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    rappelNom TEXT NOT NULL,
    description TEXT NOT NULL,
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateAnnonce TIMESTAMP NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID)
);

-- Create the session table
CREATE TABLE session (
    sessionID INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    dossierID INTEGER NOT NULL,
    clockInTime TIMESTAMP NOT NULL,
    clockOutTime TIMESTAMP,
    tempsTotal REAL NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (dossierID) REFERENCES dossier(dossierID)
);

-- Create the tache table
CREATE TABLE tache (
    tacheID INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    dossierID INTEGER NOT NULL,
    documentNom TEXT NOT NULL,
    description TEXT NOT NULL,
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('Non commencée', 'En cours', 'Terminée', 'Bloquée', 'Annulée')) NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (dossierID) REFERENCES dossier(dossierID)
);

-- Create the client_dossier junction table
CREATE TABLE client_dossier (
    clientUserID INTEGER NOT NULL,
    dossierID INTEGER NOT NULL,
    PRIMARY KEY (clientUserID, dossierID),
    FOREIGN KEY (clientUserID) REFERENCES users(userID),
    FOREIGN KEY (dossierID) REFERENCES dossier(dossierID)
);

-- Create the dossier_document junction table
CREATE TABLE dossier_document (
    dossierID INTEGER NOT NULL,
    documentID INTEGER NOT NULL,
    PRIMARY KEY (dossierID, documentID),
    FOREIGN KEY (dossierID) REFERENCES dossier(dossierID),
    FOREIGN KEY (documentID) REFERENCES document(documentID)
);

-- Create the message table
CREATE TABLE message (
    messageID INTEGER PRIMARY KEY AUTOINCREMENT,
    senderID INTEGER NOT NULL,
    receiverID INTEGER NOT NULL,
    contenu TEXT NOT NULL,
    dateSent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderID) REFERENCES users(userID),
    FOREIGN KEY (receiverID) REFERENCES users(userID)
);
