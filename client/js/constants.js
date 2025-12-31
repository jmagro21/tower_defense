// Importer les constantes du serveur
const CONSTANTS = {
  GAME: {
    MAP_WIDTH: 800,
    MAP_HEIGHT: 600,
    GRID_SIZE: 40,
    MONSTER_PASS_LIMIT: 20
  },

  MAPS: {
    STANDARD: {
      id: 'standard',
      name: 'Standard',
      description: 'Chemin simple en zigzag',
      path: [
        { x: 0, y: 300 },
        { x: 200, y: 300 },
        { x: 200, y: 150 },
        { x: 600, y: 150 },
        { x: 600, y: 450 },
        { x: 800, y: 450 }
      ]
    },
    SPIRAL: {
      id: 'spiral',
      name: 'Spirale',
      description: 'Chemin en spirale',
      path: [
        { x: 0, y: 300 },
        { x: 150, y: 300 },
        { x: 150, y: 150 },
        { x: 650, y: 150 },
        { x: 650, y: 450 },
        { x: 50, y: 450 },
        { x: 50, y: 200 },
        { x: 750, y: 200 },
        { x: 750, y: 400 },
        { x: 800, y: 400 }
      ]
    },
    STRAIGHT: {
      id: 'straight',
      name: 'Droit',
      description: 'Chemin droit de haut en bas',
      path: [
        { x: 400, y: 0 },
        { x: 400, y: 600 }
      ]
    },
    SERPENT: {
      id: 'serpent',
      name: 'Serpent',
      description: 'Chemin sinueux',
      path: [
        { x: 0, y: 100 },
        { x: 250, y: 100 },
        { x: 250, y: 500 },
        { x: 550, y: 500 },
        { x: 550, y: 150 },
        { x: 800, y: 150 }
      ]
    }
  },

  TOWER_TYPES: {
    BASIC: {
      id: 'basic',
      name: 'Tour Basique',
      cost: 100,
      damage: 10,
      range: 150,
      fireRate: 1500,
      upgradeCost: 50,
      damageUpgrade: 3,
      fireRateUpgrade: -150
    },
    SNIPER: {
      id: 'sniper',
      name: 'Tour Sniper',
      cost: 200,
      damage: 50,
      range: 300,
      fireRate: 3000,
      upgradeCost: 100,
      damageUpgrade: 15,
      fireRateUpgrade: -300
    },
    RAPID: {
      id: 'rapid',
      name: 'Tour Rapide',
      cost: 150,
      damage: 5,
      range: 120,
      fireRate: 800,
      upgradeCost: 75,
      damageUpgrade: 1.5,
      fireRateUpgrade: -75
    }
  },

  MONSTER_TYPES: {
    BASIC: {
      id: 'basic',
      name: 'Monstre Basique',
      cost: 50,
      health: 100,
      speed: 30,
      reward: 5,
      spawnCost: 1
    },
    TANK: {
      id: 'tank',
      name: 'Monstre Tank',
      cost: 150,
      health: 300,
      speed: 18,
      reward: 20,
      spawnCost: 3
    },
    FAST: {
      id: 'fast',
      name: 'Monstre Rapide',
      cost: 100,
      health: 50,
      speed: 60,
      reward: 12,
      spawnCost: 2
    },
    BOSS: {
      id: 'boss',
      name: 'Boss',
      cost: 300,
      health: 1000,
      speed: 12,
      reward: 60,
      spawnCost: 20
    }
  },

  SOCKET_EVENTS: {
    REGISTER: 'register',
    LOGIN: 'login',
    AUTH_SUCCESS: 'authSuccess',
    AUTH_ERROR: 'authError',
    CREATE_ROOM: 'createRoom',
    JOIN_ROOM: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
    ROOM_CREATED: 'roomCreated',
    ROOM_JOINED: 'roomJoined',
    ROOM_ERROR: 'roomError',
    ROOM_UPDATE: 'roomUpdate',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_LEFT: 'playerLeft',
    START_GAME: 'startGame',
    GAME_STARTED: 'gameStarted',
    GAME_UPDATE: 'gameUpdate',
    GAME_OVER: 'gameOver',
    PLACE_TOWER: 'placeTower',
    UPGRADE_TOWER: 'upgradeTower',
    SEND_MONSTER: 'sendMonster',
    MONSTER_SENT: 'monsterSent',
    MONSTER_KILLED: 'monsterKilled',
    MONSTER_PASSED: 'monsterPassed',
    TOWER_PLACED: 'towerPlaced',
    TOWER_UPGRADED: 'towerUpgraded',
    MONEY_UPDATE: 'moneyUpdate',
    PLAYER_LOST: 'playerLost'
  }
};
