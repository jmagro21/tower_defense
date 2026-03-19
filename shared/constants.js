// Constantes partagées entre client et serveur

module.exports = {
  // Configuration du jeu
  GAME: {
    MAP_WIDTH: 880,
    MAP_HEIGHT: 680,
    GRID_SIZE: 40,
    MONSTER_PASS_LIMIT: 20
  },

  // Définitions des maps (ajustées pour 880x680 avec offset +40 sur x et y)
  MAPS: {
    STANDARD: {
      id: 'standard',
      name: 'Standard',
      description: 'Chemin simple en zigzag',
      path: [
        { x: 0, y: 340 },
        { x: 220, y: 340 },
        { x: 220, y: 180 },
        { x: 660, y: 180 },
        { x: 660, y: 500 },
        { x: 880, y: 500 }
      ]
    },
    SPIRAL: {
      id: 'spiral',
      name: 'Spirale',
      description: 'Chemin en spirale',
      path: [
        { x: 0, y: 340 },
        { x: 180, y: 340 },
        { x: 180, y: 180 },
        { x: 700, y: 180 },
        { x: 700, y: 500 },
        { x: 100, y: 500 },
        { x: 100, y: 260 },
        { x: 780, y: 260 },
        { x: 780, y: 420 },
        { x: 880, y: 420 }
      ]
    },
    STRAIGHT: {
      id: 'straight',
      name: 'Droit',
      description: 'Chemin droit de haut en bas',
      path: [
        { x: 420, y: 0 },
        { x: 420, y: 340 },
        { x: 420, y: 680 }
      ]
    },
    SERPENT: {
      id: 'serpent',
      name: 'Serpent',
      description: 'Chemin sinueux',
      path: [
        { x: 0, y: 140 },
        { x: 300, y: 140 },
        { x: 300, y: 540 },
        { x: 580, y: 540 },
        { x: 580, y: 180 },
        { x: 880, y: 180 }
      ]
    }
  },

  // Types de tours
  TOWER_TYPES: {
    BASIC: {
      id: 'basic',
      name: 'Tour Basique',
      cost: 100,
      damage: 10,
      range: 150,
      fireRate: 1000, // ms
      upgradeCost: 50,
      damageUpgrade: 3,
      fireRateUpgrade: -100
    },
    SNIPER: {
      id: 'sniper',
      name: 'Tour Sniper',
      cost: 200,
      damage: 50,
      range: 300,
      fireRate: 2000,
      upgradeCost: 100,
      damageUpgrade: 15,
      fireRateUpgrade: -200
    },
    RAPID: {
      id: 'rapid',
      name: 'Tour Rapide',
      cost: 150,
      damage: 5,
      range: 120,
      fireRate: 500,
      upgradeCost: 75,
      damageUpgrade: 1.5,
      fireRateUpgrade: -50
    },
    GOLD: {
      id: 'gold',
      name: 'Tour Dorée',
      cost: 250,
      damage: 8,
      range: 180,
      fireRate: 1300,
      upgradeCost: 80,
      damageUpgrade: 2,
      fireRateUpgrade: -100,
      goldRadius: 150,  // Rayon du halo d'or
      goldMultiplier: 2 // Multiplie les récompenses par 2
    },
    RESEARCH: {
      id: 'research',
      name: 'Tour Laboratoire',
      cost: 300,
      damage: 3,
      range: 200,
      fireRate: 1000,
      upgradeCost: 100,
      damageUpgrade: 1,
      fireRateUpgrade: -80,
      researchKillsPerHit: 1 // Génère des kills de recherche
    },
    ELECTRIC: {
      id: 'electric',
      name: 'Tour Électrique',
      cost: 500,
      damage: 15,
      range: 180,
      fireRate: 7000, // 0.14 attaque/sec = 7s entre chaque attaque
      upgradeCost: 150,
      damageUpgrade: 8,
      fireRateUpgrade: 0, // Pas d'amélioration de vitesse
      maxTargets: 10, // Touche 10 mobs
      stunDuration: 500 // 0.5 seconde de stun
    }
  },

  // Types de monstres
  MONSTER_TYPES: {
    BASIC: {
      id: 'basic',
      name: 'Monstre Basique',
      cost: 50,
      health: 100,
      speed: 35,
      reward: 20
    },
    TANK: {
      id: 'tank',
      name: 'Monstre Tank',
      cost: 150,
      health: 300,
      speed: 20,
      reward: 55
    },
    FAST: {
      id: 'fast',
      name: 'Monstre Rapide',
      cost: 100,
      health: 50,
      speed: 60,
      reward: 30
    },
    BOSS: {
      id: 'boss',
      name: 'Boss',
      cost: 300,
      health: 1000,
      speed: 10,
      reward: 150
    },
    BIGBOSS: {
      id: 'bigboss',
      name: 'Titan',
      cost: 10000,
      health: 15000,
      speed: 8,
      reward: 1500,
      isInvisible: true,       // Invisible
      stunDuration: 3000,      // Paralyse pendant 3s
      maxStuns: 5,             // Paralyse les 5 premières tours
      buffRadius: 200,         // Rayon du buff de vie
      healthBuff: 2.0,         // Double la vie des monstres à proximité
      spawnInterval: 3000,     // Spawn un rapide toutes les 3s
      canSplitToBoss: true,    // Se divise en 5 boss à sa mort
      splitCount: 5            // Nombre de boss à spawn
    },
    SPLITTER: {
      id: 'splitter',
      name: 'Diviseur',
      cost: 120,
      health: 150,
      speed: 40,
      reward: 40,
      canSplit: true  // Indique que ce monstre peut se diviser
    },
    BUFFER: {
      id: 'buffer',
      name: 'Soigneur',
      cost: 200,
      health: 200,
      speed: 25,
      reward: 60,
      buffRadius: 100,  // Rayon du buff en pixels
      healthBuff: 1.5   // Multiplie la vie par 1.5 (50% de boost)
    },
    STUNNER: {
      id: 'stunner',
      name: 'Paralyseur',
      cost: 180,
      health: 180,
      speed: 35,
      reward: 55,
      stunDuration: 2000,  // Durée du stun en ms
      maxStuns: 2          // Nombre max de tours à stun
    },
    INVISIBLE: {
      id: 'invisible',
      name: 'Fantôme',
      cost: 250,
      health: 120,
      speed: 45,
      reward: 70,
      isInvisible: true    // Invisible, seules les tours avec true_sight peuvent l'attaquer
    },
    DEMOLISHER: {
      id: 'demolisher',
      name: 'Démolisseur',
      cost: 10000,
      health: 5000,
      speed: 15,
      reward: 500,
      suddenDeathOnly: true,   // Uniquement disponible en mort subite
      downgradeTower: true     // Réduit le niveau de la tour qui le tue de 1
    }
  },

  // Compétences des tours
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

  // États de la partie
  GAME_STATES: {
    WAITING: 'waiting',
    STARTING: 'starting',
    PLAYING: 'playing',
    FINISHED: 'finished'
  },

  // Événements Socket.io
  SOCKET_EVENTS: {
    // Authentification
    REGISTER: 'register',
    LOGIN: 'login',
    AUTH_SUCCESS: 'authSuccess',
    AUTH_ERROR: 'authError',
    
    // Salons
    CREATE_ROOM: 'createRoom',
    JOIN_ROOM: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
    ROOM_CREATED: 'roomCreated',
    ROOM_JOINED: 'roomJoined',
    ROOM_ERROR: 'roomError',
    ROOM_UPDATE: 'roomUpdate',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_LEFT: 'playerLeft',
    
    // Partie
    START_GAME: 'startGame',
    GAME_STARTED: 'gameStarted',
    GAME_UPDATE: 'gameUpdate',
    GAME_OVER: 'gameOver',
    
    // Actions du jeu
    PLACE_TOWER: 'placeTower',
    UPGRADE_TOWER: 'upgradeTower',
    MOVE_TOWER: 'moveTower',
    SEND_MONSTER: 'sendMonster',
    MONSTER_SENT: 'monsterSent',
    MONSTER_KILLED: 'monsterKilled',
    MONSTER_PASSED: 'monsterPassed',
    TOWER_PLACED: 'towerPlaced',
    TOWER_UPGRADED: 'towerUpgraded',
    TOWER_MOVED: 'towerMoved',
    MONEY_UPDATE: 'moneyUpdate',
    PLAYER_LOST: 'playerLost'
  }
};
