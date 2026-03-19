// Gestion des vagues - Système de spawn par unités
let gameTime = 0;
let spawnTimer = 0;
let spawnUnitCapacity = 0; // Unités disponibles pour spawn cette période
let maxSpawnUnits = 5; // Max d'unités par période de spawn (valeur de BASE avant multiplicateur)
let monsterLevel = 1;
let monsterHealthMultiplier = 1;
let rewardMultiplier = 1;
let comboActive = false; // Combo de spawn en cours
let comboCount = 0; // Nombre de monstres restants dans le combo
let comboType = 'basic'; // Type de monstre du combo
let spawnInterval = 5; // Intervalle en secondes pour ajouter des unités
let currentSpawnDelay = 5000; // Délai de spawn en ms (modifié selon les vagues)
let titanSpawnedWave20 = false; // Flag pour spawn le titan une seule fois à la vague 20
let spawnSpeedApplied = false; // Flag pour savoir si le spawnSpeed a été appliqué
let suddenDeathActive = false; // Flag pour la mort subite

// Obtenir le multiplicateur de spawn selon les paramètres (appliqué UNE SEULE FOIS aux transitions de vague)
function getSpawnSpeedMultiplier() {
  if (gameSettings.spawnSpeed === 'slow') return 0.6;
  if (gameSettings.spawnSpeed === 'fast') return 1.5;
  if (gameSettings.spawnSpeed === 'hard') return 2.5;
  return 1.0; // normal
}

function getSpawnInterval() {
  if (gameSettings.spawnSpeed === 'slow') return 8;
  if (gameSettings.spawnSpeed === 'fast') return 3;
  if (gameSettings.spawnSpeed === 'hard') return 2;
  return 5; // normal
}

