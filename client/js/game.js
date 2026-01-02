// Gestion du jeu Phaser - Cœur principal
let game = null;
let gameScene = null;

function initGame(players) {
  if (game) {
    try {
      game.destroy(true, false);
    } catch (e) {
      console.error('Erreur nettoyage Phaser:', e);
    }
    game = null;
  }
  
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.innerHTML = '';
  }
  
  updateTargetPlayers(players);

  const config = {
    type: Phaser.AUTO,
    width: CONSTANTS.GAME.MAP_WIDTH,
    height: CONSTANTS.GAME.MAP_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#2d5016',
    render: {
      pixelArt: true
    },
    callbacks: {
      postBoot: function(game) {
        game.isBooted = true;
      }
    },
    scene: {
      create: create,
      update: update
    }
  };
  
  // Désactiver la pause automatique quand la fenêtre perd le focus
  game = new Phaser.Game(config);
  if (game.events) {
    game.events.off('blur');
  }
  
  // Mettre à jour l'affichage des dégâts des tours
  updateTowerShopDisplay();
}

function create() {
  gameScene = this;
  
  // Arrière-plan
  const bg = this.add.graphics();
  bg.fillStyle(0x2d5016, 1);
  bg.fillRect(0, 0, CONSTANTS.GAME.MAP_WIDTH, CONSTANTS.GAME.MAP_HEIGHT);
  
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * CONSTANTS.GAME.MAP_WIDTH;
    const y = Math.random() * CONSTANTS.GAME.MAP_HEIGHT;
    this.add.circle(x, y, 2, 0x3a6b1f, 0.3);
  }

  // Charger la map sélectionnée
  setMap(selectedMap);
  createPath();
  drawPath();
  drawGrid();

  this.input.on('pointerdown', (pointer) => {
    // Vérifier si un menu/modal est ouvert (ne pas traiter les clics)
    const towerMenu = document.getElementById('tower-menu');
    const researchModal = document.getElementById('research-modal');
    const isTowerMenuOpen = towerMenu && !towerMenu.classList.contains('hidden');
    const isResearchModalOpen = researchModal && !researchModal.classList.contains('hidden');
    
    // Si un menu est ouvert, ignorer les clics sur le canvas
    if (isTowerMenuOpen || isResearchModalOpen) {
      return;
    }
    
    // Annuler le déplacement avec clic droit
    if (pointer.rightButtonDown() && movingTower) {
      movingTower.sprite.setAlpha(1);
      if (towerRangePreview) {
        towerRangePreview.destroy();
        towerRangePreview = null;
      }
      movingTower = null;
      showToast('❌ Déplacement annulé', 'info');
      return;
    }
    
    // Si le clic sur une tour a déjà été traité, ne pas continuer
    if (towerClickHandled) {
      return;
    }
    
    // Si on est en mode placement de tour
    if (selectedTowerType) {
      placeTower(pointer.x, pointer.y);
    }
    // Si on est en mode déplacement de tour
    else if (movingTower) {
      moveTower(pointer.x, pointer.y);
    }
    // Sinon, vérifier si on clique sur un espace vide (pas sur une tour)
    // Pour désélectionner la tour active
    else if (selectedTower) {
      // Le clic sur une tour est géré par son propre événement 'pointerdown'
      // Si on arrive ici, c'est qu'on a cliqué à côté, donc on désélectionne
      closeTowerMenu();
    }
  });

  playerMoney = 500;
  playerHealth = 0;
  playerKills = 0;
  gameTime = 0;
  spawnUnitCapacity = 0;
  maxSpawnUnits = 5;
  monsterLevel = 1;
  monsterHealthMultiplier = 1;
  rewardMultiplier = 1;
  towers = [];
  monsters = [];
  
  // Initialiser le classement avec le joueur actuel
  if (currentUser) {
    playersStats = [{
      username: currentUser.username,
      health: 0,
      kills: 0,
      isAlive: true
    }];
  }
  
  // Initialiser la recherche
  updateResearchUI();
  
  updateUI();

  this.time.addEvent({
    delay: 1000,
    callback: updateGameTime,
    loop: true
  });

  // Spawn tous les 5 secondes
  this.time.addEvent({
    delay: 5000,
    callback: () => {
      if (gameTime >= 10) {
        autoSpawnMonster();
      }
    },
    loop: true
  });

  this.time.addEvent({
    delay: 10000, // Réduit à 10 secondes car les projectiles sont nettoyés automatiquement maintenant
    callback: () => {
      if (gameScene && gameScene.tweens) {
        gameScene.tweens.killAll();
      }
    },
    loop: true
  });
}

function update(time, delta) {
  // Mettre à jour la position du cercle de preview
  if (towerRangePreview && (selectedTowerType || movingTower)) {
    const pointer = this.input.activePointer;
    // Snap sur la grille pour le preview
    const snapped = snapToGrid(pointer.x, pointer.y);
    towerRangePreview.setPosition(snapped.x, snapped.y);
    towerRangePreview.setVisible(true);
  } else if (towerRangePreview) {
    towerRangePreview.setVisible(false);
  }
  
  // Tir des tours
  towers.forEach(tower => {
    tower.cooldown--;
    if (tower.cooldown <= 0) {
      const target = findClosestMonster(tower);
      if (target) {
        shootAtMonster(tower, target);
        tower.cooldown = tower.fireRate / 16;
      }
    }
  });

  // Mise à jour des monstres
  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (!monster.sprite || !monster.sprite.active) {
      monsters.splice(i, 1);
      continue;
    }
    
    moveMonster(monster);
    
    if (monster.pathIndex >= path.length) {
      monsterReachedEnd(monster);
      monsters.splice(i, 1);
    }
  }
  
  // Mise à jour des buffs des monstres
  updateMonsterBuffs();
  
  // Mise à jour de l'aura de recherche (ralentissement + assist)
  updateResearchAura();
}


