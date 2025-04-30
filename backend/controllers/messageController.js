const db = require('../config/db');

// Envoyer un message
const sendMessage = async (req, res) => {
  const { senderID, receiverID, contenu } = req.body;

  if (!senderID || !receiverID || !contenu) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    await db("message").insert({
      senderID,
      receiverID,
      contenu
    });

    res.status(201).json({ message: "Message envoyé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'envoi du message.",
      error: error.message,
    });
  }
};

// Récupérer la conversation entre deux utilisateurs
const getConversation = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const conversation = await db("message")
      .where(function () {
        this.where({ senderID: user1, receiverID: user2 })
          .orWhere({ senderID: user2, receiverID: user1 });
      })
      .orderBy('dateSent', 'asc');

    res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la conversation.",
      error: error.message,
    });
  }
};

// Récupérer tous les messages d'un utilisateur (envoyés ou reçus)
const getUserMessages = async (req, res) => {
  const { userID } = req.params;

  try {
    const messages = await db("message")
      .leftJoin("users as sender", "message.senderID", "sender.userID")
      .leftJoin("users as receiver", "message.receiverID", "receiver.userID")
      .where(function () {
        this.where("senderID", userID).orWhere("receiverID", userID);
      })
      .select(
        "message.messageID",
        "sender.userID as senderID",
        "sender.prenom as senderPrenom",
        "sender.nom as senderNom",
        "sender.role as senderRole",      
        "receiver.userID as receiverID",
        "receiver.prenom as receiverPrenom",
        "receiver.nom as receiverNom",
        "receiver.role as receiverRole",  
        "message.contenu",
        "message.dateSent"
      )
      .orderBy("message.dateSent", "asc");

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des messages.",
      error: error.message,
    });
  }
};

// Supprimer un message
const deleteMessage = async (req, res) => {
  const { messageID } = req.params;

  try {
    const existingMessage = await db('message').where({ messageID }).first();

    if (!existingMessage) {
      return res.status(404).json({ message: "Message introuvable." });
    }

    await db('message').where({ messageID }).del();

    res.status(200).json({ message: "Message supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression du message.",
      error: error.message,
    });
  }
};

  

module.exports = {
  sendMessage,
  getConversation,
  getUserMessages,
  deleteMessage
};