function updateGameTime() {
  gameTime++;
  
  if (gameTime === 15) {
    showNotification('🎮 Les monstres arrivent !');
  }
  
  // Appliquer le spawnInterval UNE SEULE FOIS au début
  if (!spawnSpeedApplied) {
    spawnInterval = getSpawnInterval();
    spawnSpeedApplied = true;
  }
  
  // Augmentation continue du budget de spawn (commence après 15s pour laisser le temps de choisir la classe)
  if (gameTime >= 15 && gameTime % spawnInterval === 0) {
    spawnUnitCapacity += maxSpawnUnits;
  }
  
  // === TRANSITIONS DE VAGUE ===
  // Les multiplicateurs de spawn sont appliqués UNE FOIS à chaque transition
  
  if (gameTime === 45) {
    const mult = getSpawnSpeedMultiplier();
    maxSpawnUnits = Math.max(3, Math.floor(10 * mult)); // Base 10, multiplié par le speed
    monsterHealthMultiplier = 1.2 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier = 1.2 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel = 2;
    updateMonsterHPDisplay();
    showNotification('⚠️ Vague 2 ! Les Tanks arrivent !');
  }
  
  if (gameTime === 75) {
    const mult = getSpawnSpeedMultiplier();
    maxSpawnUnits = Math.max(3, Math.floor(15 * mult));
    monsterHealthMultiplier = 1.4 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier = 1.4 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel = 3;
    updateMonsterHPDisplay();
    showNotification('🔥 Vague 3 ! Les Rapides et Diviseurs arrivent !');
  }

  if (gameTime === 105) {
    const mult = getSpawnSpeedMultiplier();
    maxSpawnUnits = Math.max(3, Math.floor(20 * mult));
    monsterHealthMultiplier = 1.6 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier = 1.6 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel = 4;
    updateMonsterHPDisplay();
    showNotification('⚠️ Vague 4 ! Préparez-vous !');
  }
  
  if (gameTime === 315) {
    const mult = getSpawnSpeedMultiplier();
    maxSpawnUnits = Math.max(3, Math.floor((maxSpawnUnits + 5) * 1.0)); // Pas de re-multiplication
    monsterHealthMultiplier += 0.2 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier += 0.2 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel = 10;
    updateMonsterHPDisplay();
    showNotification('💀 Manche 10 ! Les BOSS arrivent enfin !');
  }

  if (gameTime > 105 && gameTime < 315 && gameTime % 30 === 0) {
    maxSpawnUnits += Math.max(1, Math.floor(2 * getSpawnSpeedMultiplier())); // Augmentation linéaire
    monsterHealthMultiplier += 0.1 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier += 0.1 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel++;
    updateMonsterHPDisplay();
    showNotification(`🌟 Vague ${monsterLevel} !`);
  }

  if (gameTime > 315 && gameTime % 30 === 0) {
    // Augmentation linéaire (pas exponentielle !)
    const baseIncrease = monsterLevel >= 20 ? 8 : 5;
    maxSpawnUnits += Math.max(1, Math.floor(baseIncrease * getSpawnSpeedMultiplier()));
    monsterHealthMultiplier += 0.2 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier += 0.2 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel++;
    updateMonsterHPDisplay();
    
    // MORT SUBITE après vague 60
    if (monsterLevel > 60) {
      if (!suddenDeathActive) {
        suddenDeathActive = true;
        showNotification(`💀⚠️ MORT SUBITE - SEULS LES TITANS SPAWNERONT ! AMÉLIORATIONS INTERDITES !`);
        disableTowerUpgrades();
      } else {
        showNotification(`💀 MORT SUBITE - VAGUE ${monsterLevel} !`);
      }
      // Boost massif du spawn pour la mort subite
      maxSpawnUnits = Math.max(maxSpawnUnits, 200);
    } else if (monsterLevel >= 20) {
      showNotification(`⚠️ VAGUE ${monsterLevel} - INVASION MASSIVE !`);
    } else {
      showNotification(`🌟 Vague ${monsterLevel} !`);
    }
  }
  
  // Vague 10: Spawn accéléré à 2.5s
  if (monsterLevel === 10 && currentSpawnDelay !== 2500) {
    currentSpawnDelay = 2500;
    showNotification('⚡ Spawn accéléré ! (2.5s)');
  }
  
  // Vague 20: Spawn du TITAN (une seule fois)
  if (monsterLevel === 20 && !titanSpawnedWave20) {
    titanSpawnedWave20 = true;
    showNotification('💀👹 LE TITAN ARRIVE !!!');
    spawnTitan();
  }
  
  // Vague 25: Spawn rapide à 1s
  if (monsterLevel === 25 && currentSpawnDelay !== 1000) {
    currentSpawnDelay = 1000;
    showNotification('🔥 SPAWN RAPIDE ! (1s)');
  }
  
  // Vague 40: Spawn ultra rapide à 0.5s
  if (monsterLevel === 40 && currentSpawnDelay !== 500) {
    currentSpawnDelay = 500;
    showNotification('🔥🔥 SPAWN ULTRA RAPIDE ! (0.5s)');
  }
}

// Bloquer les améliorations de tours pendant la mort subite
function disableTowerUpgrades() {
  suddenDeathActive = true;
}

function getAvailableMonsterTypes() {
  if (gameTime < 45) {
    // 0-45s: Seulement BASIC
    return ['basic'];
  } else if (gameTime < 75) {
    // 45-75s: BASIC + TANK
    return ['basic', 'basic', 'tank'];
  } else if (gameTime < 105) {
    // 75-105s: BASIC + TANK + FAST + SPLITTER
    return ['basic', 'basic', 'tank', 'fast', 'splitter'];
  } else if (gameTime < 135) {
    // 105-135s: BASIC + TANK + FAST + SPLITTER + BUFFER
    return ['basic', 'basic', 'tank', 'fast', 'splitter', 'buffer'];
  } else if (gameTime < 195) {
    // 135-195s: Tous sauf BOSS
    return ['basic', 'basic', 'tank', 'fast', 'splitter', 'buffer', 'stunner'];
  } else if (gameTime < 255) {
    // 195-255s: Ajout de INVISIBLE
    return ['basic', 'tank', 'fast', 'splitter', 'buffer', 'stunner', 'invisible'];
  } else if (gameTime < 315) {
    // 255-315s: Tous sauf BOSS
    return ['basic', 'tank', 'fast', 'splitter', 'buffer', 'stunner', 'invisible'];
  } else {
    // 315s+ (manche 10+): Tous les types
    return ['basic', 'tank', 'fast', 'splitter', 'buffer', 'stunner', 'invisible', 'boss'];
  }
}

