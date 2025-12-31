// Gestion de l'interface utilisateur
let playerMoney = 500;
let playerHealth = 0;
let playerKills = 0;
let playersStats = []; // Statistiques de tous les joueurs
let gameSettings = {
  startingMoney: 500,
  maxHealth: 20,
  monsterIntensity: 1.0,
  rewardMultiplier: 1.0
};

function updateUI() {
  document.getElementById('money').textContent = playerMoney;
  document.getElementById('health').textContent = CONSTANTS.GAME.MONSTER_PASS_LIMIT - playerHealth;
  
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
  
  // Mettre à jour les HP affichés des monstres
  updateMonsterHPDisplay();
  
  // Mettre à jour le classement
  updateLeaderboard();
}

function updateMonsterHPDisplay() {
  const basicHP = Math.floor(CONSTANTS.MONSTER_TYPES.BASIC.health * monsterHealthMultiplier);
  const tankHP = Math.floor(CONSTANTS.MONSTER_TYPES.TANK.health * monsterHealthMultiplier);
  const fastHP = Math.floor(CONSTANTS.MONSTER_TYPES.FAST.health * monsterHealthMultiplier);
  const bossHP = Math.floor(CONSTANTS.MONSTER_TYPES.BOSS.health * monsterHealthMultiplier);
  
  const basicElement = document.getElementById('basic-hp');
  const tankElement = document.getElementById('tank-hp');
  const fastElement = document.getElementById('fast-hp');
  const bossElement = document.getElementById('boss-hp');
  
  if (basicElement) basicElement.textContent = `${basicHP} HP`;
  if (tankElement) tankElement.textContent = `${tankHP} HP`;
  if (fastElement) fastElement.textContent = `${fastHP} HP`;
  if (bossElement) bossElement.textContent = `${bossHP} HP`;
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

  const monsterData = CONSTANTS.MONSTER_TYPES[monsterType.toUpperCase()];
  if (!monsterData || playerMoney < monsterData.cost) {
    showToast('Pas assez d\'argent !', 'warning');
    return;
  }

  // Créer le monstre avec les multiplicateurs de santé et récompense actuels
  const enhancedMonster = {
    ...monsterData,
    health: Math.floor(monsterData.health * monsterHealthMultiplier),
    reward: Math.floor(monsterData.reward * rewardMultiplier),
    level: monsterLevel
  };

  socket.emit(CONSTANTS.SOCKET_EVENTS.SEND_MONSTER, {
    targetPlayer, monsterType, monster: enhancedMonster
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
          <span class="stat-life">❤️ ${health}</span>
          <span class="stat-kills">💀 ${player.kills || 0}</span>
        </div>
      </div>
    `;
  }).join('');
}
