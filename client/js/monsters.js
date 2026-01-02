// Gestion des monstres
let monsters = [];

function spawnMonster(monsterData) {
  // Les données du monstre reçu contiennent déjà les bonus appliqués
  // (que ce soit depuis le serveur ou depuis autoSpawnMonster)
  // Donc on utilise directement les données sans les modifier
  
  // Déterminer la position initiale
  // Si pathIndex et progress sont fournis (monstre divisé), utiliser la position calculée
  let startX = path[0].x;
  let startY = path[0].y;
  
  if (monsterData.pathIndex !== undefined && monsterData.progress !== undefined && monsterData.pathIndex < path.length) {
    const currentPathIndex = monsterData.pathIndex;
    const progress = monsterData.progress;
    const current = path[currentPathIndex];
    const next = path[Math.min(currentPathIndex + 1, path.length - 1)];
    
    startX = current.x + (next.x - current.x) * progress;
    startY = current.y + (next.y - current.y) * progress;
  }
  
  const container = gameScene.add.container(startX, startY);
  
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
  } else if (monsterData.id === 'splitter') {
    // Monstre diviseur - forme d'amibe/blob
    const body = gameScene.add.circle(0, 0, 14, 0x16a085);
    const blob1 = gameScene.add.circle(-6, -4, 6, 0x1abc9c);
    const blob2 = gameScene.add.circle(6, -4, 6, 0x1abc9c);
    const blob3 = gameScene.add.circle(-4, 6, 5, 0x1abc9c);
    const blob4 = gameScene.add.circle(4, 6, 5, 0x1abc9c);
    const eye1 = gameScene.add.circle(-5, -2, 3, 0xffffff);
    const eye2 = gameScene.add.circle(5, -2, 3, 0xffffff);
    const pupil1 = gameScene.add.circle(-5, -2, 1.5, 0x000000);
    const pupil2 = gameScene.add.circle(5, -2, 1.5, 0x000000);
    monsterGraphics = [body, blob1, blob2, blob3, blob4, eye1, eye2, pupil1, pupil2];
  } else if (monsterData.id === 'buffer') {
    // Monstre buffer - forme de croix de soin
    const body = gameScene.add.circle(0, 0, 15, 0x2ecc71);
    const cross1 = gameScene.add.rectangle(0, 0, 8, 20, 0xffffff);
    const cross2 = gameScene.add.rectangle(0, 0, 20, 8, 0xffffff);
    const core = gameScene.add.circle(0, 0, 6, 0x27ae60);
    const glow1 = gameScene.add.circle(-8, -8, 3, 0xa9dfbf);
    const glow2 = gameScene.add.circle(8, -8, 3, 0xa9dfbf);
    const glow3 = gameScene.add.circle(-8, 8, 3, 0xa9dfbf);
    const glow4 = gameScene.add.circle(8, 8, 3, 0xa9dfbf);
    monsterGraphics = [body, glow1, glow2, glow3, glow4, cross1, cross2, core];
  } else if (monsterData.id === 'stunner') {
    // Monstre stunner - forme d'éclair/électrique
    const body = gameScene.add.circle(0, 0, 14, 0xf1c40f);
    const bolt1 = gameScene.add.polygon(0, 0, [
      -3, -10, 0, -5, -2, 0, 3, 0, 0, 5, 2, 0
    ], 0xffffff);
    const bolt2 = gameScene.add.polygon(0, 0, [
      0, -8, 3, -3, 1, 2, 5, 2, 2, 7, 0, 2
    ], 0xe67e22);
    const spark1 = gameScene.add.circle(-9, -6, 2, 0xffffff);
    const spark2 = gameScene.add.circle(9, -6, 2, 0xffffff);
    const spark3 = gameScene.add.circle(-7, 7, 2, 0xffffff);
    const spark4 = gameScene.add.circle(7, 7, 2, 0xffffff);
    monsterGraphics = [body, spark1, spark2, spark3, spark4, bolt1, bolt2];
  } else if (monsterData.id === 'invisible') {
    // Monstre invisible - forme fantomatique semi-transparente
    const body = gameScene.add.circle(0, 0, 13, 0x9b59b6, 0.3);
    const eye1 = gameScene.add.circle(-5, -3, 3, 0xffffff, 0.5);
    const eye2 = gameScene.add.circle(5, -3, 3, 0xffffff, 0.5);
    const pupil1 = gameScene.add.circle(-5, -3, 1.5, 0xff0000, 0.7);
    const pupil2 = gameScene.add.circle(5, -3, 1.5, 0xff0000, 0.7);
    const aura1 = gameScene.add.circle(0, 0, 18, 0x8e44ad, 0.1);
    const aura2 = gameScene.add.circle(0, 0, 23, 0x9b59b6, 0.05);
    monsterGraphics = [aura2, aura1, body, eye1, eye2, pupil1, pupil2];
    
    // Animation de clignotement pour l'effet fantôme
    gameScene.tweens.add({
      targets: [body, eye1, eye2],
      alpha: 0.1,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  monsterGraphics.forEach(g => container.add(g));

  const healthBarBg = gameScene.add.rectangle(0, -25, 30, 5, 0x000000);
  const healthBar = gameScene.add.rectangle(0, -25, 30, 5, 0x27ae60);
  healthBar.setOrigin(0.5);
  container.add(healthBarBg);
  container.add(healthBar);

  const hpText = gameScene.add.text(0, -32, `${monsterData.health}`, {
    fontSize: '10px', fill: '#fff', fontStyle: 'bold',
    stroke: '#000', strokeThickness: 2
  });
  hpText.setOrigin(0.5);
  container.add(hpText);

  if (monsterData.level && monsterData.level > 1) {
    const levelBadge = gameScene.add.text(0, 22, `★${monsterData.level}`, {
      fontSize: '10px', fill: '#ffd700', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2
    });
    levelBadge.setOrigin(0.5);
    container.add(levelBadge);
  }

  const monster = {
    ...monsterData,
    sprite: container,
    healthBar: healthBar,
    hpText: hpText,
    pathIndex: monsterData.pathIndex || 0,
    currentHealth: monsterData.currentHealth || monsterData.health,
    maxHealth: monsterData.maxHealth || monsterData.health,
    baseHealth: monsterData.baseHealth || monsterData.health,  // Santé de base sans buff
    baseSpeed: monsterData.baseSpeed || monsterData.speed,    // Vitesse de base sans ralentissement
    progress: monsterData.progress || 0,
    isBuffed: false,  // Indique si le monstre est actuellement bufé
    buffCircle: null,  // Circle visuel pour le buffer
    stunCount: 0,      // Nombre de tours stunnées (pour le stunner)
    effects: {         // Effets actifs sur le monstre
      fire: null,
      freeze: null,
      poison: null
    }
  };

  // Si c'est un buffer, créer le cercle de buff
  if (monsterData.id === 'buffer') {
    const buffCircle = gameScene.add.circle(0, 0, CONSTANTS.MONSTER_TYPES.BUFFER.buffRadius, 0x2ecc71, 0.15);
    buffCircle.setStrokeStyle(2, 0x27ae60, 0.5);
    container.add(buffCircle);
    monster.buffCircle = buffCircle;
  }

  monsters.push(monster);
}

// Fonction spéciale pour spawn les monstres divisés à une position précise
function spawnSplitMonster(monsterData) {
  if (!gameScene) return;
  
  // Utiliser la position personnalisée si fournie
  const startX = monsterData.startX || path[0].x;
  const startY = monsterData.startY || path[0].y;
  
  const container = gameScene.add.container(startX, startY);
  
  // Le monstre divisé utilise toujours le visuel du splitter mais plus petit
  const body = gameScene.add.circle(0, 0, 10, 0x16a085);  // Plus petit
  const blob1 = gameScene.add.circle(-4, -3, 4, 0x1abc9c);
  const blob2 = gameScene.add.circle(4, -3, 4, 0x1abc9c);
  const eye1 = gameScene.add.circle(-3, -1, 2, 0xffffff);
  const eye2 = gameScene.add.circle(3, -1, 2, 0xffffff);
  const pupil1 = gameScene.add.circle(-3, -1, 1, 0x000000);
  const pupil2 = gameScene.add.circle(3, -1, 1, 0x000000);
  
  [body, blob1, blob2, eye1, eye2, pupil1, pupil2].forEach(g => container.add(g));

  const healthBarBg = gameScene.add.rectangle(0, -20, 24, 4, 0x000000);
  const healthBar = gameScene.add.rectangle(0, -20, 24, 4, 0x27ae60);
  healthBar.setOrigin(0.5);
  container.add(healthBarBg);
  container.add(healthBar);

  const hpText = gameScene.add.text(0, -27, `${monsterData.health}`, {
    fontSize: '9px', fill: '#fff', fontStyle: 'bold',
    stroke: '#000', strokeThickness: 2
  });
  hpText.setOrigin(0.5);
  container.add(hpText);

  const monster = {
    ...monsterData,
    sprite: container,
    healthBar: healthBar,
    hpText: hpText,
    isBuffed: false,
    buffCircle: null,
    stunCount: 0,
    effects: {
      fire: null,
      freeze: null,
      poison: null
    }
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
  // Vérifier si la tour a la compétence true_sight
  const hasTrueSight = tower.abilities && tower.abilities.includes('true_sight');
  const targetMode = tower.targetMode || 'closest';

  // Filtrer les monstres à portée
  const monstersInRange = monsters.filter(monster => {
    if (!monster.sprite || !monster.sprite.active) return false;
    
    // Si le monstre est invisible et que la tour n'a pas true_sight, l'ignorer
    if (monster.isInvisible && !hasTrueSight) return false;
    
    const dx = monster.sprite.x - tower.x;
    const dy = monster.sprite.y - tower.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    return dist <= tower.range;
  });

  if (monstersInRange.length === 0) return null;

  // Sélectionner le monstre selon le mode de ciblage
  let target = null;

  switch (targetMode) {
    case 'closest': // Plus proche de la tour
      let minDist = Infinity;
      monstersInRange.forEach(monster => {
        const dx = monster.sprite.x - tower.x;
        const dy = monster.sprite.y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          target = monster;
        }
      });
      break;

    case 'weakest': // Plus faible en HP
      let minHp = Infinity;
      monstersInRange.forEach(monster => {
        if (monster.currentHealth < minHp) {
          minHp = monster.currentHealth;
          target = monster;
        }
      });
      break;

    case 'fastest': // Plus rapide
      let maxSpeed = -1;
      monstersInRange.forEach(monster => {
        const effectiveSpeed = monster.speed * (monster.isFrozen ? 0.5 : 1);
        if (effectiveSpeed > maxSpeed) {
          maxSpeed = effectiveSpeed;
          target = monster;
        }
      });
      break;

    case 'nearest_end': // Plus proche de la fin du chemin
      let maxProgress = -1;
      monstersInRange.forEach(monster => {
        const totalProgress = monster.pathIndex + monster.progress;
        if (totalProgress > maxProgress) {
          maxProgress = totalProgress;
          target = monster;
        }
      });
      break;

    default:
      target = monstersInRange[0];
  }

  return target;
}

function shootAtMonster(tower, monster) {
  // Vérifier si la tour est stunnée
  if (tower.isStunned) {
    return; // Ne pas tirer si stunnée
  }
  
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
  
  // Stocker la référence du monstre cible
  projectile.targetMonster = monster;
  
  // Fallback: détruire le projectile après 500ms même si le tween échoue
  gameScene.time.delayedCall(500, () => {
    if (projectile && projectile.active) {
      projectile.destroy();
    }
  });
  
  // Si c'est un stunner et qu'il n'a pas encore stun 2 tours
  if (monster.id === 'stunner' && monster.stunCount < CONSTANTS.MONSTER_TYPES.STUNNER.maxStuns) {
    stunTower(tower, CONSTANTS.MONSTER_TYPES.STUNNER.stunDuration);
    monster.stunCount++;
  }

  const tween = gameScene.tweens.add({
    targets: projectile,
    x: monster.sprite.x,
    y: monster.sprite.y,
    duration: 100,
    ease: 'Linear',
    onUpdate: () => {
      // Vérifier si le monstre cible est toujours vivant
      if (!projectile.targetMonster || !projectile.targetMonster.sprite || !projectile.targetMonster.sprite.active) {
        // Monstre mort pendant le trajet, arrêter le tween et détruire le projectile
        if (tween && tween.isPlaying()) {
          tween.stop();
        }
        if (projectile && projectile.active) {
          projectile.destroy();
        }
      }
    },
    onComplete: () => {
      // Détruire le projectile immédiatement
      if (projectile && projectile.active) {
        projectile.destroy();
      }

      // Vérifier que le monstre existe toujours
      if (!monster || !monster.sprite || !monster.sprite.active) return;

      monster.currentHealth -= tower.damage;
      
      // Appliquer les effets de compétences
      if (tower.abilities && tower.abilities.length > 0) {
        applyTowerAbilities(tower, monster);
      }

      // Si le monstre meurt, le détruire immédiatement
      if (monster.currentHealth <= 0) {
        // Si c'est une tour de recherche, le kill compte uniquement pour la recherche
        const isResearchTower = tower.id === 'research';
        killMonster(monster, isResearchTower, tower);
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

// Appliquer les effets des compétences de tour
function applyTowerAbilities(tower, monster) {
  if (!tower.abilities || !monster) return;
  
  tower.abilities.forEach(abilityId => {
    if (abilityId === 'fire') {
      applyFireEffect(monster);
    } else if (abilityId === 'freeze') {
      applyFreezeEffect(monster);
    } else if (abilityId === 'poison') {
      applyPoisonEffect(monster);
    }
  });
}

// Effet de feu : 2% HP max par seconde pendant 3s
function applyFireEffect(monster) {
  if (monster.effects.fire) {
    clearInterval(monster.effects.fire.interval);
    clearTimeout(monster.effects.fire.timeout);
  }
  
  const ability = CONSTANTS.TOWER_ABILITIES.FIRE;
  const damagePerTick = monster.maxHealth * ability.damagePercent;
  const tickRate = 1000; // 1 tick par seconde
  
  // Effet visuel
  if (!monster.fireEffect && gameScene) {
    const fire = gameScene.add.circle(0, 0, 8, 0xff6600, 0.6);
    monster.sprite.add(fire);
    monster.fireEffect = fire;
    
    gameScene.tweens.add({
      targets: fire,
      alpha: 0.3,
      scale: 1.3,
      duration: 300,
      yoyo: true,
      repeat: (ability.duration / 600) - 1
    });
  }
  
  const interval = setInterval(() => {
    if (!monster.sprite || !monster.sprite.active) {
      clearInterval(interval);
      return;
    }
    
    monster.currentHealth -= damagePerTick;
    
    if (monster.currentHealth <= 0) {
      clearInterval(interval);
      killMonster(monster);
    } else {
      updateMonsterHealthDisplay(monster);
    }
  }, tickRate);
  
  const timeout = setTimeout(() => {
    clearInterval(interval);
    if (monster.fireEffect) {
      monster.fireEffect.destroy();
      monster.fireEffect = null;
    }
    monster.effects.fire = null;
  }, ability.duration);
  
  monster.effects.fire = { interval, timeout };
}

// Effet de gel : ralentissement de 50% pendant 2s
function applyFreezeEffect(monster) {
  if (monster.effects.freeze) {
    clearTimeout(monster.effects.freeze.timeout);
  }
  
  const ability = CONSTANTS.TOWER_ABILITIES.FREEZE;
  
  // Appliquer le ralentissement
  if (!monster.baseSpeed) {
    monster.baseSpeed = monster.speed;
  }
  monster.speed = monster.baseSpeed * (1 - ability.slowPercent);
  
  // Effet visuel
  if (!monster.freezeEffect && gameScene) {
    const freeze = gameScene.add.circle(0, 0, 10, 0x00ffff, 0.4);
    monster.sprite.add(freeze);
    monster.freezeEffect = freeze;
    
    gameScene.tweens.add({
      targets: freeze,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: (ability.duration / 1000) - 1
    });
  }
  
  const timeout = setTimeout(() => {
    monster.speed = monster.baseSpeed;
    if (monster.freezeEffect) {
      monster.freezeEffect.destroy();
      monster.freezeEffect = null;
    }
    monster.effects.freeze = null;
  }, ability.duration);
  
  monster.effects.freeze = { timeout };
}

// Effet de poison : 2% HP max par seconde pendant 4s
function applyPoisonEffect(monster) {
  if (monster.effects.poison) {
    clearInterval(monster.effects.poison.interval);
    clearTimeout(monster.effects.poison.timeout);
  }
  
  const ability = CONSTANTS.TOWER_ABILITIES.POISON;
  const damagePerTick = monster.maxHealth * ability.damagePercent;
  const tickRate = 1000;
  
  // Effet visuel
  if (!monster.poisonEffect && gameScene) {
    const poison = gameScene.add.circle(0, 0, 7, 0x00ff00, 0.5);
    monster.sprite.add(poison);
    monster.poisonEffect = poison;
    
    gameScene.tweens.add({
      targets: poison,
      alpha: 0.2,
      y: -3,
      duration: 400,
      yoyo: true,
      repeat: (ability.duration / 800) - 1
    });
  }
  
  const interval = setInterval(() => {
    if (!monster.sprite || !monster.sprite.active) {
      clearInterval(interval);
      return;
    }
    
    monster.currentHealth -= damagePerTick;
    
    if (monster.currentHealth <= 0) {
      clearInterval(interval);
      killMonster(monster);
    } else {
      updateMonsterHealthDisplay(monster);
    }
  }, tickRate);
  
  const timeout = setTimeout(() => {
    clearInterval(interval);
    if (monster.poisonEffect) {
      monster.poisonEffect.destroy();
      monster.poisonEffect = null;
    }
    monster.effects.poison = null;
  }, ability.duration);
  
  monster.effects.poison = { interval, timeout };
}

// Fonction helper pour mettre à jour l'affichage de vie
function updateMonsterHealthDisplay(monster) {
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
    monster.hpText.setText(Math.round(Math.max(0, monster.currentHealth)));
  }
}

function killMonster(monster, isResearchKill = false, killerTower = null) {
  if (!monster || !monster.sprite) return;
  
  // Nettoyer les effets actifs
  if (monster.effects.fire) {
    clearInterval(monster.effects.fire.interval);
    clearTimeout(monster.effects.fire.timeout);
    if (monster.fireEffect) monster.fireEffect.destroy();
  }
  if (monster.effects.freeze) {
    clearTimeout(monster.effects.freeze.timeout);
    if (monster.freezeEffect) monster.freezeEffect.destroy();
  }
  if (monster.effects.poison) {
    clearInterval(monster.effects.poison.interval);
    clearTimeout(monster.effects.poison.timeout);
    if (monster.poisonEffect) monster.poisonEffect.destroy();
  }
  
  // Vérifier si le monstre peut se diviser
  const shouldSplit = monster.canSplit && monster.currentHealth <= 0 && !monster.isSplit;
  
  // Si le monstre peut se diviser, créer deux nouveaux monstres
  if (shouldSplit && gameScene) {
    const currentPosX = monster.sprite.x;
    const currentPosY = monster.sprite.y;
    const currentPathIndex = monster.pathIndex;
    const currentProgress = monster.progress;
    
    // Créer deux monstres plus petits
    for (let i = 0; i < 2; i++) {
      // Décaler légèrement les deux monstres
      const offset = i === 0 ? -15 : 15;
      
      const splitMonster = {
        id: monster.id,
        name: monster.name,
        health: Math.floor(monster.maxHealth / 2),
        currentHealth: Math.floor(monster.maxHealth / 2),
        maxHealth: Math.floor(monster.maxHealth / 2),
        baseHealth: Math.floor(monster.maxHealth / 2),
        speed: Math.floor(monster.speed * 1.25), // +25% de vitesse
        baseSpeed: Math.floor(monster.baseSpeed * 1.25),
        reward: Math.floor(monster.reward / 2),
        canSplit: false, // Ne peut plus se diviser
        isSplit: true, // Marquer comme divisé
        pathIndex: currentPathIndex,
        progress: currentProgress,
        // Position ajustée
        startX: currentPosX + offset,
        startY: currentPosY
      };
      
      // Spawn le monstre divisé avec position personnalisée
      spawnSplitMonster(splitMonster);
    }
    
    showToast('🔀 Monstre divisé !', 'warning');
  }
  
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

  // Calculer la récompense avec les tours dorées
  let finalReward = monster.reward;
  
  // Vérifier si le monstre est dans une aura dorée
  for (const tower of towers) {
    if (tower.id === 'gold' && tower.goldAura) {
      const dist = Phaser.Math.Distance.Between(
        monster.sprite.x, 
        monster.sprite.y,
        tower.x,
        tower.y
      );
      
      const goldRadius = CONSTANTS.TOWER_TYPES.GOLD.goldRadius || 150;
      if (dist <= goldRadius) {
        // Bonus d'or de base (100%) + 20% tous les 5 niveaux
        const towerLevel = tower.level || 1;
        const bonusLevels = Math.floor(towerLevel / 5);
        const goldMultiplier = (CONSTANTS.TOWER_TYPES.GOLD.goldMultiplier || 2) + (bonusLevels * 0.2);
        finalReward = Math.floor(finalReward * goldMultiplier);
        break; // Un seul bonus même si plusieurs tours dorées
      }
    }
  }

  // Si c'est un kill de recherche, ne pas l'envoyer au serveur (pas de score)
  if (!isResearchKill) {
    socket.emit(CONSTANTS.SOCKET_EVENTS.MONSTER_KILLED, {
      monsterId: monster.id,
      reward: finalReward
    });
    playerMoney += finalReward;
  }
  // Ne pas incrémenter playerKills ici - le serveur est la source de vérité
  // et enverra les stats via PLAYERS_STATS_UPDATE
  
  // Progression de la recherche en cours (tous les kills donnent +1)
  // Si le monstre était dans l'aura d'un laboratoire, bonus supplémentaire basé sur le niveau
  let researchBonus = 0;
  if (monster.researchAssistTower) {
    const labLevel = monster.researchAssistTower.level || 1;
    // +1 bonus de base, puis +1 supplémentaire tous les 5 niveaux
    researchBonus = 1 + Math.floor(labLevel / 5);
  }
  const researchTowerForAnimation = monster.researchAssistTower || null;
  addResearchKill(researchBonus, researchTowerForAnimation);
  
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

  if (playerHealth >= gameSettings.maxHealth) {
    showToast('💀 Vous avez été éliminé !', 'error');
  }
}

// Système de buff des monstres
function updateMonsterBuffs() {
  // Trouver tous les buffers actifs
  const buffers = monsters.filter(m => m.id === 'buffer' && m.sprite && m.sprite.active);
  
  // Pour chaque monstre, vérifier s'il est dans le rayon d'un buffer
  monsters.forEach(monster => {
    if (!monster.sprite || !monster.sprite.active || monster.id === 'buffer') return;
    
    let isInBuffRange = false;
    
    // Vérifier si le monstre est dans le rayon d'un buffer
    for (const buffer of buffers) {
      const dx = monster.sprite.x - buffer.sprite.x;
      const dy = monster.sprite.y - buffer.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= CONSTANTS.MONSTER_TYPES.BUFFER.buffRadius) {
        isInBuffRange = true;
        break;
      }
    }
    
    // Appliquer ou retirer le buff
    if (isInBuffRange && !monster.isBuffed) {
      // Appliquer le buff
      const healthBefore = monster.currentHealth;
      const maxHealthBefore = monster.maxHealth;
      
      monster.maxHealth = Math.round(monster.baseHealth * CONSTANTS.MONSTER_TYPES.BUFFER.healthBuff);
      monster.currentHealth = Math.round(healthBefore * (monster.maxHealth / maxHealthBefore));
      monster.isBuffed = true;
      
      // Mettre à jour l'affichage
      if (monster.healthBar && monster.healthBar.active) {
        const healthPercent = Math.max(0, monster.currentHealth / monster.maxHealth);
        monster.healthBar.width = 30 * healthPercent;
      }
      if (monster.hpText && monster.hpText.active) {
        monster.hpText.setText(Math.round(monster.currentHealth));
      }
      
    } else if (!isInBuffRange && monster.isBuffed) {
      // Retirer le buff
      const healthPercent = monster.currentHealth / monster.maxHealth;
      
      monster.maxHealth = monster.baseHealth;
      monster.currentHealth = Math.round(monster.baseHealth * healthPercent);
      monster.isBuffed = false;
      
      // Mettre à jour l'affichage
      if (monster.healthBar && monster.healthBar.active) {
        const healthPercent = Math.max(0, monster.currentHealth / monster.maxHealth);
        monster.healthBar.width = 30 * healthPercent;
      }
      if (monster.hpText && monster.hpText.active) {
        monster.hpText.setText(Math.round(monster.currentHealth));
      }
    }
  });
}

// Système d'aura de recherche - ralentit les monstres et marque l'assist
function updateResearchAura() {
  // Trouver toutes les tours de recherche actives
  const researchTowers = towers.filter(t => t.id === 'research' && t.sprite && t.sprite.active);
  
  if (researchTowers.length === 0) return;
  
  const auraRadius = CONSTANTS.TOWER_TYPES.RESEARCH.auraRadius || 150;
  const slowPercent = CONSTANTS.TOWER_TYPES.RESEARCH.slowPercent || 0.01;
  
  // Pour chaque monstre, vérifier s'il est dans le rayon d'une tour de recherche
  monsters.forEach(monster => {
    if (!monster.sprite || !monster.sprite.active) return;
    
    let isInResearchAura = false;
    let nearestResearchTower = null;
    
    // Vérifier si le monstre est dans le rayon d'une tour de recherche
    for (const tower of researchTowers) {
      const dx = monster.sprite.x - tower.x;
      const dy = monster.sprite.y - tower.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= auraRadius) {
        isInResearchAura = true;
        nearestResearchTower = tower;
        break;
      }
    }
    
    // Appliquer ou retirer le ralentissement de recherche
    if (isInResearchAura && !monster.isInResearchAura) {
      // Marquer le monstre comme étant dans l'aura de recherche
      monster.isInResearchAura = true;
      monster.researchAssistTower = nearestResearchTower;
      
      // Appliquer le ralentissement (1%)
      if (!monster.baseSpeed) {
        monster.baseSpeed = monster.speed;
      }
      monster.speed = monster.baseSpeed * (1 - slowPercent);
      
    } else if (!isInResearchAura && monster.isInResearchAura) {
      // Retirer le ralentissement
      monster.isInResearchAura = false;
      // Garder researchAssistTower pour l'assist même après être sorti
      
      // Restaurer la vitesse normale
      if (monster.baseSpeed) {
        monster.speed = monster.baseSpeed;
      }
    } else if (isInResearchAura) {
      // Mettre à jour la tour la plus proche pour l'assist
      monster.researchAssistTower = nearestResearchTower;
    }
  });
}

// Système de stun des tours
function stunTower(tower, duration) {
  if (tower.isStunned) return; // Déjà stunnée
  
  tower.isStunned = true;
  tower.stunEndTime = Date.now() + duration;
  
  // Créer l'effet visuel de stun
  if (!tower.stunEffect && tower.sprite && gameScene) {
    // Cercle rouge semi-transparent autour de la tour
    const stunCircle = gameScene.add.circle(tower.x, tower.y, tower.range * 0.3, 0xff0000, 0.3);
    stunCircle.setStrokeStyle(3, 0xff0000, 0.8);
    stunCircle.setDepth(50);
    tower.stunEffect = stunCircle;
    
    // Animation de pulsation
    gameScene.tweens.add({
      targets: stunCircle,
      alpha: 0.1,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: Math.ceil(duration / 1000) * 2
    });
    
    // Icône d'éclair au-dessus de la tour
    const stunIcon = gameScene.add.text(tower.x, tower.y - 35, '⚡', {
      fontSize: '20px',
      fill: '#ffff00',
      stroke: '#ff0000',
      strokeThickness: 2
    });
    stunIcon.setOrigin(0.5);
    stunIcon.setDepth(51);
    tower.stunIcon = stunIcon;
    
    // Animation de l'icône
    gameScene.tweens.add({
      targets: stunIcon,
      y: tower.y - 40,
      duration: 300,
      yoyo: true,
      repeat: Math.ceil(duration / 600)
    });
  }
  
  // Timer pour retirer le stun
  setTimeout(() => {
    tower.isStunned = false;
    if (tower.stunEffect) {
      tower.stunEffect.destroy();
      tower.stunEffect = null;
    }
    if (tower.stunIcon) {
      tower.stunIcon.destroy();
      tower.stunIcon = null;
    }
  }, duration);
}
