const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris' });
    }

    // Créer l'utilisateur
    const user = new User({ username, password });
    await user.save();

    // Générer token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Envoyer le token en cookie HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Vérifier le mot de passe
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Générer token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Envoyer le token en cookie HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vérifier le token
router.get('/verify', async (req, res) => {
  try {
    // Récupérer le token du cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;
