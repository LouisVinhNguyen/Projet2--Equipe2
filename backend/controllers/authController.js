const db = require('../config/db');
const procedures = require('../models/procedures/proceduresUser');
const bcrypt = require('bcrypt');
const { jwt, SECRET_KEY } = require('../config/auth');
const { validateEmail, validateTelephone } = require('../utils/validators');

// Register a new avocat (lawyer)
const registerAvocat = async (req, res) => {
  const { prenom, nom, email, telephone, password } = req.body;

  if (!prenom || !nom || !email || !telephone || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  if (!validateTelephone(telephone)) {
    return res.status(400).json({ error: "Format de téléphone invalide" });
  }

  try {
    const existingUser = await db("users").where({ email, role: 'avocat' }).first();
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Un avocat avec cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await procedures.createAvocat(
      prenom, 
      nom, 
      email, 
      telephone, 
      hashedPassword
    );

    res.status(201).json({ avocatUserID: result.userID });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création de l'avocat.",
      error: error.message,
    });
  }
};

// Register a new client
const registerClient = async (req, res) => {
  const { prenom, nom, email, telephone, password } = req.body;

  if (!prenom || !nom || !email || !telephone || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  if (!validateTelephone(telephone)) {
    return res.status(400).json({ error: "Format de téléphone invalide" });
  }

  try {
    const existingUser = await db("users").where({ email, role: 'client' }).first();
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Un client avec cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await procedures.createClient(
      prenom, 
      nom, 
      email, 
      telephone, 
      hashedPassword
    );

    res.status(201).json({ clientUserID: result.userID });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création du client.",
      error: error.message,
    });
  }
};

// Register a new admin
const registerAdmin = async (req, res) => {
  const { prenom, nom, email, telephone, password } = req.body;

  if (!prenom || !nom || !email || !telephone || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  if (!validateTelephone(telephone)) {
    return res.status(400).json({ error: "Format de téléphone invalide" });
  }

  try {
    const existingUser = await db("users").where({ email, role: 'admin' }).first();
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Un admin avec cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await procedures.createAdmin(
      prenom, 
      nom, 
      email, 
      telephone, 
      hashedPassword
    );

    res.status(201).json({ adminUserID: result.userID });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création de l'admin.",
      error: error.message,
    });
  }
};

// Login avocat
const loginAvocat = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  try {
    const avocat = await db("users")
      .where({ email, role: 'avocat' })
      .first();

    if (!avocat) {
      return res
        .status(401)
        .json({ message: "L'email saisie ne correspond à aucun avocat." });
    }

    const isMatch = await bcrypt.compare(password, avocat.password);

    if (!isMatch) {
      // Mot de passe incorrect
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { userID: avocat.userID, email: avocat.email, role: "avocat" },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("Avocat authentifié :", avocat.email);
    
    // Envoyer le token au client
    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
};

// Login client
const loginClient = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  try {
    const client = await db("users")
      .where({ email, role: 'client' })
      .first();

    if (!client) {
      return res
        .status(401)
        .json({ message: "L'email saisie ne correspond à aucun client." });
    }

    const isMatch = await bcrypt.compare(password, client.password);

    if (!isMatch) {
      // Mot de passe incorrect
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { userID: client.userID, email: client.email, role: "client" },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("Client authentifié :", client.email);
    
    // Envoyer le token au client
    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
};

// Login admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  try {
    const admin = await db("users")
      .where({ email, role: 'admin' })
      .first();

    if (!admin) {
      return res
        .status(401)
        .json({ message: "L'email saisie ne correspond à aucun administrateur." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      // Mot de passe incorrect
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { userID: admin.userID, email: admin.email, role: "admin" },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("Admin authentifié :", admin.email);
    
    // Envoyer le token au client
    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
};

module.exports = {
  registerAvocat,
  registerClient,
  registerAdmin,
  loginAvocat,
  loginClient,
  loginAdmin
};