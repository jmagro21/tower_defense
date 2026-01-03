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
  document.getElementById('health').textContent = gameSettings.maxHealth - playerHealth;
  
  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;
  const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  document.getElementById('attack-gold-display').textContent = playerAttackGold;
  
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
  
  const basicElement = document.getElementById('basic-hp');
  const tankElement = document.getElementById('tank-hp');
  const fastElement = document.getElementById('fast-hp');
  const splitterElement = document.getElementById('splitter-hp');
  const bufferElement = document.getElementById('buffer-hp');
  const stunnerElement = document.getElementById('stunner-hp');
  const invisibleElement = document.getElementById('invisible-hp');
  const bossElement = document.getElementById('boss-hp');
  const bigbossElement = document.getElementById('bigboss-hp');
  
  if (basicElement) basicElement.textContent = `${basicHP} HP`;
  if (tankElement) tankElement.textContent = `${tankHP} HP`;
  if (fastElement) fastElement.textContent = `${fastHP} HP`;
  if (splitterElement) splitterElement.textContent = `${splitterHP} HP`;
  if (bufferElement) bufferElement.textContent = `${bufferHP} HP`;
  if (stunnerElement) stunnerElement.textContent = `${stunnerHP} HP`;
  if (invisibleElement) invisibleElement.textContent = `${invisibleHP} HP`;
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
  const bossCost = Math.floor(CONSTANTS.MONSTER_TYPES.BOSS.cost * (1 - costReduction));
  const bigbossCost = Math.floor(CONSTANTS.MONSTER_TYPES.BIGBOSS.cost * (1 - costReduction));
  
  const basicElement = document.getElementById('basic-cost');
  const tankElement = document.getElementById('tank-cost');
  const fastElement = document.getElementById('fast-cost');
  const splitterElement = document.getElementById('splitter-cost');
  const bufferElement = document.getElementById('buffer-cost');
  const stunnerElement = document.getElementById('stunner-cost');
  const invisibleElement = document.getElementById('invisible-cost');
  const bossElement = document.getElementById('boss-cost');
  const bigbossElement = document.getElementById('bigboss-cost');
  
  if (basicElement) basicElement.textContent = `💰 ${basicCost}`;
  if (tankElement) tankElement.textContent = `💰 ${tankCost}`;
  if (fastElement) fastElement.textContent = `💰 ${fastCost}`;
  if (splitterElement) splitterElement.textContent = `💰 ${splitterCost}`;
  if (bufferElement) bufferElement.textContent = `💰 ${bufferCost}`;
  if (stunnerElement) stunnerElement.textContent = `💰 ${stunnerCost}`;
  if (invisibleElement) invisibleElement.textContent = `💰 ${invisibleCost}`;
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
    spawnInterval: monsterData.spawnInterval || 0
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
    const maxLevel = getMaxTowerSize();
    const isMaxLevel = level >= maxLevel;
    
    // Calcul du coût d'amélioration avec passif ingénieur
    const defenseBonuses = getDefenseBonuses();
    let engineerDiscount = 0;
    if (typeof getEngineerUpgradeDiscount === 'function') {
      engineerDiscount = getEngineerUpgradeDiscount();
    }
    const totalReduction = defenseBonuses.upgradeCostReduction + engineerDiscount;
    let upgradeCost = Math.floor(towerData.upgradeCost * level * (1 - totalReduction / 100));
    
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
            `<button class="btn-upgrade-list" onclick="upgradeTowerFromList(${index})">
              ⬆️ ${upgradeCost} 💰
            </button>`
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
  
  const maxLevel = getMaxTowerSize();
  const currentLevel = tower.level;
  
  if (currentLevel >= maxLevel) {
    showToast('❌ Cette tour est au niveau maximum !', 'error');
    return;
  }
  
  const defenseBonuses = getDefenseBonuses();
  let engineerDiscount = 0;
  if (typeof getEngineerUpgradeDiscount === 'function') {
    engineerDiscount = getEngineerUpgradeDiscount();
  }
  const totalReduction = defenseBonuses.upgradeCostReduction + engineerDiscount;
  const upgradeCost = Math.floor(towerData.upgradeCost * currentLevel * (1 - totalReduction / 100));
  
  if (playerMoney < upgradeCost) {
    showToast(`❌ Pas assez d'or ! (${upgradeCost} 💰 requis)`, 'error');
    return;
  }
  
  // Appliquer l'amélioration
  playerMoney -= upgradeCost;
  tower.level = currentLevel + 1;
  
  // Mettre à jour les stats de la tour
  const damageBonus = getDefenseBonuses().damageBonus;
  tower.damage = Math.floor(towerData.damage * (1 + (tower.level - 1) * 0.35) * (1 + damageBonus / 100));
  
  const attackSpeedBonus = getDefenseBonuses().attackSpeedBonus;
  tower.fireRate = Math.floor(towerData.fireRate / (1 + (tower.level - 1) * 0.15) / (1 + attackSpeedBonus / 100));
  
  // Mettre à jour le label de niveau sur le sprite
  if (tower.levelText) {
    tower.levelText.setText(`Nv.${tower.level}`);
  }
  
  // Animation d'amélioration
  if (tower.sprite && gameScene) {
    gameScene.tweens.add({
      targets: tower.sprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });
  }
  
  showToast(`⬆️ Tour améliorée au niveau ${tower.level} !`, 'success');
  updateTowersPanelUI();
  updateUI();
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
