// Gestion des événements Socket
function setupGameEvents() {
  socket.on(CONSTANTS.SOCKET_EVENTS.TOWER_PLACED, (data) => {
    playerMoney = data.money;
    addTowerToScene(data.tower);
    occupyCell(data.tower.x, data.tower.y);
    updateUI();
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.MONEY_UPDATE, (data) => {
    playerMoney = data.money;
    updateUI();
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.MONSTER_SENT, (data) => {
    spawnMonster(data.monster);
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.PLAYER_LOST, (data) => {
    console.log(`${data.username} a perdu !`);
    if (data.username === currentUser.username) {
      showToast('💀 Vous avez été éliminé !', 'error');
    } else {
      showToast(`${data.username} a été éliminé !`, 'info');
    }
    // Mettre à jour le statut du joueur
    const playerIdx = playersStats.findIndex(p => p.username === data.username);
    if (playerIdx !== -1) {
      playersStats[playerIdx].isAlive = false;
    }
    
    // Mettre à jour la liste des joueurs cibles pour retirer le joueur mort
    updateTargetPlayers(playersStats);
    
    updateUI();
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.GAME_OVER, (data) => {
    showGameOver(data);
  });

  socket.on('TOWER_UPGRADED', (data) => {
    playerMoney = data.money;
    
    // Trouver la tour par ses coordonnées
    const tower = towers.find(t => t.x === data.tower.x && t.y === data.tower.y);
    
    if (tower) {
      // Vérifier les valeurs avant et après (avec valeurs par défaut pour éviter les crashes)
      const oldDamage = tower.damage || 0;
      const oldFireRate = tower.fireRate || 1000;
      
      // Récupérer les bonus de défense pour recalculer les dégâts avec bonus
      const defenseBonuses = getDefenseBonuses();
      
      // Mettre à jour le niveau et les dégâts/fireRate de BASE du serveur
      tower.level = (data.tower.level || tower.level || 1);
      const baseDamage = (data.tower.damage !== undefined ? data.tower.damage : tower.damage) || 1;
      const baseFireRate = (data.tower.fireRate !== undefined ? data.tower.fireRate : tower.fireRate) || 1000;
      const baseRange = (data.tower.range !== undefined ? data.tower.range : tower.range) || 100;
      
      // Réappliquer les bonus de recherche sur les dégâts du serveur
      tower.damage = baseDamage * (1 + defenseBonuses.damageBonus / 100);
      // Pour le fireRate: réduire le délai = augmenter la vitesse (multiplier par un facteur < 1)
      tower.fireRate = baseFireRate * (1 - defenseBonuses.attackSpeedBonus / 100);
      tower.range = baseRange;
      
      // DEBUG: Afficher dans la console
      console.log(`🔧 Tour améliorée:`, {
        position: `(${data.tower.x}, ${data.tower.y})`,
        level: tower.level,
        baseDamage: baseDamage,
        damageWithBonus: `${oldDamage.toFixed(1)} → ${tower.damage.toFixed(1)}`,
        fireRate: `${oldFireRate.toFixed(2)} → ${tower.fireRate.toFixed(2)}`,
        range: tower.range,
        defenseBonuses
      });
      
      // Mettre à jour le texte du niveau
      if (tower.levelText && tower.levelText.active) {
        tower.levelText.setText(`Nv.${tower.level}`);
      }
      
      // Mettre à jour le cercle de portée
      if (tower.rangeCircle && tower.rangeCircle.active) {
        tower.rangeCircle.setRadius(tower.range);
      }
      
      // Rafraîchir le menu de la tour si elle est sélectionnée
      if (selectedTower && selectedTower.x === tower.x && selectedTower.y === tower.y) {
        // Mettre à jour selectedTower avec les nouvelles valeurs
        selectedTower = tower;
        // Rafraîchir l'affichage du menu
        openTowerMenu(tower, tower.sprite);
      }
      
      showToast(`Tour améliorée au niveau ${tower.level} !`, 'success');
    } else {
      console.warn(`⚠️ Tour non trouvée à (${data.tower.x}, ${data.tower.y})`, {
        towersCount: towers.length,
        positions: towers.map(t => `(${t.x},${t.y})`).join(', ')
      });
    }
    updateUI();
  });

  socket.on('TOWER_MOVED', (data) => {
    playerMoney = data.money;
    
    // Vérifier si la tour déplacée était sélectionnée
    const wasSelected = selectedTower && selectedTower.x === data.oldX && selectedTower.y === data.oldY;
    
    // Trouver la tour par son ancienne position
    const towerIndex = towers.findIndex(t => t.x === data.oldX && t.y === data.oldY);
    if (towerIndex !== -1) {
      const oldTower = towers[towerIndex];
      
      // Libérer l'ancienne case
      freeCell(data.oldX, data.oldY);
      
      // Sauvegarder les données importantes de l'ancienne tour
      const savedData = {
        targetMode: oldTower.targetMode || 'nearest_end',
        abilities: oldTower.abilities || [],
        abilityIcons: oldTower.abilityIcons || []
      };
      
      // Supprimer tous les éléments graphiques de l'ancienne tour
      if (oldTower.sprite) oldTower.sprite.destroy();
      if (oldTower.rangeCircle) oldTower.rangeCircle.destroy();
      if (oldTower.goldAura) oldTower.goldAura.destroy();
      if (oldTower.researchAura) oldTower.researchAura.destroy();
      if (oldTower.levelText) oldTower.levelText.destroy();
      if (oldTower.stunEffect) oldTower.stunEffect.destroy();
      if (oldTower.stunIcon) oldTower.stunIcon.destroy();
      if (savedData.abilityIcons) {
        savedData.abilityIcons.forEach(icon => {
          if (icon && icon.destroy) icon.destroy();
        });
      }
      
      // Retirer de la liste des tours
      towers.splice(towerIndex, 1);
      
      // Recréer la tour à la nouvelle position avec toutes ses stats
      const newTowerData = {
        ...data.tower,
        x: data.tower.x,
        y: data.tower.y
      };
      
      // Ajouter la tour à la scène (cette fonction gère tout le visuel)
      addTowerToScene(newTowerData);
      
      // Occuper la nouvelle case
      occupyCell(data.tower.x, data.tower.y);
      
      // Restaurer les données sauvegardées sur la nouvelle tour
      const newTower = towers.find(t => t.x === data.tower.x && t.y === data.tower.y);
      if (newTower) {
        newTower.targetMode = savedData.targetMode;
        newTower.abilities = savedData.abilities;
        
        // Recréer les icônes de compétences
        if (savedData.abilities && savedData.abilities.length > 0) {
          savedData.abilities.forEach(abilityId => {
            const ability = CONSTANTS.TOWER_ABILITIES[abilityId.toUpperCase()];
            if (ability) {
              addAbilityIndicator(newTower, ability);
            }
          });
        }
        
        // Si la tour était sélectionnée, mettre à jour selectedTower et rouvrir le menu
        if (wasSelected) {
          selectedTower = newTower;
          openTowerMenu(newTower, newTower.sprite);
        }
      }
      
      showToast('✅ Tour déplacée !', 'success');
    }
    
    updateUI();
  });

  socket.on('TOWER_SOLD', (data) => {
    playerMoney = data.money;
    const towerIndex = towers.findIndex(t => t.x === data.x && t.y === data.y);
    if (towerIndex !== -1) {
      const tower = towers[towerIndex];
      freeCell(tower.x, tower.y);
      if (tower.sprite) tower.sprite.destroy();
      if (tower.rangeCircle) tower.rangeCircle.destroy();
      if (tower.goldAura) tower.goldAura.destroy();
      if (tower.researchAura) tower.researchAura.destroy();
      if (tower.levelText) tower.levelText.destroy();
      if (tower.stunEffect) tower.stunEffect.destroy();
      if (tower.stunIcon) tower.stunIcon.destroy();
      if (tower.abilityIcons) {
        tower.abilityIcons.forEach(icon => {
          if (icon && icon.destroy) icon.destroy();
        });
      }
      towers.splice(towerIndex, 1);
      showToast(`Tour vendue ! +${data.refund}💰`, 'success');
    }
    updateUI();
  });

  // Mise à jour des stats des joueurs
  socket.on('GAME_UPDATE', (data) => {
    if (data.players) {
      playersStats = data.players;
      updateUI();
      updateTargetPlayers(playersStats); // Ajouté pour forcer la mise à jour de la liste des cibles
    }
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.GAME_UPDATE, (data) => {
    if (data.players) {
      playersStats = data.players;
      updateUI();
      updateTargetPlayers(playersStats); // Ajouté pour forcer la mise à jour de la liste des cibles
    }
  });

  // Mise à jour des stats des joueurs en temps réel
  socket.on('PLAYERS_STATS_UPDATE', (data) => {
    if (data.players) {
      playersStats = data.players;
      updateUI();
      updateTargetPlayers(playersStats); // Ajouté pour forcer la mise à jour de la liste des cibles
    }
  });
  
  // ===== SYSTÈME SPECTATEUR =====
  // Broadcast périodique des données de map pour le système de spectateur
  setInterval(() => {
    // Ne broadcaster que si le jeu est actif et les variables sont initialisées
    if (socket && socket.connected && typeof gameScene !== 'undefined' && gameScene !== null) {
      broadcastMapState();
    }
  }, 500);
}

// Envoyer l'état de la map au serveur pour les spectateurs
function broadcastMapState() {
  if (!socket || !socket.connected) return;
  
  // Vérifier que les variables existent avant de les utiliser
  if (typeof towers === 'undefined' && typeof window.towers === 'undefined') return;
  if (typeof monsters === 'undefined' && typeof window.monsters === 'undefined') return;
  if (typeof path === 'undefined' && typeof window.path === 'undefined') return;
  
  const towersList = window.towers || (typeof towers !== 'undefined' ? towers : []);
  const monstersList = window.monsters || (typeof monsters !== 'undefined' ? monsters : []);
  const currentPath = window.path || (typeof path !== 'undefined' ? path : []);
  
  const mapData = {
    path: currentPath.map(p => ({ x: p.x, y: p.y })),
    towers: towersList.map(t => ({
      x: t.x,
      y: t.y,
      type: t.id || t.type || 'basic',
      level: t.level || 1,
      range: t.range || 100
    })),
    monsters: monstersList.map(m => ({
      x: m.sprite ? m.sprite.x : m.x,
      y: m.sprite ? m.sprite.y : m.y,
      type: m.id || m.type || 'basic'
    })),
    // Ajouter la santé du joueur pour le système spectateur
    health: window.playerHealth !== undefined ? window.playerHealth : playerHealth
  };
  
  socket.emit('broadcastMapState', mapData);
}
