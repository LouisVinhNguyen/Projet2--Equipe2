const db = require('../config/db');
const procedures = require('../models/procedures/proceduresUser');
const { validateEmail, validateTelephone } = require('../utils/validators');
const bcrypt = require('bcrypt');

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const clients = await db("users").where({ role: 'client' }).select("*");
    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des clients.",
      error: error.message,
    });
  }
};

// Get clients by avocat ID
const getClientsByAvocatId = async (req, res) => {
  const { avocatUserID } = req.params;

  try {
    // Get client IDs from client_dossier join with dossier where avocatUserID matches
    const clients = await db("users")
      .select("users.*")
      .where("users.role", "client")
      .whereIn("users.userID", function() {
        this.select("client_dossier.clientUserID")
          .distinct()
          .from("client_dossier")
          .join("dossier", "dossier.dossierID", "client_dossier.dossierID")
          .where("dossier.avocatUserID", avocatUserID);
      });

    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des clients.",
      error: error.message,
    });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await db("users")
      .where({ userID: id, role: 'client' })
      .first();

    if (!client) {
      return res.status(404).json({ message: "Client introuvable." });
    }

    // Remove sensitive information
    delete client.password;
    
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération du client.",
      error: error.message,
    });
  }
};

// Update a client
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { prenom, nom, email, telephone } = req.body;

  if (!prenom || !nom || !email || !telephone) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  if (!validateTelephone(telephone)) {
    return res.status(400).json({ error: "Format de téléphone invalide" });
  }

  try {
    // Check if the client exists
    const existingClient = await db("users")
      .where({ userID: id, role: 'client' })
      .first();
      
    if (!existingClient) {
      return res.status(404).json({ message: "Client introuvable." });
    }

    // Check if email is already in use by another user
    const duplicateEmail = await db("users")
      .where({ email })
      .whereNot({ userID: id })
      .first();
      
    if (duplicateEmail) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // Update the client
    await db("users")
      .where({ userID: id, role: 'client' })
      .update({ prenom, nom, email, telephone });
      
    res.status(200).json({ message: "Client modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification du client.",
      error: error.message,
    });
  }
};

// Delete a client
const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    // Use the deleteClient function from procedures.js
    const result = await procedures.deleteUser(id);
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error(error);
    
    // Handle specific error messages
    if (error.message.includes("Client introuvable")) {
      return res.status(404).json({ message: "Client introuvable." });
    }
    if (error.message.includes("ne peut pas être supprimé car il est associé à")) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({
      message: "Erreur lors de la suppression du client.",
      error: error.message,
    });
  }
};

// Change client password
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Mot de passe actuel et nouveau sont requis" });
  }

  try {
    // Check if the client exists
    const client = await db("users")
      .where({ userID: id, role: 'client' })
      .first();
      
    if (!client) {
      return res.status(404).json({ message: "Client introuvable." });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await db("users")
      .where({ userID: id, role: 'client' })
      .update({ password: hashedPassword });
      
    res.status(200).json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification du mot de passe.",
      error: error.message,
    });
  }
};

// Get client dossiers
const getClientDossiers = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the client exists
    const existingClient = await db("users")
      .where({ userID: id, role: 'client' })
      .first();
      
    if (!existingClient) {
      return res.status(404).json({ message: "Client introuvable." });
    }

    // Get all dossiers associated with the client
    const clientDossiers = await db("client_dossier")
      .where({ clientUserID: id })
      .join("dossier", "client_dossier.dossierID", "dossier.dossierID")
      .select("dossier.*");
      
    res.status(200).json(clientDossiers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des dossiers du client.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllClients,
  getClientsByAvocatId,
  getClientById,
  updateClient,
  deleteClient,
  changePassword,
  getClientDossiers
};