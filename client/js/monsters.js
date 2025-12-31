// Gestion des monstres
let monsters = [];

function spawnMonster(monsterData) {
  // Appliquer les bonus de recherche d'attaque
  const attackBonuses = getAttackBonuses();
  
  // Créer une copie des données du monstre pour ne pas modifier l'original
  const enhancedMonsterData = {
    ...monsterData,
    health: Math.floor(monsterData.health * (1 + attackBonuses.healthBonus / 100)),
    speed: Math.floor(monsterData.speed * (1 + attackBonuses.speedBonus / 100)),
    cost: Math.floor(monsterData.cost * (1 - attackBonuses.costReduction / 100))
  };
  
  const container = gameScene.add.container(path[0].x, path[0].y);
  
  let monsterGraphics;

  if (monsterData.id === 'basic') {
    const body = gameScene.add.circle(0, 0, 12, 0xe74c3c);
    const eye1 = gameScene.add.circle(-4, -3, 2, 0xffffff);
    const eye2 = gameScene.add.circle(4, -3, 2, 0xffffff);
    const pupil1 = gameScene.add.circle(-4, -3, 1, 0x000000);
    const pupil2 = gameScene.add.circle(4, -3, 1, 0x000000);
    monsterGraphics = [body, eye1, eye2, pupil1, pupil2];
  } else if (monsterData.id === 'tank') {
    const body = gameScene.add.rectangle(0, 0, 25, 20, 0x95a5a6);
    const armor1 = gameScene.add.rectangle(-8, -8, 8, 8, 0x7f8c8d);
    const armor2 = gameScene.add.rectangle(8, -8, 8, 8, 0x7f8c8d);
    const armor3 = gameScene.add.rectangle(-8, 8, 8, 8, 0x7f8c8d);
    const armor4 = gameScene.add.rectangle(8, 8, 8, 8, 0x7f8c8d);
    monsterGraphics = [body, armor1, armor2, armor3, armor4];
  } else if (monsterData.id === 'fast') {
    const body = gameScene.add.ellipse(0, 0, 20, 10, 0xf39c12);
    const tail1 = gameScene.add.triangle(-12, 0, -15, -4, -15, 4, -12, 0, 0xf39c12);
    const tail2 = gameScene.add.triangle(-18, 0, -21, -3, -21, 3, -18, 0, 0xe67e22);
    const eye = gameScene.add.circle(6, -2, 3, 0xffffff);
    const pupil = gameScene.add.circle(7, -2, 1.5, 0x000000);
    monsterGraphics = [tail2, tail1, body, eye, pupil];
  } else if (monsterData.id === 'boss') {
    const body = gameScene.add.circle(0, 0, 20, 0x8e44ad);
    const horn1 = gameScene.add.triangle(-12, -15, -8, -20, -15, -8, 0x000000);
    const horn2 = gameScene.add.triangle(12, -15, 8, -20, 15, -8, 0x000000);
    const eye1 = gameScene.add.circle(-8, -5, 4, 0xff0000);
    const eye2 = gameScene.add.circle(8, -5, 4, 0xff0000);
    const mouth = gameScene.add.arc(0, 5, 8, 0, Math.PI, false, 0x000000);
    monsterGraphics = [body, horn1, horn2, eye1, eye2, mouth];
  }

  monsterGraphics.forEach(g => container.add(g));

  const healthBarBg = gameScene.add.rectangle(0, -25, 30, 5, 0x000000);
  const healthBar = gameScene.add.rectangle(0, -25, 30, 5, 0x27ae60);
  healthBar.setOrigin(0.5);
  container.add(healthBarBg);
  container.add(healthBar);

  const hpText = gameScene.add.text(0, -32, `${enhancedMonsterData.health}`, {
    fontSize: '10px', fill: '#fff', fontStyle: 'bold',
    stroke: '#000', strokeThickness: 2
  });
  hpText.setOrigin(0.5);
  container.add(hpText);

  if (enhancedMonsterData.level && enhancedMonsterData.level > 1) {
    const levelBadge = gameScene.add.text(0, 22, `★${enhancedMonsterData.level}`, {
      fontSize: '10px', fill: '#ffd700', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2
    });
    levelBadge.setOrigin(0.5);
    container.add(levelBadge);
  }

  const monster = {
    ...enhancedMonsterData,
    sprite: container,
    healthBar: healthBar,
    hpText: hpText,
    pathIndex: 0,
    currentHealth: enhancedMonsterData.health,
    maxHealth: enhancedMonsterData.health,
    progress: 0
  };

  monsters.push(monster);
}

