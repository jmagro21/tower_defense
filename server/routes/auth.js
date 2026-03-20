const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ========================================
// ANTI-BRUTE-FORCE: Rate limiter simple par IP
// ========================================
const loginAttempts = new Map(); // IP -> { count, lastAttempt }

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const data = loginAttempts.get(ip);
  
  if (!data) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset après 60 secondes
  if (now - data.lastAttempt > 60000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  data.count++;
  data.lastAttempt = now;
  return data.count <= 10; // Max 10 tentatives par minute
}

// Nettoyage périodique (toutes les 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > 300000) loginAttempts.delete(ip);
  }
}, 300000);

// Validation des entrées utilisateur
function validateUsername(username) {
  if (typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 20) return false;
  // Seulement alphanumérique, tirets et underscores
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

function validatePassword(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 6 && password.length <= 128;
}

// Inscription
router.post('/register', async (req, res) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!checkLoginRateLimit(clientIP)) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 1 minute.' });
    }

    const { username, password } = req.body;

    // Validation des entrées
    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Nom d\'utilisateur invalide (3-20 caractères, alphanumérique, - et _ autorisés)' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Mot de passe invalide (6-128 caractères)' });
    }

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
      secure: process.env.NODE_ENV === 'production',  // HTTPS uniquement en prod
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
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
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!checkLoginRateLimit(clientIP)) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 1 minute.' });
    }

    const { username, password } = req.body;

    // Validation basique des entrées
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Identifiants invalides' });
    }

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
      secure: process.env.NODE_ENV === 'production',  // HTTPS uniquement en prod
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
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
    const user = await User.findById(decoded.userId).select('-password');
    
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

// Déconnexion - supprime le cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  res.json({ success: true });
});

module.exports = router;
