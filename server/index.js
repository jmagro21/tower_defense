require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

// Sécurité HTTP headers
let helmet;
try {
  helmet = require('helmet');
} catch (e) {
  console.warn('⚠️ helmet non installé, headers de sécurité désactivés. Installer avec: npm i helmet');
}

const authRoutes = require('./routes/auth');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://tower.games.heimdall-security.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
if (helmet) {
  app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour Phaser.js
    crossOriginEmbedderPolicy: false
  }));
}

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://tower.games.heimdall-security.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (même serveur, outils)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS non autorisé'));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limiter la taille du body JSON (anti-DoS)
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Configuration des MIME types pour les fichiers statiques
app.use(express.static(path.join(__dirname, '../client'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);

// Vérification du JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret') {
  console.warn('⚠️ SÉCURITÉ: JWT_SECRET non défini ou trop faible ! Définir une clé forte dans .env');
}

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tower-defense')
  .then(() => console.log('✓ Connecté à MongoDB'))
  .catch(err => console.error('✗ Erreur MongoDB:', err));

// Gestion des sockets
socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✓ Serveur démarré sur le port ${PORT}`);
  console.log(`✓ Client accessible sur http://localhost:${PORT}`);
});
