const { v4: uuidv4 } = require('uuid');
const { GAME_STATES, MONSTER_TYPES, MAPS } = require('../../shared/constants');

class GameRoom {
  constructor(code, host) {
    this.code = code;
    this.host = host;
    this.players = new Map(); // socketId -> player data
    this.state = GAME_STATES.WAITING;
    this.createdAt = Date.now();
    this.gameState = null;
    this.selectedMap = 'standard'; // Map sélectionnée
  }

  addPlayer(socketId, username) {
    this.players.set(socketId, {
      socketId,
      username,
      money: 500, // Argent de départ
      health: 0, // Monstres passés
      towers: [],
      isAlive: true,
      kills: 0
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  getPlayerData() {
    return Array.from(this.players.values()).map(p => ({
      username: p.username,
      isAlive: p.isAlive,
      health: p.health,
      money: p.money,
      kills: p.kills
    }));
  }

  setMap(mapId) {
    // Vérifier que la map existe dans les constantes
    if (MAPS[mapId.toUpperCase()]) {
      this.selectedMap = mapId.toLowerCase();
      return true;
    }
    return false;
  }

  getMap() {
    return this.selectedMap;
  }

  startGame() {
    this.state = GAME_STATES.PLAYING;
    this.gameState = {
      startTime: Date.now(),
      gameTime: 0,
      spawnRate: 3000,
      lastSpawn: Date.now(),
      monsterLevel: 1,
      monsterHealthMultiplier: 1,
      rewardMultiplier: 1,
      maxMonstersPerPlayer: 15
    };
  }

  placeTower(socketId, towerData) {
    const player = this.players.get(socketId);
    if (!player || !player.isAlive) return false;

    if (player.money >= towerData.cost) {
      player.money -= towerData.cost;
      player.towers.push({
        id: uuidv4(),
        ...towerData,
        level: 1
      });
      return true;
    }
    return false;
  }

  upgradeTower(socketId, towerId) {
    const player = this.players.get(socketId);
    if (!player || !player.isAlive) return false;

    const tower = player.towers.find(t => t.id === towerId);
    if (!tower) return false;

    const upgradeCost = tower.upgradeCost * tower.level;
    if (player.money >= upgradeCost) {
      player.money -= upgradeCost;
      tower.level++;
      tower.damage = Math.floor(tower.damage * 1.5);
      return true;
    }
    return false;
  }

  sendMonster(socketId, monsterType) {
    const player = this.players.get(socketId);
    if (!player || !player.isAlive) return null;

    const monster = MONSTER_TYPES[monsterType.toUpperCase()];
    if (!monster || player.money < monster.cost) return null;

    player.money -= monster.cost;
    return monster;
  }

  addMoney(socketId, amount) {
    const player = this.players.get(socketId);
    if (player) {
      player.money += amount;
      player.kills++;
    }
  }

  monsterPassed(socketId) {
    const player = this.players.get(socketId);
    if (!player || !player.isAlive) return false;

    player.health++;
    // Utiliser maxHealth du joueur ou des gameSettings, sinon valeur par défaut de 20
    const maxHealth = player.maxHealth || (this.gameSettings && this.gameSettings.maxHealth) || 20;
    if (player.health >= maxHealth) {
      player.isAlive = false;
      return true; // Player lost
    }
    return false;
  }

  getAlivePlayers() {
    return Array.from(this.players.values()).filter(p => p.isAlive);
  }

  isGameOver() {
    const alivePlayers = this.getAlivePlayers();
    return this.state === GAME_STATES.PLAYING && alivePlayers.length <= 1;
  }

  getWinner() {
    const alivePlayers = this.getAlivePlayers();
    return alivePlayers.length === 1 ? alivePlayers[0] : null;
  }

  reset() {
    this.state = GAME_STATES.WAITING;
    this.gameState = null;
    this.players.forEach(player => {
      player.money = 500;
      player.health = 0;
      player.towers = [];
      player.isAlive = true;
      player.kills = 0;
      player.monsterCount = 0;
    });
  }

  // Méthode pour le spawn automatique (désactivée - géré côté client)
  update(io) {
    // Désactivé - le spawn est maintenant géré côté client pour chaque joueur
    // Le serveur ne gère que les monstres envoyés par les joueurs adverses
    return;
  }

  monsterKilledByPlayer(socketId) {
    const player = this.players.get(socketId);
    if (player && player.monsterCount > 0) {
      player.monsterCount--;
    }
  }
}

module.exports = GameRoom;
