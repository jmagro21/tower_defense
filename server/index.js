require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

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
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://tower.games.heimdall-security.com',
    'https://51.91.59.45'  // Whitelist IP de prod
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handler OPTIONS explicite pour les preflight requests (compatible Express 5+)
app.use(cors());

app.use(express.json());
app.use(cookieParser());

// Content Security Policy pour permettre les CDN
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.socket.io; connect-src 'self' https://tower.games.heimdall-security.com wss://tower.games.heimdall-security.com ws://localhost:* http://localhost:*"
  );
  next();
});

app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', authRoutes);

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
