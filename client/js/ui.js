// Gestion de l'interface utilisateur
let playerMoney = 500;
let playerHealth = 0;
let playerKills = 0;
let playersStats = []; // Statistiques de tous les joueurs
let gameSettings = {
  startingMoney: 500,
  maxHealth: 20,
  monsterIntensity: 1.0,
  rewardMultiplier: 1.0,
  spawnSpeed: 'normal'
};

function updateUI() {
  document.getElementById('money').textContent = playerMoney;
  document.getElementById('health').textContent = gameSettings.maxHealth - playerHealth;
  
  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;
  const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  document.getElementById('wave-display').textContent = `${monsterLevel}`;
  
  // Mettre à jour les stats du joueur actuel dans le classement
  if (playersStats.length > 0 && currentUser) {
    const playerIndex = playersStats.findIndex(p => p.username === currentUser.username);
    if (playerIndex !== -1) {
      playersStats[playerIndex].health = playerHealth;
      // Utiliser la source de vérité du serveur pour les kills
      playerKills = playersStats[playerIndex].kills || 0;
    }
  }
  
  // Afficher les kills
  document.getElementById('kills').textContent = playerKills;
  
  // Mettre à jour le compteur de tours
  updateTowerCount();
  
  // Mettre à jour les HP affichés des monstres
  updateMonsterHPDisplay();
  
  // Mettre à jour les coûts des monstres
  updateMonsterCostDisplay();
  
  // Mettre à jour le classement
  updateLeaderboard();
}

function updateTowerCount() {
  const currentCount = towers.length;
  const maxCount = getMaxTowerSize();
  const towerCountElement = document.getElementById('tower-count');
  if (towerCountElement) {
    towerCountElement.textContent = `${currentCount} / ${maxCount}`;
    // Changer la couleur si on approche de la limite
    if (currentCount >= maxCount) {
      towerCountElement.style.color = '#ff4444'; // Rouge si limite atteinte
    } else if (currentCount >= maxCount * 0.8) {
      towerCountElement.style.color = '#ffaa00'; // Orange si > 80%
    } else {
      towerCountElement.style.color = '#888'; // Gris par défaut
    }
  }
}

function updateMonsterHPDisplay() {
  const basicHP = Math.floor(CONSTANTS.MONSTER_TYPES.BASIC.health * monsterHealthMultiplier);
  const tankHP = Math.floor(CONSTANTS.MONSTER_TYPES.TANK.health * monsterHealthMultiplier);
  const fastHP = Math.floor(CONSTANTS.MONSTER_TYPES.FAST.health * monsterHealthMultiplier);
  const splitterHP = Math.floor(CONSTANTS.MONSTER_TYPES.SPLITTER.health * monsterHealthMultiplier);
  const bufferHP = Math.floor(CONSTANTS.MONSTER_TYPES.BUFFER.health * monsterHealthMultiplier);
  const stunnerHP = Math.floor(CONSTANTS.MONSTER_TYPES.STUNNER.health * monsterHealthMultiplier);
  const invisibleHP = Math.floor(CONSTANTS.MONSTER_TYPES.INVISIBLE.health * monsterHealthMultiplier);
  const saboteurHP = Math.floor(CONSTANTS.MONSTER_TYPES.SABOTEUR.health * monsterHealthMultiplier);
  const bossHP = Math.floor(CONSTANTS.MONSTER_TYPES.BOSS.health * monsterHealthMultiplier);
  const bigbossHP = Math.floor(CONSTANTS.MONSTER_TYPES.BIGBOSS.health * monsterHealthMultiplier);
  
  const basicElement = document.getElementById('basic-hp');
  const tankElement = document.getElementById('tank-hp');
  const fastElement = document.getElementById('fast-hp');
  const splitterElement = document.getElementById('splitter-hp');
  const bufferElement = document.getElementById('buffer-hp');
  const stunnerElement = document.getElementById('stunner-hp');
  const invisibleElement = document.getElementById('invisible-hp');
  const saboteurElement = document.getElementById('saboteur-hp');
  const bossElement = document.getElementById('boss-hp');
  const bigbossElement = document.getElementById('bigboss-hp');
  
  if (basicElement) basicElement.textContent = `${basicHP} HP`;
  if (tankElement) tankElement.textContent = `${tankHP} HP`;
  if (fastElement) fastElement.textContent = `${fastHP} HP`;
  if (splitterElement) splitterElement.textContent = `${splitterHP} HP`;
  if (bufferElement) bufferElement.textContent = `${bufferHP} HP`;
  if (stunnerElement) stunnerElement.textContent = `${stunnerHP} HP`;
  if (invisibleElement) invisibleElement.textContent = `${invisibleHP} HP`;
  if (saboteurElement) saboteurElement.textContent = `${saboteurHP} HP`;
  if (bossElement) bossElement.textContent = `${bossHP} HP`;
  if (bigbossElement) bigbossElement.textContent = `${bigbossHP} HP`;
}