function moveMonster(monster) {
  if (monster.pathIndex >= path.length) return;

  const current = path[monster.pathIndex];
  const next = path[Math.min(monster.pathIndex + 1, path.length - 1)];
  
  const dx = next.x - current.x;
  const dy = next.y - current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const speed = monster.speed / 60;
  monster.progress += speed / distance;

  if (monster.progress >= 1) {
    monster.progress = 0;
    monster.pathIndex++;
  }

  if (monster.pathIndex < path.length) {
    const targetPos = path[monster.pathIndex];
    const nextPos = path[Math.min(monster.pathIndex + 1, path.length - 1)];
    
    monster.sprite.x = targetPos.x + (nextPos.x - targetPos.x) * monster.progress;
    monster.sprite.y = targetPos.y + (nextPos.y - targetPos.y) * monster.progress;
  }
}

function findClosestMonster(tower) {
  let closest = null;
  let closestDist = Infinity;

  monsters.forEach(monster => {
    if (!monster.sprite || !monster.sprite.active) return;
    
    const dx = monster.sprite.x - tower.x;
    const dy = monster.sprite.y - tower.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= tower.range && dist < closestDist) {
      closest = monster;
      closestDist = dist;
    }
  });

  return closest;
}

function shootAtMonster(tower, monster) {
  let projectileColor = 0xffff00;
  let projectileSize = 3;

  if (tower.id === 'sniper') {
    projectileColor = 0x3498db;
    projectileSize = 2;
  } else if (tower.id === 'rapid') {
    projectileColor = 0xe74c3c;
    projectileSize = 2;
  }

  const projectile = gameScene.add.circle(tower.x, tower.y, projectileSize, projectileColor);
  projectile.setDepth(100);

  const tween = gameScene.tweens.add({
    targets: projectile,
    x: monster.sprite.x,
    y: monster.sprite.y,
    duration: 100,
    ease: 'Linear',
    onComplete: () => {
      // Détruire le projectile immédiatement
      if (projectile && projectile.active) {
        projectile.destroy();
      }

      // Vérifier que le monstre existe toujours
      if (!monster || !monster.sprite || !monster.sprite.active) return;

      monster.currentHealth -= tower.damage;

      // Si le monstre meurt, le détruire immédiatement
      if (monster.currentHealth <= 0) {
        killMonster(monster);
        return;
      }

      // Mettre à jour les barres de vie seulement si le monstre est vivant
      if (monster.healthBar && monster.healthBar.active) {
        const healthPercent = Math.max(0, monster.currentHealth / monster.maxHealth);
        monster.healthBar.width = 30 * healthPercent;
        
        if (healthPercent > 0.5) {
          monster.healthBar.setFillStyle(0x27ae60);
        } else if (healthPercent > 0.25) {
          monster.healthBar.setFillStyle(0xf39c12);
        } else {
          monster.healthBar.setFillStyle(0xe74c3c);
        }
      }

      if (monster.hpText && monster.hpText.active) {
        monster.hpText.setText(Math.max(0, monster.currentHealth));
      }
    },
    onStop: () => {
      // Si le tween est stoppé/killé, détruire le projectile
      if (projectile && projectile.active) {
        projectile.destroy();
      }
    }
  });
}

function killMonster(monster) {
  if (!monster || !monster.sprite) return;
  
  const index = monsters.indexOf(monster);
  if (index > -1) {
    monsters.splice(index, 1);
  }
  
  // Détruire tous les éléments du monstre
  if (monster.sprite && monster.sprite.active) {
    try {
      monster.sprite.destroy();
    } catch (e) {
      console.error('Erreur destruction sprite monstre:', e);
    }
  }

  // Détruire la barre de santé
  if (monster.healthBar && monster.healthBar.active) {
    try {
      monster.healthBar.destroy();
    } catch (e) {}
  }

  // Détruire le texte HP
  if (monster.hpText && monster.hpText.active) {
    try {
      monster.hpText.destroy();
    } catch (e) {}
  }

  socket.emit(CONSTANTS.SOCKET_EVENTS.MONSTER_KILLED, {
    monsterId: monster.id,
    reward: monster.reward
  });

  playerMoney += monster.reward;
  // Ne pas incrémenter playerKills ici - le serveur est la source de vérité
  // et enverra les stats via PLAYERS_STATS_UPDATE
  
  // Progression de la recherche en cours
  addResearchKill();
  
  updateUI();
}

function monsterReachedEnd(monster) {
  if (!monster) return;
  
  // Détruire tous les éléments du monstre proprement
  if (monster.sprite && monster.sprite.active) {
    try {
      monster.sprite.destroy();
    } catch (e) {
      console.error('Erreur destruction sprite:', e);
    }
  }

  if (monster.healthBar && monster.healthBar.active) {
    try {
      monster.healthBar.destroy();
    } catch (e) {}
  }

  if (monster.hpText && monster.hpText.active) {
    try {
      monster.hpText.destroy();
    } catch (e) {}
  }

  playerHealth++;
  updateUI();

  socket.emit(CONSTANTS.SOCKET_EVENTS.MONSTER_PASSED);

  if (playerHealth >= CONSTANTS.GAME.MONSTER_PASS_LIMIT) {
    showToast('💀 Vous avez été éliminé !', 'error');
  }
}