function initializeCombo() {
  // Initier un combo avec 3-5 monstres du même type
  const comboTypes = ['basic', 'fast', 'tank'];
  comboType = comboTypes[Math.floor(Math.random() * comboTypes.length)];
  comboCount = 3 + Math.floor(Math.random() * 3); // 3-5 monstres
  comboActive = true;
}

function spawnTitan() {
  const titanData = { ...CONSTANTS.MONSTER_TYPES.BIGBOSS };
  const attackBonuses = getAttackBonuses();
  
  // Appliquer les multiplicateurs pour le titan
  titanData.health = Math.floor(titanData.health * monsterHealthMultiplier * 2 * (1 + attackBonuses.healthBonus / 100));
  titanData.speed = Math.floor(titanData.speed * (1 + attackBonuses.speedBonus / 100));
  titanData.reward = Math.floor(titanData.reward * rewardMultiplier * 3);
  titanData.level = monsterLevel;
  
  spawnMonster(titanData);
}

function autoSpawnMonster() {
  if (spawnUnitCapacity <= 0) return;
  
  // À partir de la vague 25, ne pas spawn s'il y a déjà 250 mobs sur le terrain
  if (monsterLevel >= 25 && monsters.length >= 250) {
    return;
  }
  
  let monsterType;
  
  // MORT SUBITE : Après la vague 60, spawn uniquement des Titans
  if (suddenDeathActive || monsterLevel > 60) {
    monsterType = 'bigboss';
    
    // Forcer le spawn même si la capacité est faible (mort subite = pas de limite de cost)
    const monsterData = { ...CONSTANTS.MONSTER_TYPES.BIGBOSS };
    const attackBonuses = getAttackBonuses();
    
    monsterData.health = Math.floor(monsterData.health * monsterHealthMultiplier * 2 * (1 + attackBonuses.healthBonus / 100));
    monsterData.speed = Math.floor(monsterData.speed * (1 + attackBonuses.speedBonus / 100));
    monsterData.reward = Math.floor(monsterData.reward * rewardMultiplier * 3);
    monsterData.level = monsterLevel;
    
    spawnMonster(monsterData);
    spawnUnitCapacity = Math.max(0, spawnUnitCapacity - (monsterData.spawnCost || 50));
    return;
  }
  
  // Vérifier s'il faut initier un combo (30% de chance toutes les 8-10 secondes après 45s)
  if (!comboActive && gameTime > 45 && gameTime % (8 + Math.floor(Math.random() * 3)) === 0) {
    if (Math.random() < 0.3) {
      initializeCombo();
    }
  }

  // Si un combo est actif, spawn du monstre du combo
  if (comboActive && comboCount > 0) {
    monsterType = comboType;
    comboCount--;
    if (comboCount === 0) {
      comboActive = false;
    }
  } else {
    // Sinon, spawn aléatoire normal
    const availableTypes = getAvailableMonsterTypes();
    monsterType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }
  
  let attempts = 0;
  const maxAttempts = 10;
  
  // Essayer de spawn un monstre qui entre dans le budget
  while (attempts < maxAttempts && spawnUnitCapacity > 0) {
    const monsterData = { ...CONSTANTS.MONSTER_TYPES[monsterType.toUpperCase()] };
    const cost = monsterData.spawnCost || 1; // Fallback à 1 si pas de spawnCost
    
    if (cost <= spawnUnitCapacity) {
      // Appliquer les bonus de recherche d'attaque
      const attackBonuses = getAttackBonuses();
      
      // On peut spawn ce monstre
      monsterData.health = Math.floor(monsterData.health * monsterHealthMultiplier * (1 + attackBonuses.healthBonus / 100));
      monsterData.speed = Math.floor(monsterData.speed * (1 + attackBonuses.speedBonus / 100));
      monsterData.reward = Math.floor(monsterData.reward * rewardMultiplier);
      monsterData.level = monsterLevel;
      
      spawnMonster(monsterData);
      spawnUnitCapacity -= cost;
      break;
    }
    
    // Si ce type est trop cher, essayer un type moins cher
    const availableTypes = getAvailableMonsterTypes();
    monsterType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    attempts++;
  }
}

