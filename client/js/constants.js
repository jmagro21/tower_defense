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
        { x: 0, y: 300 },    // Entrée gauche (y=300 est aligné: 7*40+20=300)
        { x: 180, y: 300 },  // 4*40+20=180
        { x: 180, y: 140 },  // 3*40+20=140
        { x: 620, y: 140 },  // 15*40+20=620
        { x: 620, y: 460 },  // 11*40+20=460
        { x: 800, y: 460 }   // Sortie droite
      ]
    },
    SPIRAL: {
      id: 'spiral',
      name: 'Spirale',
      description: 'Chemin en spirale',
      path: [
        { x: 0, y: 300 },    // Entrée gauche
        { x: 140, y: 300 },  // 3*40+20=140
        { x: 140, y: 140 },  // 3*40+20=140
        { x: 660, y: 140 },  // 16*40+20=660
        { x: 660, y: 460 },  // 11*40+20=460
        { x: 60, y: 460 },   // 1*40+20=60
        { x: 60, y: 220 },   // 5*40+20=220
        { x: 740, y: 220 },  // 18*40+20=740
        { x: 740, y: 380 },  // 9*40+20=380
        { x: 800, y: 380 }   // Sortie droite
      ]
    },
    STRAIGHT: {
      id: 'straight',
      name: 'Droit',
      description: 'Chemin droit de haut en bas',
      path: [
        { x: 380, y: 0 },    // 9*40+20=380 - Entrée haut
        { x: 380, y: 300 },  // Milieu
        { x: 380, y: 600 }   // Sortie bas
      ]
    },
    SERPENT: {
      id: 'serpent',
      name: 'Serpent',
      description: 'Chemin sinueux',
      path: [
        { x: 0, y: 100 },    // Entrée gauche (2*40+20=100)
        { x: 260, y: 100 },  // 6*40+20=260
        { x: 260, y: 500 },  // 12*40+20=500
        { x: 540, y: 500 },  // 13*40+20=540
        { x: 540, y: 140 },  // 3*40+20=140
        { x: 800, y: 140 }   // Sortie droite
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
    },
    GOLD: {
      id: 'gold',
      name: 'Tour Dorée',
      cost: 250,
      damage: 8,
      range: 180,
      fireRate: 2000,
      upgradeCost: 80,
      damageUpgrade: 2,
      fireRateUpgrade: -150,
      goldRadius: 150,
      goldMultiplier: 2
    },
    RESEARCH: {
      id: 'research',
      name: 'Tour Laboratoire',
      cost: 300,
      damage: 3,
      range: 200,
      fireRate: 1500,
      upgradeCost: 100,
      damageUpgrade: 1,
      fireRateUpgrade: -100,
      researchKillsPerHit: 1,
      auraRadius: 150,
      slowPercent: 0.01, // 1% de ralentissement
      researchBonus: 1   // +1 point de recherche bonus si kill dans l'aura
    }
  },

  TOWER_ABILITIES: {
    TRUE_SIGHT: {
      id: 'true_sight',
      name: 'Vision Véritable',
      description: 'Peut voir et attaquer les monstres invisibles',
      cost: 150,
      icon: '👁️'
    },
    FIRE: {
      id: 'fire',
      name: 'Flèches Enflammées',
      description: 'Inflige 2% HP max/sec pendant 3s',
      cost: 200,
      duration: 3000,
      damagePercent: 0.02,
      icon: '🔥'
    },
    FREEZE: {
      id: 'freeze',
      name: 'Gel',
      description: 'Ralentit de 50% pendant 2s',
      cost: 180,
      duration: 2000,
      slowPercent: 0.5,
      icon: '❄️'
    },
    POISON: {
      id: 'poison',
      name: 'Poison',
      description: 'Inflige 2% HP max/sec pendant 4s',
      cost: 220,
      duration: 4000,
      damagePercent: 0.02,
      icon: '☠️'
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
    SPLITTER: {
      id: 'splitter',
      name: 'Diviseur',
      cost: 120,
      health: 150,
      speed: 40,
      reward: 50,
      spawnCost: 2.5,
      canSplit: true
    },
    BUFFER: {
      id: 'buffer',
      name: 'Soigneur',
      cost: 200,
      health: 200,
      speed: 25,
      reward: 80,
      spawnCost: 5,
      buffRadius: 100,
      healthBuff: 1.5
    },
    STUNNER: {
      id: 'stunner',
      name: 'Paralyseur',
      cost: 180,
      health: 180,
      speed: 35,
      reward: 70,
      spawnCost: 4,
      stunDuration: 2000,
      maxStuns: 2
    },
    INVISIBLE: {
      id: 'invisible',
      name: 'Fantôme',
      cost: 250,
      health: 120,
      speed: 45,
      reward: 90,
      spawnCost: 5,
      isInvisible: true
    },
    BOSS: {
      id: 'boss',
      name: 'Boss',
      cost: 300,
      health: 1000,
      speed: 12,
      reward: 60,
      spawnCost: 20
    },
    BIGBOSS: {
      id: 'bigboss',
      name: 'Titan',
      cost: 10000,
      health: 15000,
      speed: 8,
      reward: 2000,
      isInvisible: true,       // Invisible
      stunDuration: 3000,      // Paralyse pendant 3s
      maxStuns: 5,             // Paralyse les 5 premières tours
      buffRadius: 200,         // Rayon du buff de vie
      healthBuff: 2.0,         // Double la vie des monstres à proximité
      spawnInterval: 3000,     // Spawn un rapide toutes les 3s
      canSplitToBoss: true,    // Se divise en 5 boss à sa mort
      splitCount: 5            // Nombre de boss à spawn
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
