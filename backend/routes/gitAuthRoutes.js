// gitAuthRoutes.js
const express = require('express');
const axios = require('axios'); //npm install axios
const crypto = require('crypto'); //npm install crypto
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

const GITHUB_CLIENT_ID = 'Ov23liH92sJlNeHwKRPA';
const GITHUB_CLIENT_SECRET = 'd0ecc8df3171fd4936726b3e9ab6bab42cf71a19';
const GITHUB_REDIRECT_URI = 'http://localhost:3000/auth/callback';
const SALT_ROUNDS = 10;

// Route to handle GitHub OAuth callback
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  const role = req.query.state;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received.' });
  }

  try {
    // 1) Exchange code for access token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
        },
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: 'Failed to get access token.' });
    }

    // 2) Fetch user info
    const { data: userInfo } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    //Fetch emails
    const { data: emails } = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const email = emails.length ? emails[0].email : null;
    if (!email) {
      return res.status(400).json({ error: 'Unable to retrieve email from GitHub.' });
    }

    const login = userInfo.login;
    let [prenom, ...rest] = (userInfo.name || login).split(' ');
    const nom = rest.join(' ') || login;

    // Génére un mot de passe aléatoire pour l'utilisateur github
    const randomPass = crypto.randomBytes(5).toString('hex'); // 5 bytes → 10 hex chars

    const hashedPass = await bcrypt.hash(randomPass, SALT_ROUNDS);

    const userData = {
      prenom,
      nom,
      email,
      role,
      dateCreated: new Date().toISOString(),
      telephone: 'unknown',
      password: hashedPass,
    };

    await db('users').insert(userData);

    //Retourne le mot de passe généré au client
    res.status(201).json({
      message: 'Utilisateur ajouté avec succès à la base de données.',
      motDePasse: randomPass
    });

  } catch (err) {
    console.error('GitHub auth error:', err.response?.data || err.message);
    res.status(500).json({ error: "Erreur d'authentification GitHub" });
  }
});

module.exports = router;