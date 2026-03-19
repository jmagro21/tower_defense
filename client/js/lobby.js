// Gestion du lobby et des salons
let socket = null;
let currentRoomCode = null;
let isHost = false;
let roomPlayers = [];

function initSocket() {
  // Le token est maintenant dans le cookie HTTP-only
  // Socket.io l'envoie automatiquement avec credentials: true
  
  socket = io(undefined, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    withCredentials: true // Important pour envoyer les cookies
  });

  socket.on('connect', () => {
    console.log('Connecté au serveur');
    // Envoyer immédiatement la demande d'authentification
    socket.emit(CONSTANTS.SOCKET_EVENTS.LOGIN, {});
  });

  socket.on('connect_error', (error) => {
    console.error('Erreur de connexion:', error);
    showLobbyError('Impossible de se connecter au serveur');
  });

  socket.on('disconnect', () => {
    console.log('Déconnecté du serveur');
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.AUTH_SUCCESS, (data) => {
    console.log('Authentifié:', data.username);
    if (data.reconnected) {
      showToast('🔄 Reconnexion réussie !', 'success');
    }
  });
  
  // Gestion de la reconnexion
  socket.on('RECONNECTED', (data) => {
    console.log('🔄 Reconnecté au salon:', data.roomCode);
    currentRoomCode = data.roomCode;
    localStorage.setItem('currentRoom', data.roomCode);
    
    // Restaurer l'état du jeu si en cours
    if (data.roomState === 'playing') {
      showToast('🔄 Partie restaurée !', 'success');
      
      // Restaurer les paramètres de jeu
      if (data.gameSettings) {
        gameSettings = {
          startingMoney: data.gameSettings.startingMoney || 500,
          maxHealth: data.gameSettings.maxHealth || 20,
          monsterIntensity: data.gameSettings.monsterIntensity || 1.0,
          rewardMultiplier: data.gameSettings.rewardMultiplier || 1.0,
          spawnSpeed: data.gameSettings.spawnSpeed || 'normal'
        };
        CONSTANTS.GAME.MONSTER_PASS_LIMIT = gameSettings.maxHealth;
      }
      
      // Restaurer l'argent et la santé du joueur depuis le serveur
      if (data.playerData) {
        playerMoney = data.playerData.money || gameSettings.startingMoney;
      }
      
      // Restaurer la map
      if (data.mapId) {
        window.selectedMap = data.mapId;
      }
      
      // Initialiser les stats des joueurs
      if (data.players) {
        playersStats = data.players.map(p => ({
          username: p.username,
          health: p.health || 0,
          kills: p.kills || 0,
          money: p.money || 0
        }));
      }
      
      // Réinitialiser les kills locaux
      playerKills = 0;
      
      localStorage.setItem('gameState', 'playing');
      showScreen('game-screen');
      initGame(data.players || []);
    } else if (data.roomState === 'waiting') {
      // Retourner dans le lobby de la salle
      roomPlayers = (data.players || []);
      showRoomScreen();
    }
  });
  
  // Un autre joueur est en train de se déconnecter (délai de grâce)
  socket.on('PLAYER_DISCONNECTING', (data) => {
    showToast(`⏳ ${data.username} a perdu la connexion... (30s pour revenir)`, 'warning');
  });
  
  // Un joueur s'est reconnecté
  socket.on('PLAYER_RECONNECTED', (data) => {
    showToast(`🔄 ${data.username} s'est reconnecté !`, 'success');
  });
  
  socket.on(CONSTANTS.SOCKET_EVENTS.AUTH_ERROR, (data) => {
    console.error('Erreur d\'authentification:', data.message);
    showLobbyError('Erreur d\'authentification. Veuillez vous reconnecter.');
    setTimeout(() => {
      logout();
    }, 2000);
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.ROOM_CREATED, (data) => {
    currentRoomCode = data.code;
    isHost = true;
    roomPlayers = data.players;
    localStorage.setItem('currentRoom', data.code);
    localStorage.setItem('isHost', 'true');
    showRoomScreen();
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.ROOM_JOINED, (data) => {
    currentRoomCode = data.code;
    isHost = data.isHost;
    roomPlayers = data.players;
    localStorage.setItem('currentRoom', data.code);
    localStorage.setItem('isHost', data.isHost.toString());
    showRoomScreen();
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.ROOM_ERROR, (data) => {
    showLobbyError(data.message);
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.PLAYER_JOINED, (data) => {
    roomPlayers = data.players;
    updatePlayersList();
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.PLAYER_LEFT, (data) => {
    roomPlayers = data.players;
    updatePlayersList();
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.GAME_STARTED, (data) => {
    localStorage.setItem('gameState', 'playing');
    
    // Récupérer la map du serveur
    if (data.mapId) {
      window.selectedMap = data.mapId;
    }
    
    // Initialiser les stats des joueurs depuis le serveur
    playersStats = data.players.map(p => ({
      username: p.username,
      health: p.health || 0,
      kills: 0,
      money: p.money || 0
    }));
    
    // Réinitialiser les kills locaux
    playerKills = 0;
    
    // Appliquer les paramètres de configuration
    if (data.gameSettings) {
      gameSettings = {
        startingMoney: data.gameSettings.startingMoney || 500,
        maxHealth: data.gameSettings.maxHealth || 20,
        monsterIntensity: data.gameSettings.monsterIntensity || 1.0,
        rewardMultiplier: data.gameSettings.rewardMultiplier || 1.0,
        spawnSpeed: data.gameSettings.spawnSpeed || 'normal'
      };
      playerMoney = gameSettings.startingMoney;
      
      // Appliquer maxHealth à CONSTANTS
      CONSTANTS.GAME.MONSTER_PASS_LIMIT = gameSettings.maxHealth;
    }
    
    showScreen('game-screen');
    initGame(data.players);
  });

  socket.on('MAP_CHANGED', (data) => {
    window.selectedMap = data.mapId;
    updateMapDisplay();
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.ROOM_UPDATE, (data) => {
    if (data.state === 'waiting') {
      roomPlayers = data.players;
      showRoomScreen();
    }
  });

  // Événements de jeu
  setupGameEvents();
}

function createRoom() {
  if (!socket) return;
  socket.emit(CONSTANTS.SOCKET_EVENTS.CREATE_ROOM);
}

function joinRoom() {
  const codeInput = document.getElementById('room-code-input');
  const code = codeInput ? codeInput.value.toUpperCase() : '';
  
  if (!code || !socket) {
    showLobbyError('Veuillez entrer un code de salon');
    return;
  }
  socket.emit(CONSTANTS.SOCKET_EVENTS.JOIN_ROOM, { code });
}

function leaveRoom() {
  if (!socket) return;
  socket.emit(CONSTANTS.SOCKET_EVENTS.LEAVE_ROOM);
  currentRoomCode = null;
  isHost = false;
  roomPlayers = [];
  localStorage.removeItem('currentRoom');
  localStorage.removeItem('isHost');
  localStorage.removeItem('gameState');
  showScreen('lobby-screen');
}

function startGame() {
  if (!socket || !isHost) return;
  
  // Récupérer les paramètres de configuration
  const startingMoney = parseInt(document.getElementById('starting-money').value) || 500;
  const maxHealth = parseInt(document.getElementById('max-health').value) || 20;
  const monsterIntensity = parseFloat(document.getElementById('monster-intensity').value) || 1.0;
  const rewardMultiplier = parseFloat(document.getElementById('reward-multiplier').value) || 1.0;
  const spawnSpeed = document.getElementById('spawn-speed').value || 'normal';
  
  socket.emit(CONSTANTS.SOCKET_EVENTS.START_GAME, {
    gameSettings: {
      startingMoney,
      maxHealth,
      monsterIntensity,
      rewardMultiplier,
      spawnSpeed
    }
  });
}

function showRoomScreen() {
  showScreen('room-screen');
  
  const roomCodeEl = document.getElementById('room-code');
  const startButton = document.getElementById('start-button');
  const gameSettings = document.getElementById('game-settings');
  const mapSelectDiv = document.getElementById('map-selection');
  
  if (roomCodeEl) {
    roomCodeEl.textContent = currentRoomCode;
  }
  
  updatePlayersList();
  updateMapDisplay();
  
  // Afficher les paramètres seulement si c'est l'hôte
  if (gameSettings) {
    if (isHost) {
      gameSettings.classList.remove('hidden');
    } else {
      gameSettings.classList.add('hidden');
    }
  }
  
  // Désactiver la sélection de map si ce n'est pas l'hôte
  if (mapSelectDiv) {
    if (isHost) {
      mapSelectDiv.classList.remove('hidden');
    } else {
      mapSelectDiv.classList.add('hidden');
    }
    const mapSelect = document.getElementById('map-select');
    if (mapSelect) {
      mapSelect.disabled = !isHost;
    }
  }
  
  if (startButton && isHost) {
    startButton.disabled = roomPlayers.length < 2;
    startButton.style.display = 'block';
  } else if (startButton) {
    startButton.style.display = 'none';
  }
}

function updatePlayersList() {
  const playersList = document.getElementById('players-list');
  const playerCount = document.getElementById('player-count');
  const startButton = document.getElementById('start-button');
  
  if (!playersList || !playerCount) {
    console.warn('Éléments DOM manquants pour la liste des joueurs');
    return;
  }
  
  playersList.innerHTML = '';
  roomPlayers.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `👤 ${player.username}`;
    li.style.cursor = 'pointer';
    li.title = 'Observer ce joueur';
    li.onclick = () => {
      if (socket && player.username) {
        socket.emit('spectatePlayer', { username: player.username });
        showToast(`Observation de ${player.username}...`, 'info');
      }
    };
    playersList.appendChild(li);
  });
  
  playerCount.textContent = roomPlayers.length;
  
  if (startButton && isHost) {
    startButton.disabled = roomPlayers.length < 2;
  }
}

function copyRoomCode() {
  if (!currentRoomCode) {
    showLobbyError('Aucun code de salon disponible');
    return;
  }
  
  // Fallback pour les contextes non-sécurisés (http)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentRoomCode).then(() => {
      showToast('Code copié dans le presse-papier ! 📋', 'success');
    }).catch(() => {
      fallbackCopyToClipboard(currentRoomCode);
    });
  } else {
    fallbackCopyToClipboard(currentRoomCode);
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('Code copié dans le presse-papier ! 📋', 'success');
  } catch (err) {
    showLobbyError('Erreur lors de la copie du code');
  }
  document.body.removeChild(textArea);
}

function showLobbyError(message) {
  const errorEl = document.getElementById('lobby-error');
  if (!errorEl) {
    console.error('Message d\'erreur:', message);
    return;
  }
  errorEl.textContent = message;
  errorEl.classList.add('show');
  setTimeout(() => {
    errorEl.classList.remove('show');
  }, 3000);
}
function changeMap(mapId) {
  if (!isHost) {
    showToast('Seul l\'hôte peut changer la map', 'warning');
    return;
  }
  
  socket.emit('CHANGE_MAP', { mapId });
}

function updateMapDisplay() {
  const mapSelect = document.getElementById('map-select');
  if (mapSelect) {
    mapSelect.value = window.selectedMap || 'standard';
  }
  
  // Afficher le nom et la description de la map
  const mapName = document.getElementById('map-name');
  const mapDesc = document.getElementById('map-description');
  const map = CONSTANTS.MAPS[(window.selectedMap || 'standard').toUpperCase()];
  
  if (mapName && map) {
    mapName.textContent = map.name;
  }
  if (mapDesc && map) {
    mapDesc.textContent = map.description;
  }
}