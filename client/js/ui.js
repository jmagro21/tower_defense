// Gestion de l'interface utilisateur
let playerMoney = 500;
let playerHealth = 0;
window.playerHealth = 0; // Exposer globalement pour le système spectateur
let playerKills = 0;
let playerAttackGold = 0; // Gold dépensé en attaque (envoi de monstres)
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
  // Afficher les HP restants (arrondi sup)
  const remainingHealth = Math.max(0, Math.ceil(gameSettings.maxHealth - playerHealth));
  document.getElementById('health').textContent = remainingHealth;
  
  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;
  const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  document.getElementById('attack-gold-display').textContent = playerAttackGold;
  
  // Mettre à jour le bandeau d'indicateurs
  updateGameInfoBar();
  
  // Mettre à jour les stats du joueur actuel dans le classement
  if (playersStats.length > 0 && currentUser) {
    const playerIndex = playersStats.findIndex(p => p.username === currentUser.username);
    if (playerIndex !== -1) {
      playersStats[playerIndex].health = playerHealth;
      playersStats[playerIndex].attackGold = playerAttackGold;
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
  
  // Afficher MORT SUBITE après vague 60
  updateSuddenDeathDisplay();
}

function updateSuddenDeathDisplay() {
  let suddenDeathDiv = document.getElementById('sudden-death-banner');
  
  if (monsterLevel > 60) {
    if (!suddenDeathDiv) {
      suddenDeathDiv = document.createElement('div');
      suddenDeathDiv.id = 'sudden-death-banner';
      suddenDeathDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #8b0000 0%, #ff0000 100%);
        color: white;
        padding: 20px 40px;
        font-size: 3em;
        font-weight: bold;
        text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
        border: 4px solid #ffff00;
        border-radius: 15px;
        z-index: 9999;
        pointer-events: none;
        animation: pulseSuddenDeath 2s infinite;
      `;
      suddenDeathDiv.textContent = '💀 MORT SUBITE 💀';
      document.body.appendChild(suddenDeathDiv);
      
      // Ajouter l'animation CSS si elle n'existe pas
      if (!document.getElementById('sudden-death-style')) {
        const style = document.createElement('style');
        style.id = 'sudden-death-style';
        style.textContent = `
          @keyframes pulseSuddenDeath {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Faire disparaître après 5 secondes
      setTimeout(() => {
        if (suddenDeathDiv) {
          suddenDeathDiv.style.opacity = '0.3';
          suddenDeathDiv.style.fontSize = '1.5em';
          suddenDeathDiv.style.top = '10px';
          suddenDeathDiv.style.left = '50%';
          suddenDeathDiv.style.transform = 'translate(-50%, 0)';
          suddenDeathDiv.style.transition = 'all 1s ease';
        }
      }, 5000);
    }
  } else {
    if (suddenDeathDiv) {
      suddenDeathDiv.remove();
    }
  }
}

function updateTowerCount() {
  const towersList = window.towers || towers || [];
  const currentCount = towersList.length;
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
  const bossHP = Math.floor(CONSTANTS.MONSTER_TYPES.BOSS.health * monsterHealthMultiplier);
  const bigbossHP = Math.floor(CONSTANTS.MONSTER_TYPES.BIGBOSS.health * monsterHealthMultiplier);
  const demolisherHP = Math.floor(CONSTANTS.MONSTER_TYPES.DEMOLISHER.health * monsterHealthMultiplier);
  
  const basicElement = document.getElementById('basic-hp');
  const tankElement = document.getElementById('tank-hp');
  const fastElement = document.getElementById('fast-hp');
  const splitterElement = document.getElementById('splitter-hp');
  const bufferElement = document.getElementById('buffer-hp');
  const stunnerElement = document.getElementById('stunner-hp');
  const invisibleElement = document.getElementById('invisible-hp');
  const bossElement = document.getElementById('boss-hp');
  const bigbossElement = document.getElementById('bigboss-hp');
  const demolisherElement = document.getElementById('demolisher-hp');
  
  if (basicElement) basicElement.textContent = `${basicHP} HP`;
  if (tankElement) tankElement.textContent = `${tankHP} HP`;
  if (fastElement) fastElement.textContent = `${fastHP} HP`;
  if (splitterElement) splitterElement.textContent = `${splitterHP} HP`;
  if (bufferElement) bufferElement.textContent = `${bufferHP} HP`;
  if (stunnerElement) stunnerElement.textContent = `${stunnerHP} HP`;
  if (invisibleElement) invisibleElement.textContent = `${invisibleHP} HP`;
  if (bossElement) bossElement.textContent = `${bossHP} HP`;
  if (bigbossElement) bigbossElement.textContent = `${bigbossHP} HP`;
  if (demolisherElement) demolisherElement.textContent = `${demolisherHP} HP`;
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
  const bossCost = Math.floor(CONSTANTS.MONSTER_TYPES.BOSS.cost * (1 - costReduction));
  const bigbossCost = Math.floor(CONSTANTS.MONSTER_TYPES.BIGBOSS.cost * (1 - costReduction));
  const demolisherCost = Math.floor(CONSTANTS.MONSTER_TYPES.DEMOLISHER.cost * (1 - costReduction));
  
  const basicElement = document.getElementById('basic-cost');
  const tankElement = document.getElementById('tank-cost');
  const fastElement = document.getElementById('fast-cost');
  const splitterElement = document.getElementById('splitter-cost');
  const bufferElement = document.getElementById('buffer-cost');
  const stunnerElement = document.getElementById('stunner-cost');
  const invisibleElement = document.getElementById('invisible-cost');
  const bossElement = document.getElementById('boss-cost');
  const bigbossElement = document.getElementById('bigboss-cost');
  const demolisherElement = document.getElementById('demolisher-cost');
  
  if (basicElement) basicElement.textContent = `💰 ${basicCost}`;
  if (tankElement) tankElement.textContent = `💰 ${tankCost}`;
  if (fastElement) fastElement.textContent = `💰 ${fastCost}`;
  if (splitterElement) splitterElement.textContent = `💰 ${splitterCost}`;
  if (bufferElement) bufferElement.textContent = `💰 ${bufferCost}`;
  if (stunnerElement) stunnerElement.textContent = `💰 ${stunnerCost}`;
  if (invisibleElement) invisibleElement.textContent = `💰 ${invisibleCost}`;
  if (bossElement) bossElement.textContent = `💰 ${bossCost}`;
  if (bigbossElement) bigbossElement.textContent = `💰 ${bigbossCost}`;
  if (demolisherElement) demolisherElement.textContent = `💰 ${demolisherCost}`;
  
  // Afficher/masquer le bouton du Démolisseur selon la mort subite
  const demolisherBtn = document.querySelector('.demolisher-btn');
  if (demolisherBtn) {
    demolisherBtn.style.display = (typeof suddenDeathActive !== 'undefined' && suddenDeathActive) ? '' : 'none';
  }
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
  const currentValue = select.value; // Sauvegarder la sélection actuelle
  
  select.innerHTML = '<option value="">Choisir un joueur</option>';
  
  // Compter les joueurs vivants (hors nous-mêmes)
  const alivePlayers = players.filter(p => p.username !== currentUser.username && p.isAlive);
  
  // Ajouter l'option "Everyone" seulement s'il y a plus d'un joueur vivant
  if (alivePlayers.length > 1) {
    const everyoneOption = document.createElement('option');
    everyoneOption.value = 'everyone';
    everyoneOption.textContent = `🌍 TOUT LE MONDE (-20%) [${alivePlayers.length} joueurs]`;
    select.appendChild(everyoneOption);
  }
  
  // Ajouter les joueurs individuels
  alivePlayers.forEach(player => {
    const option = document.createElement('option');
    option.value = player.username;
    option.textContent = player.username;
    select.appendChild(option);
  });
  
  // Restaurer la sélection si elle existe toujours
  if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
    select.value = currentValue;
  }
}

function sendMonster(monsterType) {
  const targetPlayer = document.getElementById('target-player').value;
  if (!targetPlayer) {
    showToast('Veuillez sélectionner un joueur cible', 'warning');
    return;
  }
  
  // Vérifier si le Démolisseur est utilisé hors mort subite
  if (monsterType === 'demolisher' && (typeof suddenDeathActive === 'undefined' || !suddenDeathActive)) {
    showToast('⛔ Le Démolisseur est uniquement disponible en Mort Subite !', 'error');
    return;
  }
  
  // Mode "Everyone" - envoyer à tous les joueurs
  const isEveryoneMode = targetPlayer === 'everyone';
  
  // Obtenir la liste des joueurs cibles
  let targetPlayers = [];
  if (isEveryoneMode) {
    // Tous les joueurs vivants sauf nous-mêmes
    targetPlayers = playersStats.filter(p => p.isAlive && p.username !== currentUser.username).map(p => p.username);
    if (targetPlayers.length === 0) {
      showToast('Aucun autre joueur en vie !', 'error');
      return;
    }
  } else {
    // Vérifier si le joueur cible est toujours vivant
    const targetPlayerData = playersStats.find(p => p.username === targetPlayer);
    if (!targetPlayerData || !targetPlayerData.isAlive) {
      showToast('Ce joueur a été éliminé !', 'error');
      updateTargetPlayers(playersStats);
      return;
    }
    targetPlayers = [targetPlayer];
  }

  const monsterData = CONSTANTS.MONSTER_TYPES[monsterType.toUpperCase()];
  
  // Appliquer les bonus de recherche d'attaque du joueur qui envoie
  const attackBonuses = getAttackBonuses();
  const costReduction = attackBonuses.costReduction / 100;
  const healthBonus = attackBonuses.healthBonus / 100;
  const speedBonus = attackBonuses.speedBonus / 100;
  
  // Calculer le coût de base pour un monstre
  let baseCost = Math.floor(monsterData.cost * (1 - costReduction));
  
  // Appliquer la réduction de coût de la classe Attaque si active
  if (typeof getMonsterCostMultiplier === 'function') {
    baseCost = Math.floor(baseCost * getMonsterCostMultiplier());
  }
  
  if (monsterType === 'buffer') {
    const basicCost = Math.floor(CONSTANTS.MONSTER_TYPES.BASIC.cost * (1 - costReduction));
    baseCost += basicCost * 3; // 3 monstres basiques
  }
  
  // Calculer le coût total
  let totalCost;
  if (isEveryoneMode) {
    // Prix = (nombre de joueurs) * prix de base * 0.8 (réduction 20%)
    totalCost = Math.floor(baseCost * targetPlayers.length * 0.8);
  } else {
    totalCost = baseCost;
  }
  
  if (!monsterData || playerMoney < totalCost) {
    if (isEveryoneMode) {
      showToast(`Pas assez d'argent ! (${totalCost}💰 pour ${targetPlayers.length} joueurs)`, 'warning');
    } else {
      showToast('Pas assez d\'argent !', 'warning');
    }
    return;
  }

  // Créer le monstre avec les multiplicateurs
  const enhancedMonster = {
    ...monsterData,
    health: Math.floor(monsterData.health * monsterHealthMultiplier * (1 + healthBonus)),
    speed: Math.floor(monsterData.speed * (1 + speedBonus)),
    reward: Math.floor(monsterData.reward * rewardMultiplier),
    cost: isEveryoneMode ? Math.floor(baseCost * 0.8) : baseCost, // Coût individuel pour le serveur
    level: monsterLevel,
    isInvisible: monsterData.isInvisible || false,
    canSplit: monsterData.canSplit || false,
    canSplitToBoss: monsterData.canSplitToBoss || false,
    splitCount: monsterData.splitCount || 0,
    stunDuration: monsterData.stunDuration || 0,
    maxStuns: monsterData.maxStuns || 0,
    buffRadius: monsterData.buffRadius || 0,
    healthBuff: monsterData.healthBuff || 0,
    spawnInterval: monsterData.spawnInterval || 0,
    downgradeTower: monsterData.downgradeTower || false
  };

  // Envoyer à chaque joueur cible
  targetPlayers.forEach(target => {
    const monstersToSend = [{ targetPlayer: target, monsterType, monster: enhancedMonster }];
    
    if (monsterType === 'buffer') {
      const basicData = CONSTANTS.MONSTER_TYPES.BASIC;
      const enhancedBasic = {
        ...basicData,
        health: Math.floor(basicData.health * monsterHealthMultiplier * (1 + healthBonus)),
        speed: Math.floor(basicData.speed * (1 + speedBonus)),
        reward: Math.floor(basicData.reward * rewardMultiplier),
        cost: Math.floor(basicData.cost * (1 - costReduction)),
        level: monsterLevel
      };
      
      for (let i = 0; i < 3; i++) {
        monstersToSend.push({ targetPlayer: target, monsterType: 'basic', monster: enhancedBasic });
      }
    }

    monstersToSend.forEach(data => {
      socket.emit(CONSTANTS.SOCKET_EVENTS.SEND_MONSTER, data);
    });
  });
  
  // Tracker les golds dépensés en attaque
  playerAttackGold += totalCost;
  
  // Passif classe Attaque: gagner des points de recherche
  if (typeof onMonsterSent === 'function') {
    onMonsterSent(totalCost);
  }
  
  // Mettre à jour le bouton de compétence
  if (typeof updateSkillButton === 'function') {
    updateSkillButton();
  }
  
  // Envoyer la mise à jour au serveur
  socket.emit('UPDATE_ATTACK_GOLD', { attackGold: playerAttackGold });
  
  if (isEveryoneMode) {
    showToast(`🌍 ${monsterType.toUpperCase()} envoyé à ${targetPlayers.length} joueurs ! (-20%)`, 'success');
  }
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

// Cache pour éviter les mises à jour inutiles du leaderboard
let lastLeaderboardData = null;
let leaderboardUpdateTimer = null;

function updateLeaderboard() {
  if (!playersStats || playersStats.length === 0) return;
  
  // Créer une signature des données pour détecter les changements
  const dataSignature = playersStats.map(p => 
    `${p.username}:${p.money}:${p.health}:${p.kills}:${p.isAlive}:${p.attackGold}`
  ).join('|');
  
  // Ne mettre à jour que si les données ont changé
  if (dataSignature === lastLeaderboardData) return;
  lastLeaderboardData = dataSignature;
  
  // Utiliser un debounce pour éviter trop de mises à jour rapides
  if (leaderboardUpdateTimer) {
    clearTimeout(leaderboardUpdateTimer);
  }
  
  leaderboardUpdateTimer = setTimeout(() => {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    
    // Trier les joueurs: vivants d'abord, puis par HP restant (moins de monstres passés = mieux)
    const sortedPlayers = [...playersStats].sort((a, b) => {
      if (a.isAlive && !b.isAlive) return -1;
      if (!a.isAlive && b.isAlive) return 1;
      // Moins de health (monstres passés) = mieux, donc trier ascendant
      return (a.health || 0) - (b.health || 0);
    });
    
    const html = sortedPlayers.map((player, index) => {
      const health = Math.max(0, Math.ceil((gameSettings.maxHealth || CONSTANTS.GAME.MONSTER_PASS_LIMIT) - (player.health || 0)));
      const statusIcon = player.isAlive ? '✓' : '✗';
      const statusClass = player.isAlive ? 'alive' : 'eliminated';
      const rank = index + 1;
      const attackGold = player.attackGold || 0;
      const isCurrentPlayer = currentUser && player.username === currentUser.username;
      const clickableClass = !isCurrentPlayer ? 'spectatable' : '';
      const onClickAttr = !isCurrentPlayer ? `onclick="spectatePlayer('${player.username}')"` : '';
      
      return `
        <div class="leaderboard-item ${statusClass} ${clickableClass}" ${onClickAttr}>
          <div class="leaderboard-player-name">
            <span class="status-icon">${rank}.</span>
            <span>${player.username}</span>
            ${!isCurrentPlayer ? '<span class="spectate-icon" title="Voir la map">👁️</span>' : ''}
          </div>
          <div class="leaderboard-player-stats">
            <span class="stat-gold">💰 ${player.money || 0}</span>
            <span class="stat-attack" title="Gold dépensé en attaque">⚔️ ${attackGold}</span>
            <span class="stat-life">❤️ ${health}</span>
            <span class="stat-kills">💀 ${player.kills || 0}</span>
          </div>
        </div>
      `;
    }).join('');
    
    leaderboardList.innerHTML = html;
  }, 100); // Debounce de 100ms
}

// Toggle du panneau de gestion des tours
function toggleTowersPanel() {
  const modal = document.getElementById('towers-modal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    updateTowersPanelUI();
  } else {
    modal.classList.add('hidden');
  }
}

// Obtenir l'icône d'une ability par son ID
function getAbilityIcon(abilityId) {
  const abilityIcons = {
    'true_sight': '👁️',
    'fire': '🔥',
    'freeze': '❄️',
    'poison': '☠️',
    'piercing': '🎯',
    'splash': '💥',
    'chain': '⚡',
    'critical': '💀',
    'lifesteal': '❤️',
    'armor_break': '🛡️',
    'stun': '⚡',
    'multishot': '🎯',
    'rapid': '⚡',
    'gold_bonus': '💰',
    'range_up': '📡',
    'damage_up': '⚔️'
  };
  return abilityIcons[abilityId] || '✨';
}

// Mettre à jour l'affichage de la liste des tours
function updateTowersPanelUI() {
  const container = document.getElementById('towers-list-content');
  if (!container) return;
  
  // Mettre à jour l'affichage de l'or dans le modal
  const moneyDisplay = document.getElementById('towers-modal-money');
  if (moneyDisplay) {
    moneyDisplay.textContent = `💰 ${playerMoney || 0}`;
  }
  
  // Utiliser window.towers pour être sûr d'accéder à la bonne référence
  const towersList = window.towers || [];
  
  console.log('[UI] updateTowersPanelUI - towers:', towersList.length, towersList);
  
  if (!towersList || towersList.length === 0) {
    container.innerHTML = '<p class="no-towers-message">Aucune tour placée pour le moment.</p>';
    return;
  }
  
  const targetModeLabels = {
    'closest': '📍 Proche',
    'weakest': '💔 Faible',
    'fastest': '⚡ Rapide',
    'nearest_end': '🎯 Fin',
    'most_hp': '🛡️ Tank'
  };
  
  const towerTypeIcons = {
    'BASIC': '🔵',
    'SNIPER': '🎯',
    'SLOW': '❄️',
    'SPLASH': '💥',
    'GOLD': '💰',
    'RESEARCH': '🔬',
    'ELECTRIC': '⚡'
  };
  
  let html = `
    <div class="towers-panel-header">
      <div class="global-level-selector">
        <label for="global-target-level">🎯 Niveau cible global:</label>
        <input type="number" 
          id="global-target-level" 
          class="global-level-input" 
          min="1" 
          max="50" 
          value="1"
          onchange="applyGlobalTargetLevel()">
        <button class="btn-apply-global-level" onclick="applyGlobalTargetLevel()">
          ✅ Appliquer à toutes
        </button>
        <button class="btn-reset-all-levels" onclick="resetAllTargetLevels()">
          🔄 Réinitialiser
        </button>
      </div>
    </div>
    <table class="towers-table">
      <thead>
        <tr>
          <th>Tour</th>
          <th>Nv.</th>
          <th>Amélioration</th>
          <th>Augments</th>
          <th>Ciblage</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  towersList.forEach((tower, index) => {
    // Utiliser tower.id ou tower.type selon la propriété disponible
    const towerTypeKey = (tower.id || tower.type || 'basic').toUpperCase();
    const towerData = CONSTANTS.TOWER_TYPES[towerTypeKey];
    if (!towerData) return; // Skip si tour invalide
    
    const icon = towerTypeIcons[towerTypeKey] || '🔵';
    const level = tower.level || 1;
    const maxLevelForType = (tower.id === 'gold' || tower.id === 'research') ? 20 : 50;
    const isMaxLevel = level >= maxLevelForType;
    
    // Calcul du coût d'amélioration avec passif ingénieur
    const defenseBonuses = getDefenseBonuses();
    let engineerDiscount = 0;
    if (typeof getEngineerUpgradeDiscount === 'function') {
      engineerDiscount = getEngineerUpgradeDiscount();
    }
    const totalReduction = defenseBonuses.upgradeCostReduction + engineerDiscount;
    
    // Utiliser la fonction getTowerUpgradeCost pour calculer le coût (multiplicateur tous les 5 niveaux)
    const baseCost = typeof getTowerUpgradeCost === 'function' 
      ? getTowerUpgradeCost(towerData.upgradeCost, level)
      : towerData.upgradeCost * level;
    
    let upgradeCost = Math.floor(baseCost * (1 - totalReduction / 100));
    
    // Mode de ciblage actuel
    const targetMode = tower.targetMode || 'nearest_end';
    const targetLabel = targetModeLabels[targetMode] || targetMode;
    
    // Augments de la tour - afficher tous les augments disponibles
    const towerAbilities = tower.abilities || [];
    const allAugments = Object.values(CONSTANTS.TOWER_ABILITIES);
    const augmentsHtml = allAugments.map(aug => {
      const isOwned = towerAbilities.includes(aug.id);
      const cssClass = isOwned ? 'augment-owned' : 'augment-available';
      const title = isOwned ? `${aug.name} (activé)` : `${aug.name} - ${aug.cost} 💰`;
      const onclick = isOwned ? '' : `onclick="buyAugmentFromList(${index}, '${aug.id}')"`;
      return `<span class="augment-btn ${cssClass}" ${onclick} title="${title}">${aug.icon}</span>`;
    }).join('');
    
    html += `
      <tr class="tower-row" data-tower-index="${index}">
        <td class="tower-cell-type">
          <span class="tower-icon">${icon}</span>
          <span class="tower-name">${towerData.name}</span>
        </td>
        <td class="tower-cell-level">
          <span class="tower-level">${level}</span>
        </td>
        <td class="tower-cell-upgrade">
          ${isMaxLevel ? 
            '<span class="max-level-badge">MAX</span>' : 
            `<div class="upgrade-controls">
              <button class="btn-upgrade-list" onclick="upgradeTowerFromList(${index})">
                ⬆️ ${upgradeCost} 💰
              </button>
              <div class="multi-upgrade-controls">
                <input type="number" 
                  class="target-level-input" 
                  id="target-level-${index}" 
                  min="${level + 1}" 
                  max="${maxLevelForType}" 
                  value="${Math.min(level + 1, maxLevelForType)}"
                  onchange="updateMultiUpgradeCost(${index})">
                <button class="btn-multi-upgrade" 
                  id="btn-multi-${index}"
                  onclick="upgradeToTargetLevel(${index})">
                  🚀 Calculer
                </button>
              </div>
            </div>`
          }
        </td>
        <td class="tower-cell-augments">
          ${augmentsHtml}
        </td>
        <td class="tower-cell-target">
          <select class="target-mode-select" onchange="setTowerTargetFromList(${index}, this.value)">
            <option value="closest" ${targetMode === 'closest' ? 'selected' : ''}>📍 Proche</option>
            <option value="weakest" ${targetMode === 'weakest' ? 'selected' : ''}>💔 Faible</option>
            <option value="fastest" ${targetMode === 'fastest' ? 'selected' : ''}>⚡ Rapide</option>
            <option value="nearest_end" ${targetMode === 'nearest_end' ? 'selected' : ''}>🎯 Fin</option>
            <option value="most_hp" ${targetMode === 'most_hp' ? 'selected' : ''}>🛡️ Tank</option>
          </select>
        </td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Améliorer une tour depuis la liste
function upgradeTowerFromList(index) {
  // MORT SUBITE : Bloquer les améliorations après vague 60
  if (monsterLevel > 60) {
    showToast('❌ MORT SUBITE : Améliorations interdites !', 'error');
    return;
  }
  
  const towersList = window.towers || [];
  if (index < 0 || index >= towersList.length) return;
  
  const tower = towersList[index];
  const towerTypeKey = (tower.id || tower.type || 'basic').toUpperCase();
  const towerData = CONSTANTS.TOWER_TYPES[towerTypeKey];
  if (!towerData) return;
  
  // S'assurer que le niveau est défini
  if (!tower.level || isNaN(tower.level)) {
    tower.level = 1;
  }
  
  // Limite spéciale pour gold et research : niveau 20 max, autres tours : 50 max
  const maxLevelForType = (tower.id === 'gold' || tower.id === 'research') ? 20 : 50;
  const currentLevel = tower.level;
  
  if (currentLevel >= maxLevelForType) {
    showToast('❌ Cette tour est au niveau maximum !', 'error');
    return;
  }
  
  const defenseBonuses = getDefenseBonuses();
  let engineerDiscount = 0;
  if (typeof getEngineerUpgradeDiscount === 'function') {
    engineerDiscount = getEngineerUpgradeDiscount();
  }
  const totalReduction = defenseBonuses.upgradeCostReduction + engineerDiscount;
  
  // Utiliser getTowerUpgradeCost pour calculer le coût correctement
  const upgradeCost = typeof getTowerUpgradeCost === 'function' 
    ? Math.floor(getTowerUpgradeCost(towerData.upgradeCost, currentLevel) * (1 - totalReduction / 100))
    : Math.floor(towerData.upgradeCost * currentLevel * (1 - totalReduction / 100));
  
  if (playerMoney < upgradeCost) {
    showToast(`❌ Pas assez d'or ! (${upgradeCost} 💰 requis)`, 'error');
    return;
  }
  
  // Déduire l'argent localement pour un feedback immédiat
  playerMoney -= upgradeCost;
  updateUI();
  updateTowersPanelUI();
  
  // Envoyer l'amélioration au serveur (comme le fait le modal de tour)
  if (socket) {
    socket.emit('UPGRADE_TOWER', {
      towerId: tower.id,
      x: tower.x,
      y: tower.y
    });
  }
  
  // Le serveur répondra avec TOWER_UPGRADED qui mettra à jour l'interface
}

// Mettre à jour le coût d'amélioration multi-niveaux
function updateMultiUpgradeCost(index) {
  const towersList = window.towers || [];
  if (index < 0 || index >= towersList.length) return;
  
  const tower = towersList[index];
  const towerTypeKey = (tower.id || tower.type || 'basic').toUpperCase();
  const towerData = CONSTANTS.TOWER_TYPES[towerTypeKey];
  if (!towerData) return;
  
  const currentLevel = tower.level || 1;
  const targetLevelInput = document.getElementById(`target-level-${index}`);
  const btnMulti = document.getElementById(`btn-multi-${index}`);
  
  if (!targetLevelInput || !btnMulti) return;
  
  const targetLevel = parseInt(targetLevelInput.value) || currentLevel + 1;
  
  // Vérifier les limites
  const maxLevelForType = (tower.id === 'gold' || tower.id === 'research') ? 20 : 50;
  if (targetLevel > maxLevelForType) {
    targetLevelInput.value = maxLevelForType;
    return updateMultiUpgradeCost(index);
  }
  if (targetLevel <= currentLevel) {
    targetLevelInput.value = currentLevel + 1;
    return updateMultiUpgradeCost(index);
  }
  
  // Calculer le coût total
  let totalCost = 0;
  for (let level = currentLevel; level < targetLevel; level++) {
    totalCost += getTowerUpgradeCost(towerData.upgradeCost, level);
  }
  
  // Appliquer les réductions
  const defenseBonuses = getDefenseBonuses();
  let engineerDiscount = 0;
  if (typeof getEngineerUpgradeDiscount === 'function') {
    engineerDiscount = getEngineerUpgradeDiscount();
  }
  const totalReduction = defenseBonuses.upgradeCostReduction + engineerDiscount;
  totalCost = Math.floor(totalCost * (1 - totalReduction / 100));
  
  // Mettre à jour le bouton
  btnMulti.textContent = `🚀 ${totalCost} 💰`;
  btnMulti.disabled = playerMoney < totalCost;
}

// Propager le niveau cible à toutes les autres tours
function propagateTargetLevelToAll(sourceIndex, targetLevel) {
  const towersList = window.towers || [];
  
  towersList.forEach((tower, index) => {
    if (index === sourceIndex) return; // Ne pas affecter la tour source
    
    const currentLevel = tower.level || 1;
    const maxLevelForType = (tower.id === 'gold' || tower.id === 'research') ? 20 : 50;
    const effectiveTargetLevel = Math.min(targetLevel, maxLevelForType);
    
    // Ne mettre à jour que si le niveau cible est supérieur au niveau actuel
    if (effectiveTargetLevel > currentLevel) {
      const targetLevelInput = document.getElementById(`target-level-${index}`);
      if (targetLevelInput) {
        targetLevelInput.value = effectiveTargetLevel;
        // Recalculer le coût sans propager à nouveau (éviter la boucle infinie)
        updateMultiUpgradeCostSilent(index);
      }
    }
  });
}

// Version silencieuse de updateMultiUpgradeCost (sans propagation)
function updateMultiUpgradeCostSilent(index) {
  const towersList = window.towers || [];
  if (index < 0 || index >= towersList.length) return;
  
  const tower = towersList[index];
  const towerTypeKey = (tower.id || tower.type || 'basic').toUpperCase();
  const towerData = CONSTANTS.TOWER_TYPES[towerTypeKey];
  if (!towerData) return;
  
  const currentLevel = tower.level || 1;
  const targetLevelInput = document.getElementById(`target-level-${index}`);
  const btnMulti = document.getElementById(`btn-multi-${index}`);
  
  if (!targetLevelInput || !btnMulti) return;
  
  const targetLevel = parseInt(targetLevelInput.value) || currentLevel + 1;
  const maxLevelForType = (tower.id === 'gold' || tower.id === 'research') ? 20 : 50;
  
  if (targetLevel > maxLevelForType || targetLevel <= currentLevel) {
    return;
  }
  
  // Calculer le coût total
  let totalCost = 0;
  for (let level = currentLevel; level < targetLevel; level++) {
    totalCost += getTowerUpgradeCost(towerData.upgradeCost, level);
  }
  
  // Appliquer les réductions
  const defenseBonuses = getDefenseBonuses();
  let engineerDiscount = 0;
  if (typeof getEngineerUpgradeDiscount === 'function') {
    engineerDiscount = getEngineerUpgradeDiscount();
  }
  const totalReduction = defenseBonuses.upgradeCostReduction + engineerDiscount;
  totalCost = Math.floor(totalCost * (1 - totalReduction / 100));
  
  // Mettre à jour le bouton
  btnMulti.textContent = `🚀 ${totalCost} 💰`;
  btnMulti.disabled = playerMoney < totalCost;
}

// Améliorer une tour jusqu'à un niveau cible
function upgradeToTargetLevel(index) {
  // MORT SUBITE : Bloquer les améliorations après vague 60
  if (monsterLevel > 60) {
    showToast('❌ MORT SUBITE : Améliorations interdites !', 'error');
    return;
  }
  
  const towersList = window.towers || [];
  if (index < 0 || index >= towersList.length) return;
  
  const tower = towersList[index];
  const towerTypeKey = (tower.id || tower.type || 'basic').toUpperCase();
  const towerData = CONSTANTS.TOWER_TYPES[towerTypeKey];
  if (!towerData) return;
  
  const currentLevel = tower.level || 1;
  const targetLevelInput = document.getElementById(`target-level-${index}`);
  if (!targetLevelInput) return;
  
  const targetLevel = parseInt(targetLevelInput.value) || currentLevel + 1;
  
  // Vérifier les limites
  const maxLevelForType = (tower.id === 'gold' || tower.id === 'research') ? 20 : 50;
  if (targetLevel > maxLevelForType) {
    showToast(`❌ Niveau maximum: ${maxLevelForType}`, 'error');
    return;
  }
  if (targetLevel <= currentLevel) {
    showToast('❌ Niveau cible doit être supérieur au niveau actuel', 'error');
    return;
  }
  
  // Calculer le coût total
  let totalCost = 0;
  for (let level = currentLevel; level < targetLevel; level++) {
    totalCost += getTowerUpgradeCost(towerData.upgradeCost, level);
  }
  
  // Appliquer les réductions
  const defenseBonuses = getDefenseBonuses();
  let engineerDiscount = 0;
  if (typeof getEngineerUpgradeDiscount === 'function') {
    engineerDiscount = getEngineerUpgradeDiscount();
  }
  const totalReduction = defenseBonuses.upgradeCostReduction + engineerDiscount;
  totalCost = Math.floor(totalCost * (1 - totalReduction / 100));
  
  if (playerMoney < totalCost) {
    showToast(`❌ Pas assez d'or ! (${totalCost} 💰 requis)`, 'error');
    return;
  }
  
  // Déduire l'argent localement
  playerMoney -= totalCost;
  updateUI();
  
  // Envoyer au serveur
  if (socket) {
    socket.emit('UPGRADE_TOWER_MULTI', {
      x: tower.x,
      y: tower.y,
      targetLevel: targetLevel
    });
  }
  
  showToast(`🚀 Amélioration vers niveau ${targetLevel} lancée !`, 'success');
}

// Appliquer le niveau cible global à toutes les tours
function applyGlobalTargetLevel() {
  const globalInput = document.getElementById('global-target-level');
  if (!globalInput) return;
  
  const globalTargetLevel = parseInt(globalInput.value);
  if (!globalTargetLevel || globalTargetLevel < 1) {
    showToast('❌ Niveau invalide !', 'error');
    return;
  }
  
  const towersList = window.towers || [];
  let updatedCount = 0;
  
  towersList.forEach((tower, index) => {
    const currentLevel = tower.level || 1;
    const maxLevelForType = (tower.id === 'gold' || tower.id === 'research') ? 20 : 50;
    
    // Calculer le niveau cible effectif (limité par le max)
    const effectiveTargetLevel = Math.min(globalTargetLevel, maxLevelForType);
    
    // Ne mettre à jour que si le niveau cible est supérieur au niveau actuel
    if (effectiveTargetLevel > currentLevel) {
      const targetLevelInput = document.getElementById(`target-level-${index}`);
      if (targetLevelInput) {
        targetLevelInput.value = effectiveTargetLevel;
        updateMultiUpgradeCostSilent(index);
        updatedCount++;
      }
    }
  });
  
  if (updatedCount > 0) {
    showToast(`✅ Niveau ${globalTargetLevel} appliqué à ${updatedCount} tour(s)`, 'success');
  } else {
    showToast('ℹ️ Aucune tour à mettre à jour', 'info');
  }
}

function resetAllTargetLevels() {
  const towersList = window.towers || [];
  let resetCount = 0;
  
  towersList.forEach((tower, index) => {
    const currentLevel = tower.level || 1;
    const targetLevelInput = document.getElementById(`target-level-${index}`);
    const btnMulti = document.getElementById(`btn-multi-${index}`);
    
    if (targetLevelInput) {
      targetLevelInput.value = currentLevel;
      resetCount++;
    }
    
    if (btnMulti) {
      btnMulti.textContent = `🚀 0 💰`;
      btnMulti.disabled = true;
    }
  });
  
  if (resetCount > 0) {
    showToast(`🔄 ${resetCount} calcul(s) réinitialisé(s) !`, 'success');
  }
}

// Changer le mode de ciblage d'une tour depuis la liste
function setTowerTargetFromList(index, mode) {
  const towersList = window.towers || towers || [];
  if (index < 0 || index >= towersList.length) return;
  
  towersList[index].targetMode = mode;
  
  const modeName = {
    'closest': 'Plus proche',
    'weakest': 'Plus faible HP',
    'fastest': 'Plus rapide',
    'nearest_end': 'Plus près de la fin',
    'most_hp': 'Plus de HP'
  }[mode];
  
  showToast(`🎯 Ciblage changé: ${modeName}`, 'info');
}

// Acheter un augment depuis la liste des tours
function buyAugmentFromList(towerIndex, augmentId) {
  const towersList = window.towers || [];
  if (towerIndex < 0 || towerIndex >= towersList.length) return;
  
  const tower = towersList[towerIndex];
  const augment = Object.values(CONSTANTS.TOWER_ABILITIES).find(a => a.id === augmentId);
  
  if (!augment) {
    showToast('❌ Augment introuvable !', 'error');
    return;
  }
  
  // Vérifier si déjà possédé
  if (!tower.abilities) tower.abilities = [];
  if (tower.abilities.includes(augmentId)) {
    showToast('❌ Vous avez déjà cet augment !', 'error');
    return;
  }
  
  // Vérifier l'argent
  if (playerMoney < augment.cost) {
    showToast(`❌ Pas assez d'or ! (${augment.cost} 💰 requis)`, 'error');
    return;
  }
  
  // Acheter l'augment
  playerMoney -= augment.cost;
  tower.abilities.push(augmentId);
  
  // Ajouter l'indicateur visuel sur la tour
  if (typeof addAbilityIndicator === 'function') {
    addAbilityIndicator(tower, augment);
  }
  
  showToast(`${augment.icon} ${augment.name} acheté pour ${augment.cost} 💰 !`, 'success');
  updateTowersPanelUI();
  updateUI();
}

// ========================================
// BANDEAU D'INDICATEURS DE JEU
// ========================================

// Mapping des icônes de monstres pour le bandeau
const MONSTER_ICONS = {
  basic: '🔴',
  tank: '⬛',
  fast: '🟠',
  splitter: '🔀',
  buffer: '➕',
  stunner: '⚡',
  invisible: '👻',
  boss: '👿',
  bigboss: '👹'
};

function updateGameInfoBar() {
  // Manche actuelle
  const waveEl = document.getElementById('wave-number');
  if (waveEl) {
    waveEl.textContent = monsterLevel || 1;
    // Couleur selon la difficulté
    if (monsterLevel > 60) {
      waveEl.style.color = '#ff0000';
      waveEl.parentElement.parentElement.setAttribute('data-ui-tooltip', 
        `💀 MORT SUBITE ! Manche ${monsterLevel}. Seuls les Titans spawnent. Améliorations de tours interdites. Dernier survivant !`);
    } else if (monsterLevel >= 20) {
      waveEl.style.color = '#ff6600';
      waveEl.parentElement.parentElement.setAttribute('data-ui-tooltip', 
        `⚠️ Manche ${monsterLevel} - Invasion massive ! Tous les types de monstres, boss inclus. Spawn très rapide.`);
    } else if (monsterLevel >= 10) {
      waveEl.style.color = '#ffaa00';
      waveEl.parentElement.parentElement.setAttribute('data-ui-tooltip', 
        `🌟 Manche ${monsterLevel}. Les BOSS commencent à apparaître ! Spawn accéléré à 2.5s.`);
    } else {
      waveEl.style.color = '#4fc3f7';
    }
  }

  // Budget de spawn
  const spawnEl = document.getElementById('spawn-budget');
  if (spawnEl) {
    spawnEl.textContent = spawnUnitCapacity || 0;
    if (spawnUnitCapacity > 100) {
      spawnEl.style.color = '#ff4444';
    } else if (spawnUnitCapacity > 50) {
      spawnEl.style.color = '#ffaa00';
    } else {
      spawnEl.style.color = '#4fc3f7';
    }
  }

  // Temps de jeu
  const timeEl = document.getElementById('game-time-display');
  if (timeEl) {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Monstres actifs (types qui spawnen actuellement)
  const monstersEl = document.getElementById('active-monsters-list');
  if (monstersEl && typeof getAvailableMonsterTypes === 'function') {
    const types = getAvailableMonsterTypes();
    const uniqueTypes = [...new Set(types)];
    const icons = uniqueTypes.map(t => MONSTER_ICONS[t] || '❓');
    monstersEl.textContent = icons.join(' ');
    
    // Tooltip dynamique avec les noms
    const typeNames = {
      basic: 'Basique', tank: 'Tank', fast: 'Rapide', splitter: 'Diviseur',
      buffer: 'Soigneur', stunner: 'Paralyseur', invisible: 'Fantôme',
      boss: 'Boss', bigboss: 'Titan'
    };
    const nameList = uniqueTypes.map(t => `${MONSTER_ICONS[t]} ${typeNames[t] || t}`).join(', ');
    monstersEl.parentElement.setAttribute('data-ui-tooltip', 
      `Monstres qui spawnen cette manche : ${nameList}. De nouveaux types se débloquent avec les manches.`);
  }

  // Prochain événement
  const nextEl = document.getElementById('next-event-text');
  if (nextEl) {
    nextEl.textContent = getNextEventText();
    nextEl.parentElement.setAttribute('data-ui-tooltip', getNextEventTooltip());
  }

  // Mettre à jour le tooltip du bouton de compétence
  updateSkillTooltip();
}

function getNextEventText() {
  if (gameTime < 15) {
    return `Monstres dans ${15 - gameTime}s`;
  }
  
  // Trouver le prochain événement de vague
  const waveTimings = [
    { time: 45, label: 'Vague 2' },
    { time: 75, label: 'Vague 3' },
    { time: 105, label: 'Vague 4' },
    { time: 315, label: 'Manche 10' }
  ];

  for (const wave of waveTimings) {
    if (gameTime < wave.time) {
      const remaining = wave.time - gameTime;
      return `${wave.label} dans ${remaining}s`;
    }
  }

  // Après manche 10, prochain palier (toutes les 30s)
  const nextPalier = Math.ceil(gameTime / 30) * 30;
  const remaining = nextPalier - gameTime;
  if (remaining > 0 && remaining <= 30) {
    return `Manche ${monsterLevel + 1} dans ${remaining}s`;
  }

  if (monsterLevel > 60) {
    return '💀 MORT SUBITE';
  }
  
  return `Manche ${monsterLevel}`;
}

function getNextEventTooltip() {
  if (gameTime < 15) {
    return `Les premiers monstres arrivent dans ${15 - gameTime} secondes. Profitez-en pour placer vos premières tours !`;
  }
  if (gameTime < 45) {
    return `Vague 2 dans ${45 - gameTime}s - Les Tanks arrivent ! Préparez des tours à gros dégâts.`;
  }
  if (gameTime < 75) {
    return `Vague 3 dans ${75 - gameTime}s - Rapides et Diviseurs arrivent. Diversifiez vos défenses.`;
  }
  if (gameTime < 105) {
    return `Vague 4 dans ${105 - gameTime}s - Les Soigneurs et Paralyseurs rejoignent la bataille.`;
  }
  if (gameTime < 315) {
    return `Manche 10 dans ${315 - gameTime}s - Les BOSS feront leur apparition ! Renforcez vos tours.`;
  }
  if (monsterLevel > 60) {
    return '💀 MORT SUBITE active ! Seuls les Titans spawnent. Pas d\'améliorations possibles. Dernière chance de survie !';
  }
  if (monsterLevel >= 20) {
    return `Invasion massive active. Vague ${monsterLevel + 1} bientôt. Le spawn s'accélère continuellement.`;
  }
  return `Prochaine manche dans ~30s. Les monstres deviennent plus forts à chaque transition.`;
}

function updateSkillTooltip() {
  const btn = document.getElementById('skill-button');
  if (!btn || !playerClass) return;

  const classData = PLAYER_CLASSES[playerClass];
  if (!classData) return;

  const currentCost = Math.floor(skillCost * Math.pow(skillCostMultiplier, skillUsageCount));
  const canUse = playerAttackGold >= currentCost;

  let tooltipText = `${classData.icon} ${classData.name}\n\n`;
  tooltipText += `⚡ ACTIF: ${classData.active.name}\n`;
  tooltipText += `${classData.active.description}\n`;
  tooltipText += `💰 Coût: ${formatNumber(currentCost)} or d'attaque\n`;
  tooltipText += canUse ? '✅ Utilisable maintenant !' : `❌ Il vous faut ${formatNumber(currentCost - playerAttackGold)} or d'attaque de plus`;
  tooltipText += `\n\n🔄 PASSIF: ${classData.passive.name}\n`;
  tooltipText += classData.passive.description;
  if (skillUsageCount > 0) {
    tooltipText += `\n\n📊 Utilisations: ${skillUsageCount} (coût +${Math.round((Math.pow(skillCostMultiplier, skillUsageCount) - 1) * 100)}%)`;
  }

  btn.setAttribute('data-ui-tooltip', tooltipText);
}
