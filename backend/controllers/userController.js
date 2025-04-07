const db = require('../config/db');
const procedures = require('../models/procedures');
const { validateEmail, validateTelephone } = require('../utils/validators');
const bcrypt = require('bcrypt');

// Check if email exists
const checkEmailExists = async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }
  
  try {
    const user = await db("users").where({ email }).first();
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Erreur lors de la vérification de l'email",
      error: error.message 
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await db("users").select("*");
    
    // Remove sensitive information
    users.forEach(user => delete user.password);
    
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs.",
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db("users")
      .where({ userID: id })
      .first();

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Remove sensitive information
    delete user.password;
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'utilisateur.",
      error: error.message,
    });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { prenom, nom, email, telephone, password, role } = req.body;

  if (!prenom || !nom || !email || !telephone || !password || !role) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  if (!validateTelephone(telephone)) {
    return res.status(400).json({ error: "Format de téléphone invalide" });
  }

  try {
    // Check if email is already in use
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await procedures.createUser(
      prenom, 
      nom, 
      email, 
      telephone, 
      hashedPassword,
      role
    );

    res.status(201).json({ userID: result.userID });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur.",
      error: error.message,
    });
  }
};

// Update a user
const updateUser = async (req, res) => {
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
    // Check if user exists
    const existingUser = await db("users")
      .where({ userID: id })
      .first();
      
    if (!existingUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Check if email is already in use by another user
    const duplicateEmail = await db("users")
      .where({ email })
      .whereNot({ userID: id })
      .first();
      
    if (duplicateEmail) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // Update the user
    await db("users")
      .where({ userID: id })
      .update({ prenom, nom, email, telephone });
      
    res.status(200).json({ message: "Utilisateur modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification de l'utilisateur.",
      error: error.message,
    });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Use the deleteUser function from procedures.js
    const result = await procedures.deleteUser(id);
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error(error);
    
    // Handle specific error messages
    if (error.message.includes("Utilisateur introuvable")) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    if (error.message.includes("ne peut pas être supprimé car il est associé à")) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur.",
      error: error.message,
    });
  }
};

// Change user password
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Mot de passe actuel et nouveau sont requis" });
  }

  try {
    // Check if the user exists
    const user = await db("users")
      .where({ userID: id })
      .first();
      
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await db("users")
      .where({ userID: id })
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

// Get users by role
const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const users = await db("users")
      .where({ role })
      .select("*");
    
    // Remove sensitive information
    users.forEach(user => delete user.password);
    
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs.",
      error: error.message,
    });
  }
};

module.exports = {
  checkEmailExists,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getUsersByRole
};