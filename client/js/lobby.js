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
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Connecté au serveur');
    // Pas besoin d'envoyer le token, il est dans le cookie
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
      selectedMap = data.mapId;
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
        rewardMultiplier: data.gameSettings.rewardMultiplier || 1.0
      };
      playerMoney = gameSettings.startingMoney;
    }
    
    showScreen('game-screen');
    initGame(data.players);
  });

  socket.on('MAP_CHANGED', (data) => {
    selectedMap = data.mapId;
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
  
  socket.emit(CONSTANTS.SOCKET_EVENTS.START_GAME, {
    gameSettings: {
      startingMoney,
      maxHealth,
      monsterIntensity,
      rewardMultiplier
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
  navigator.clipboard.writeText(currentRoomCode).then(() => {
    showToast('Code copié dans le presse-papier ! 📋', 'success');
  }).catch(() => {
    showLobbyError('Erreur lors de la copie du code');
  });
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
    mapSelect.value = selectedMap;
  }
  
  // Afficher le nom et la description de la map
  const mapName = document.getElementById('map-name');
  const mapDesc = document.getElementById('map-description');
  const map = CONSTANTS.MAPS[selectedMap.toUpperCase()];
  
  if (mapName && map) {
    mapName.textContent = map.name;
  }
  if (mapDesc && map) {
    mapDesc.textContent = map.description;
  }
}