function updateMonsterCostDisplay() {
  // Récupérer les bonus d'attaque pour la réduction de coût
  const attackBonuses = getAttackBonuses();
  const costReduction = attackBonuses.costReduction / 100;
  
  // Calculer les coûts avec réduction
  const basicCost = Math.floor(CONSTANTS.MONSTER_TYPES.BASIC.cost * (1 - costReduction));
  const tankCost = Math.floor(CONSTANTS.MONSTER_TYPES.TANK.cost * (1 - costReduction));
  const fastCost = Math.floor(CONSTANTS.MONSTER_TYPES.FAST.cost * (1 - costReduction));
  const splitterCost = Math.floor(CONSTANTS.MONSTER_TYPES.SPLITTER.cost * (1 - costReduction));
  const bufferCost = Math.floor(CONSTANTS.MONSTER_TYPES.BUFFER.cost * (1 - costReduction));
  const stunnerCost = Math.floor(CONSTANTS.MONSTER_TYPES.STUNNER.cost * (1 - costReduction));
  const invisibleCost = Math.floor(CONSTANTS.MONSTER_TYPES.INVISIBLE.cost * (1 - costReduction));
  const saboteurCost = Math.floor(CONSTANTS.MONSTER_TYPES.SABOTEUR.cost * (1 - costReduction));
  const bossCost = Math.floor(CONSTANTS.MONSTER_TYPES.BOSS.cost * (1 - costReduction));
  const bigbossCost = Math.floor(CONSTANTS.MONSTER_TYPES.BIGBOSS.cost * (1 - costReduction));
  
  const basicElement = document.getElementById('basic-cost');
  const tankElement = document.getElementById('tank-cost');
  const fastElement = document.getElementById('fast-cost');
  const splitterElement = document.getElementById('splitter-cost');
  const bufferElement = document.getElementById('buffer-cost');
  const stunnerElement = document.getElementById('stunner-cost');
  const invisibleElement = document.getElementById('invisible-cost');
  const saboteurElement = document.getElementById('saboteur-cost');
  const bossElement = document.getElementById('boss-cost');
  const bigbossElement = document.getElementById('bigboss-cost');
  
  if (basicElement) basicElement.textContent = `💰 ${basicCost}`;
  if (tankElement) tankElement.textContent = `💰 ${tankCost}`;
  if (fastElement) fastElement.textContent = `💰 ${fastCost}`;
  if (splitterElement) splitterElement.textContent = `💰 ${splitterCost}`;
  if (bufferElement) bufferElement.textContent = `💰 ${bufferCost}`;
  if (stunnerElement) stunnerElement.textContent = `💰 ${stunnerCost}`;
  if (invisibleElement) invisibleElement.textContent = `💰 ${invisibleCost}`;
  if (saboteurElement) saboteurElement.textContent = `💰 ${saboteurCost}`;
  if (bossElement) bossElement.textContent = `💰 ${bossCost}`;
  if (bigbossElement) bigbossElement.textContent = `💰 ${bigbossCost}`;
}

