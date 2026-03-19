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
  
  // Réinitialiser le système de classes
  if (typeof resetClassSystem === 'function') {
    resetClassSystem();
  }
  
  // Afficher le modal de sélection de classe
  if (typeof showClassSelection === 'function') {
    setTimeout(() => {
      showClassSelection();
    }, 500);
  }
  
  updateTargetPlayers(players);

  const config = {
    type: Phaser.AUTO,
    width: CONSTANTS.GAME.MAP_WIDTH,
    height: CONSTANTS.GAME.MAP_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#2d5016',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
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
  
  // Mettre à jour l'affichage des dégâts des tours (si la fonction existe)
  if (typeof updateTowerShopDisplay === 'function') {
    updateTowerShopDisplay();
  }
}

function create() {
  gameScene = this;
  
  // Arrière-plan adaptatif
  const bg = this.add.graphics();
  bg.fillStyle(0x2d5016, 1);
  bg.fillRect(0, 0, this.scale.width, this.scale.height);
  
  // Ajouter des décorations (herbe) proportionnellement à la taille
  const numDecorations = Math.floor((this.scale.width * this.scale.height) / 6000);
  for (let i = 0; i < numDecorations; i++) {
    const x = Math.random() * this.scale.width;
    const y = Math.random() * this.scale.height;
    this.add.circle(x, y, 2, 0x3a6b1f, 0.3);
  }

  // Charger la map sélectionnée
  setMap(window.selectedMap || 'standard');
  createPath();
  drawPath(this);
  drawGrid(this);

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
    const currentMovingTower = window.movingTower || movingTower;
    if (pointer.rightButtonDown() && currentMovingTower) {
      currentMovingTower.sprite.setAlpha(1);
      if (towerRangePreview) {
        towerRangePreview.destroy();
        towerRangePreview = null;
      }
      movingTower = null;
      window.movingTower = null;
      window.isTowerMoveInProgress = false;
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
    else if (window.movingTower || movingTower) {
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
  window.playerHealth = 0; // Sync pour le système spectateur
  playerKills = 0;
  playerAttackGold = 0; // Reset des golds d'attaque
  gameTime = 0;
  spawnUnitCapacity = 0;
  maxSpawnUnits = 5;
  monsterLevel = 1;
  monsterHealthMultiplier = 1;
  rewardMultiplier = 1;
  window.towers = [];
  window.isTowerMoveInProgress = false;
  window.lastMovedTower = null;
  monsters = [];
  
  // Initialiser le classement avec le joueur actuel
  if (currentUser) {
    playersStats = [{
      username: currentUser.username,
      health: 0,
      kills: 0,
      attackGold: 0,
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

  // Spawn dynamique - le délai change selon les vagues
  let spawnEvent = null;
  let lastSpawnDelay = 5000;
  
  const createSpawnEvent = (delay) => {
    if (spawnEvent) {
      spawnEvent.remove();
    }
    spawnEvent = this.time.addEvent({
      delay: delay,
      callback: () => {
        if (gameTime >= 10) {
          autoSpawnMonster();
        }
        // Vérifier si le délai a changé
        if (currentSpawnDelay !== lastSpawnDelay) {
          lastSpawnDelay = currentSpawnDelay;
          createSpawnEvent(currentSpawnDelay);
        }
      },
      loop: true
    });
  };
  
  createSpawnEvent(5000); // Démarre à 5 secondes

  // Nettoyage des projectiles orphelins (ceux qui sont restés bloqués)
  this.time.addEvent({
    delay: 5000,
    callback: () => {
      if (gameScene && gameScene.children) {
        // Nettoyer les cercles (projectiles) qui sont restés bloqués
        gameScene.children.list.forEach(child => {
          // Si c'est un cercle de projectile (pas un cercle de tour ou d'aura)
          if (child && child.type === 'Arc' && child.radius <= 5 && child.depth === 100) {
            // Projectile orphelin, le détruire
            if (child.active) {
              child.destroy();
            }
          }
        });
      }
    },
    loop: true
  });
}

function update(time, delta) {
  // Mettre à jour la position du cercle de preview
  const currentMovingTower = window.movingTower || (typeof movingTower !== 'undefined' ? movingTower : null);
  if (towerRangePreview && (selectedTowerType || currentMovingTower)) {
    const pointer = this.input.activePointer;
    // Snap sur la grille pour le preview
    const snapped = snapToGrid(pointer.x, pointer.y);
    towerRangePreview.setPosition(snapped.x, snapped.y);
    towerRangePreview.setVisible(true);
  } else if (towerRangePreview) {
    towerRangePreview.setVisible(false);
  }
  
  // Tir des tours
  const towersList = window.towers || (typeof towers !== 'undefined' ? towers : []);
  towersList.forEach(tower => {
    // Ne pas tirer si la tour est paralysée
    if (tower.isStunned) return;
    
    // Décrémenter le cooldown en fonction du delta time (en ms)
    // On normalise pour que le cooldown soit en ms au lieu de frames
    tower.cooldown -= delta;
    if (tower.cooldown <= 0) {
      // Tour électrique : attaque multi-cibles
      if (tower.id === 'electric') {
        const targets = findMonstersInRange(tower, CONSTANTS.TOWER_TYPES.ELECTRIC.maxTargets || 10);
        if (targets.length > 0) {
          electricAttack(tower, targets);
          tower.cooldown = tower.fireRate;
        }
      } else {
        const target = findClosestMonster(tower);
        if (target) {
          shootAtMonster(tower, target);
          tower.cooldown = tower.fireRate;
        }
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
    
    moveMonster(monster, delta);
    
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


