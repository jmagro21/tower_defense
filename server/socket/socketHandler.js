const jwt = require('jsonwebtoken');
const GameRoom = require('../game/GameRoom');
const { SOCKET_EVENTS, TOWER_TYPES, MONSTER_TYPES } = require('../../shared/constants');

const rooms = new Map(); // code -> GameRoom
const playerRooms = new Map(); // socketId -> room code
const disconnectedPlayers = new Map(); // odlSocketId -> { timeout, roomCode, userId, playerData }
const userToSocket = new Map(); // odlSocketId -> newSocketId (pour la reconnexion)

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {
    return null;
  }
}

module.exports = (io) => {
  // Boucle de mise à jour désactivée - spawn géré côté client
  // setInterval(() => {
  //   rooms.forEach(room => {
  //     if (room.state === 'playing') {
  //       room.update(io);
  //     }
  //   });
  // }, 100);

  io.on('connection', (socket) => {
    console.log(`Nouveau client connecté: ${socket.id}`);
    let currentUser = null;

    // Authentification - récupérer le token du cookie via handshake
    socket.on(SOCKET_EVENTS.LOGIN, ({ token } = {}) => {
      console.log(`🔐 Tentative d'authentification socket (${socket.id})`);
      
      // Essayer d'abord le token du paramètre (backward compatibility)
      // Sinon récupérer depuis les cookies du handshake
      let tokenToVerify = token;
      if (!tokenToVerify && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split('; ').reduce((acc, cookie) => {
          const [key, value] = cookie.split('=');
          acc[key] = value;
          return acc;
        }, {});
        tokenToVerify = cookies.token;
      }
      
      if (!tokenToVerify) {
        console.error(`✗ Aucun token trouvé pour ${socket.id}`);
        socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'Token manquant' });
        return;
      }
      
      const decoded = verifyToken(tokenToVerify);
      if (decoded) {
        currentUser = decoded;
        console.log(`✓ Socket authentifiée: ${decoded.username}`);
        
        // Vérifier si ce joueur était déconnecté et tente de se reconnecter
        let reconnected = false;
        for (const [oldSocketId, data] of disconnectedPlayers.entries()) {
          if (data.username === decoded.username) {
            // Annuler le timeout de déconnexion
            clearTimeout(data.timeout);
            disconnectedPlayers.delete(oldSocketId);
            
            // Restaurer la session du joueur
            const room = rooms.get(data.roomCode);
            if (room) {
              // Mettre à jour le socketId dans la room
              const playerData = room.players.get(oldSocketId);
              if (playerData) {
                room.players.delete(oldSocketId);
                room.players.set(socket.id, playerData);
              }
              
              // Mettre à jour les mappings
              playerRooms.set(socket.id, data.roomCode);
              socket.join(data.roomCode);
              
              console.log(`🔄 Joueur ${decoded.username} reconnecté au salon ${data.roomCode}`);
              
              // Informer le joueur de sa reconnexion
              socket.emit('RECONNECTED', {
                roomCode: data.roomCode,
                playerData: playerData,
                roomState: room.state
              });
              
              // Informer les autres joueurs
              socket.to(data.roomCode).emit('PLAYER_RECONNECTED', {
                username: decoded.username
              });
              
              reconnected = true;
            }
            break;
          }
        }
        
        socket.emit(SOCKET_EVENTS.AUTH_SUCCESS, { 
          username: decoded.username,
          reconnected: reconnected
        });
      } else {
        console.error(`✗ Token socket invalide (${socket.id})`);
        socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'Token invalide' });
      }
    });

    // Créer un salon
    socket.on(SOCKET_EVENTS.CREATE_ROOM, () => {
      if (!currentUser) {
        console.error(`❌ Tentative de création de salon sans authentification (socket: ${socket.id})`);
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Veuillez vous authentifier d\'abord' });
        return;
      }

      const code = generateRoomCode();
      const room = new GameRoom(code, currentUser.username);
      room.addPlayer(socket.id, currentUser.username);
      
      rooms.set(code, room);
      playerRooms.set(socket.id, code);
      socket.join(code);

      socket.emit(SOCKET_EVENTS.ROOM_CREATED, {
        code,
        players: room.getPlayerData(),
        isHost: true
      });
    });

    // Rejoindre un salon
    socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ code }) => {
      if (!currentUser) return;

      const room = rooms.get(code);
      if (!room) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Salon introuvable' });
        return;
      }

      if (room.state !== 'waiting') {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Partie déjà en cours' });
        return;
      }

      room.addPlayer(socket.id, currentUser.username);
      playerRooms.set(socket.id, code);
      socket.join(code);

      socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
        code,
        players: room.getPlayerData(),
        isHost: socket.id === room.host
      });

      // Notifier les autres joueurs
      socket.to(code).emit(SOCKET_EVENTS.PLAYER_JOINED, {
        username: currentUser.username,
        players: room.getPlayerData()
      });
    });

    // Changer la map (hôte uniquement)
    socket.on('CHANGE_MAP', ({ mapId }) => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);

      if (!room || room.host !== currentUser?.username) return;

      if (room.setMap(mapId)) {
        // Notifier tous les joueurs du changement de map
        io.to(roomCode).emit('MAP_CHANGED', {
          mapId: room.getMap()
        });
      }
    });

    // Démarrer la partie (hôte uniquement)
    socket.on(SOCKET_EVENTS.START_GAME, (data = {}) => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);

      if (!room || room.host !== currentUser?.username) return;

      if (room.players.size < 2) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Au moins 2 joueurs requis' });
        return;
      }

      // Appliquer les paramètres de configuration si fournis
      if (data.gameSettings) {
        const { startingMoney, maxHealth, monsterIntensity, rewardMultiplier, spawnSpeed } = data.gameSettings;
        
        // Appliquer les paramètres à chaque joueur
        room.players.forEach(player => {
          if (startingMoney !== undefined) {
            player.money = startingMoney;
          }
          if (maxHealth !== undefined) {
            player.maxHealth = maxHealth;
          }
        });
        
        // Stocker les paramètres globaux dans la room
        room.gameSettings = {
          startingMoney: startingMoney || 500,
          maxHealth: maxHealth || 20,
          monsterIntensity: monsterIntensity || 1.0,
          rewardMultiplier: rewardMultiplier || 1.0,
          spawnSpeed: spawnSpeed || 'normal'
        };
      }

      room.startGame();
      io.to(roomCode).emit(SOCKET_EVENTS.GAME_STARTED, {
        players: room.getPlayerData(),
        gameSettings: room.gameSettings || {},
        mapId: room.getMap()
      });
    });

    // Placer une tour
    socket.on(SOCKET_EVENTS.PLACE_TOWER, ({ towerType, x, y }) => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);
      if (!room) return;

      const tower = TOWER_TYPES[towerType.toUpperCase()];
      if (!tower) return;

      const success = room.placeTower(socket.id, { ...tower, x, y });
      if (success) {
        socket.emit(SOCKET_EVENTS.TOWER_PLACED, { 
          tower: { ...tower, x, y },
          money: room.players.get(socket.id).money
        });
      }
    });

    // Améliorer une tour
    socket.on('UPGRADE_TOWER', ({ towerId, x, y }) => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      const tower = player.towers.find(t => t.x === x && t.y === y);
      if (!tower) return;

      const towerConfig = TOWER_TYPES[tower.id.toUpperCase()];
      
      // Calculer le coût d'amélioration
      // Pour les tours Gold et Research: prix x2 tous les 5 niveaux
      let upgradeCost = towerConfig.upgradeCost;
      if (tower.id === 'gold' || tower.id === 'research') {
        const currentLevel = tower.level || 1;
        const multiplier = Math.pow(2, Math.floor(currentLevel / 5));
        upgradeCost = towerConfig.upgradeCost * multiplier;
      }

      if (player.money < upgradeCost) return;

      player.money -= upgradeCost;
      tower.level = (tower.level || 1) + 1;
      
      // S'assurer que tower.damage existe
      if (!tower.damage || tower.damage <= 0) {
        tower.damage = towerConfig.damage || 1;
      }
      if (!tower.fireRate || tower.fireRate <= 0) {
        tower.fireRate = towerConfig.fireRate || 1000;
      }
      
      // Appliquer les améliorations selon le type de tour
      // Pour la cadence: on utilise des bonus de multiplicateur flat
      // multiplicateur = 1000 / fireRate, donc newFireRate = 1000 / (oldMultiplier + bonus)
      if (tower.id === 'basic') {
        // Basique: dégats et +0.10x de cadence par niveau
        tower.damage += towerConfig.damageUpgrade || 0;
        const currentMultiplier = 1000 / tower.fireRate;
        const newMultiplier = currentMultiplier + 0.10;
        tower.fireRate = Math.max(200, Math.floor(1000 / newMultiplier));
      } else if (tower.id === 'sniper') {
        // Sniper: niveau 1-5 = range et dégats, niveau 5+ = dégats et +0.10x cadence
        if (tower.level <= 5) {
          tower.range = (tower.range || towerConfig.range) + 50;
          tower.damage += towerConfig.damageUpgrade || 0;
        } else {
          tower.damage += towerConfig.damageUpgrade || 0;
          const currentMultiplier = 1000 / tower.fireRate;
          const newMultiplier = currentMultiplier + 0.10;
          tower.fireRate = Math.max(500, Math.floor(1000 / newMultiplier));
        }
      } else if (tower.id === 'rapid') {
        // Rapide: dégats et +0.20x de cadence par niveau
        tower.damage += towerConfig.damageUpgrade || 0;
        const currentMultiplier = 1000 / tower.fireRate;
        const newMultiplier = currentMultiplier + 0.20;
        tower.fireRate = Math.max(100, Math.floor(1000 / newMultiplier));
      }
      // Gold et Research: pas de bonus de cadence, seulement les dégâts de base

      socket.emit('TOWER_UPGRADED', {
        tower,
        money: player.money
      });
    });

    // Déplacer une tour
    socket.on('MOVE_TOWER', ({ oldX, oldY, newX, newY }) => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      // Trouver la tour par son ancienne position
      const towerIndex = player.towers.findIndex(t => t.x === oldX && t.y === oldY);
      if (towerIndex === -1) return;

      const moveCost = 25;
      if (player.money < moveCost) return;

      player.money -= moveCost;
      
      // Copier les données de la tour et mettre à jour la position
      const tower = player.towers[towerIndex];
      tower.x = newX;
      tower.y = newY;

      // Envoyer toutes les données de la tour pour recréation côté client
      socket.emit('TOWER_MOVED', {
        oldX,
        oldY,
        tower: { ...tower },  // Envoyer toutes les stats de la tour
        money: player.money
      });
    });

    // Supprimer une tour
    socket.on('SELL_TOWER', ({ x, y }) => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      const towerIndex = player.towers.findIndex(t => t.x === x && t.y === y);
      if (towerIndex === -1) return;

      const tower = player.towers[towerIndex];
      const towerConfig = TOWER_TYPES[tower.id.toUpperCase()];
      const refund = Math.floor(towerConfig.cost * 0.5);

      player.money += refund;
      player.towers.splice(towerIndex, 1);

      socket.emit('TOWER_SOLD', {
        x, y,
        refund,
        money: player.money
      });
    });

    // Envoyer un monstre
    socket.on(SOCKET_EVENTS.SEND_MONSTER, ({ targetPlayer, monsterType, monster }) => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);
      if (!room) return;

      // Vérifier que le joueur a assez d'argent et que le monstre existe
      const player = room.players.get(socket.id);
      const monsterConfig = MONSTER_TYPES[monsterType.toUpperCase()];
      
      if (!player || !monsterConfig || player.money < monsterConfig.cost) return;

      // Déduire le coût du monstre
      player.money -= monsterConfig.cost;

      // Utiliser le monstre envoyé par le client (avec ses HP augmentés)
      if (monster) {
        // Trouver le socket du joueur cible
        const targetSocket = Array.from(room.players.keys())
          .find(sid => room.players.get(sid).username === targetPlayer);

        if (targetSocket) {
          io.to(targetSocket).emit(SOCKET_EVENTS.MONSTER_SENT, {
            monster,
            sender: currentUser.username
          });
        }

        socket.emit(SOCKET_EVENTS.MONEY_UPDATE, {
          money: room.players.get(socket.id).money
        });
      }
    });

    // Monstre tué
    socket.on(SOCKET_EVENTS.MONSTER_KILLED, ({ monsterId, reward }) => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);
      if (!room) return;

      room.addMoney(socket.id, reward);
      room.monsterKilledByPlayer(socket.id); // Décrémenter le compteur de monstres
      
      // Les kills sont déjà incrémentés dans room.addMoney()
      
      socket.emit(SOCKET_EVENTS.MONEY_UPDATE, {
        money: room.players.get(socket.id).money
      });
      
      // Envoyer les stats mises à jour de tous les joueurs
      io.to(roomCode).emit('PLAYERS_STATS_UPDATE', {
        players: room.getPlayerData()
      });
    });

    // Monstre passé
    socket.on(SOCKET_EVENTS.MONSTER_PASSED, () => {
      const roomCode = playerRooms.get(socket.id);
      const room = rooms.get(roomCode);
      if (!room) return;

      const playerLost = room.monsterPassed(socket.id);
      
      // Envoyer les stats mises à jour de tous les joueurs
      io.to(roomCode).emit('PLAYERS_STATS_UPDATE', {
        players: room.getPlayerData()
      });
      
      if (playerLost) {
        io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LOST, {
          username: currentUser.username,
          players: room.getPlayerData()
        });
      }

      if (room.isGameOver()) {
        const winner = room.getWinner();
        io.to(roomCode).emit(SOCKET_EVENTS.GAME_OVER, {
          winner: winner?.username || 'Aucun',
          players: room.getPlayerData()
        });

        // Retour au lobby après 5 secondes
        setTimeout(() => {
          room.reset();
          io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATE, {
            state: 'waiting',
            players: room.getPlayerData()
          });
        }, 5000);
      }
    });

    // Quitter le salon (volontaire - pas de délai de grâce)
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, () => {
      handleDisconnect(true); // forceLeave = true
    });

    socket.on('disconnect', () => {
      console.log(`Client déconnecté: ${socket.id}`);
      handleDisconnect(false); // forceLeave = false, délai de grâce
    });

    function handleDisconnect(forceLeave = false) {
      const roomCode = playerRooms.get(socket.id);
      if (!roomCode) return;
      
      const room = rooms.get(roomCode);
      if (!room) {
        playerRooms.delete(socket.id);
        return;
      }
      
      const playerData = room.players.get(socket.id);
      
      // Si c'est une déconnexion (pas un leave volontaire) et que la partie est en cours,
      // donner un délai de grâce de 5 secondes pour se reconnecter
      if (!forceLeave && room.state === 'playing' && currentUser) {
        console.log(`⏳ Délai de grâce de 5s pour ${currentUser.username}...`);
        
        // Informer les autres joueurs
        socket.to(roomCode).emit('PLAYER_DISCONNECTING', {
          username: currentUser.username,
          gracePeriod: 5000
        });
        
        // Sauvegarder les données et programmer la suppression
        const timeout = setTimeout(() => {
          console.log(`❌ Délai expiré pour ${currentUser?.username}, suppression...`);
          disconnectedPlayers.delete(socket.id);
          
          // Maintenant vraiment supprimer le joueur
          finalizeDisconnect(socket.id, roomCode, room);
        }, 5000);
        
        disconnectedPlayers.set(socket.id, {
          timeout,
          roomCode,
          username: currentUser.username,
          playerData
        });
        
        // Ne pas supprimer le joueur immédiatement, mais le retirer du mapping socket
        playerRooms.delete(socket.id);
        return;
      }
      
      // Sinon, déconnexion immédiate (leave volontaire ou pas en jeu)
      finalizeDisconnect(socket.id, roomCode, room);
    }
    
    function finalizeDisconnect(socketId, roomCode, room) {
      room.removePlayer(socketId);
      
      if (room.players.size === 0) {
        rooms.delete(roomCode);
      } else {
        io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, {
          username: currentUser?.username,
          players: room.getPlayerData()
        });

        // Vérifier si le jeu doit se terminer
        if (room.state === 'playing' && room.isGameOver()) {
          const winner = room.getWinner();
          io.to(roomCode).emit(SOCKET_EVENTS.GAME_OVER, {
            winner: winner?.username || 'Aucun',
            players: room.getPlayerData()
          });
        }
      }
      playerRooms.delete(socketId);
    }
  });
};
