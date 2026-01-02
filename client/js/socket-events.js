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
      // Vérifier les valeurs avant et après
      const oldDamage = tower.damage;
      const oldFireRate = tower.fireRate;
      
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
    
    // Trouver la tour par son ancienne position
    const tower = towers.find(t => t.x === data.oldX && t.y === data.oldY);
    if (tower) {
      // Libérer l'ancienne case
      freeCell(tower.x, tower.y);
      
      // Mettre à jour la position
      tower.x = data.newX;
      tower.y = data.newY;
      
      // Occuper la nouvelle case
      occupyCell(data.newX, data.newY);
      
      // Déplacer le sprite et le cercle de portée
      if (tower.sprite) {
        tower.sprite.setPosition(data.newX, data.newY);
      }
      if (tower.rangeCircle) {
        tower.rangeCircle.setPosition(data.newX, data.newY);
      }
      
      // Déplacer aussi les auras si elles existent
      if (tower.goldAura) {
        tower.goldAura.setPosition(data.newX, data.newY);
      }
      if (tower.researchAura) {
        tower.researchAura.setPosition(data.newX, data.newY);
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
    }
  });

  socket.on(CONSTANTS.SOCKET_EVENTS.GAME_UPDATE, (data) => {
    if (data.players) {
      playersStats = data.players;
      updateUI();
    }
  });

  // Mise à jour des stats des joueurs en temps réel
  socket.on('PLAYERS_STATS_UPDATE', (data) => {
    if (data.players) {
      playersStats = data.players;
      updateUI();
    }
  });
}