function showNotification(message) {
  const notification = gameScene.add.text(
    CONSTANTS.GAME.MAP_WIDTH / 2, 100, message,
    {
      fontSize: '20px', fill: '#fff', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
      backgroundColor: '#e74c3c',
      padding: { x: 15, y: 8 }
    }
  );
  notification.setOrigin(0.5);
  notification.setDepth(1000);

  setTimeout(() => {
    if (notification) notification.destroy();
  }, 2000);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function updateTargetPlayers(players) {
  const select = document.getElementById('target-player');
  select.innerHTML = '<option value="">Choisir un joueur</option>';
  
  players.forEach(player => {
    if (player.username !== currentUser.username && player.isAlive) {
      const option = document.createElement('option');
      option.value = player.username;
      option.textContent = player.username;
      select.appendChild(option);
    }
  });
}

function sendMonster(monsterType) {
  const targetPlayer = document.getElementById('target-player').value;
  if (!targetPlayer) {
    showToast('Veuillez sélectionner un joueur cible', 'warning');
    return;
  }
  
  // Vérifier si le joueur cible est toujours vivant
  const targetPlayerData = playersStats.find(p => p.username === targetPlayer);
  if (!targetPlayerData || !targetPlayerData.isAlive) {
    showToast('Ce joueur a été éliminé !', 'error');
    // Mettre à jour la liste pour retirer les joueurs morts
    updateTargetPlayers(playersStats);
    return;
  }

  const monsterData = CONSTANTS.MONSTER_TYPES[monsterType.toUpperCase()];
  
  // Appliquer les bonus de recherche d'attaque du joueur qui envoie
  const attackBonuses = getAttackBonuses();
  const costReduction = attackBonuses.costReduction / 100;
  const healthBonus = attackBonuses.healthBonus / 100;
  const speedBonus = attackBonuses.speedBonus / 100;
  
  // Si c'est un buffer, envoyer également 3 monstres basiques
  let totalCost = Math.floor(monsterData.cost * (1 - costReduction));
  if (monsterType === 'buffer') {
    const basicCost = Math.floor(CONSTANTS.MONSTER_TYPES.BASIC.cost * (1 - costReduction));
    totalCost += basicCost * 3; // 3 monstres basiques
  }
  
  if (!monsterData || playerMoney < totalCost) {
    showToast('Pas assez d\'argent !', 'warning');
    return;
  }

  // Créer le monstre avec :
  // - Les multiplicateurs globaux (niveau actuel du temps qui passe)
  // - Les bonus de recherche spécifiques du joueur qui envoie
  const enhancedMonster = {
    ...monsterData,
    health: Math.floor(monsterData.health * monsterHealthMultiplier * (1 + healthBonus)),
    speed: Math.floor(monsterData.speed * (1 + speedBonus)),
    reward: Math.floor(monsterData.reward * rewardMultiplier),
    cost: totalCost,
    level: monsterLevel,
    // Propriétés spéciales des monstres (si présentes)
    isInvisible: monsterData.isInvisible || false,
    canSplit: monsterData.canSplit || false,
    canSplitToBoss: monsterData.canSplitToBoss || false,
    splitCount: monsterData.splitCount || 0,
    stunDuration: monsterData.stunDuration || 0,
    maxStuns: monsterData.maxStuns || 0,
    buffRadius: monsterData.buffRadius || 0,
    healthBuff: monsterData.healthBuff || 0,
    spawnInterval: monsterData.spawnInterval || 0
  };

  // Si c'est un buffer, envoyer aussi les monstres basiques
  const monstersToSend = [{ targetPlayer, monsterType, monster: enhancedMonster }];
  
  if (monsterType === 'buffer') {
    // Créer 3 monstres basiques
    const basicData = CONSTANTS.MONSTER_TYPES.BASIC;
    const enhancedBasic = {
      ...basicData,
      health: Math.floor(basicData.health * monsterHealthMultiplier * (1 + healthBonus)),
      speed: Math.floor(basicData.speed * (1 + speedBonus)),
      reward: Math.floor(basicData.reward * rewardMultiplier),
      cost: Math.floor(basicData.cost * (1 - costReduction)),
      level: monsterLevel
    };
    
    // Ajouter 3 basiques
    for (let i = 0; i < 3; i++) {
      monstersToSend.push({ targetPlayer, monsterType: 'basic', monster: enhancedBasic });
    }
  }

  // Envoyer tous les monstres
  monstersToSend.forEach(data => {
    socket.emit(CONSTANTS.SOCKET_EVENTS.SEND_MONSTER, data);
  });
}

function showGameOver(data) {
  const modal = document.getElementById('game-over-modal');
  const message = document.getElementById('game-over-message');
  const stats = document.getElementById('final-stats');

  if (data.winner === currentUser.username) {
    message.textContent = '🏆 Vous avez gagné !';
  } else {
    message.textContent = `Le gagnant est: ${data.winner}`;
  }

  stats.innerHTML = `
    <h3>Statistiques finales</h3>
    ${data.players.map(p => `
      <div>${p.username}: ${p.kills} kills - ${p.isAlive ? '✓ Survivant' : '✗ Éliminé'}</div>
    `).join('')}
  `;

  modal.classList.remove('hidden');
}

function updateLeaderboard() {
  if (!playersStats || playersStats.length === 0) return;
  
  const leaderboardList = document.getElementById('leaderboard-list');
  
  // Trier les joueurs par vie restante (descendant)
  const sortedPlayers = [...playersStats].sort((a, b) => {
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    return (b.health || 0) - (a.health || 0);
  });
  
  leaderboardList.innerHTML = sortedPlayers.map((player, index) => {
    const health = CONSTANTS.GAME.MONSTER_PASS_LIMIT - (player.health || 0);
    const statusIcon = player.isAlive ? '✓' : '✗';
    const statusClass = player.isAlive ? 'alive' : 'eliminated';
    const rank = index + 1;
    
    return `
      <div class="leaderboard-item ${statusClass}">
        <div class="leaderboard-player-name">
          <span class="status-icon">${rank}.</span>
          <span>${player.username}</span>
        </div>
        <div class="leaderboard-player-stats">
          <span class="stat-gold">💰 ${player.money || 0}</span>
          <span class="stat-life">❤️ ${health}</span>
          <span class="stat-kills">💀 ${player.kills || 0}</span>
        </div>
      </div>
    `;
  }).join('');
}
