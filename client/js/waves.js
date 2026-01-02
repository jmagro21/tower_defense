// Gestion des vagues - Système de spawn par unités
let gameTime = 0;
let spawnTimer = 0;
let spawnUnitCapacity = 0; // Unités disponibles pour spawn cette période
let maxSpawnUnits = 5; // Max d'unités par période de spawn
let monsterLevel = 1;
let monsterHealthMultiplier = 1;
let rewardMultiplier = 1;
let comboActive = false; // Combo de spawn en cours
let comboCount = 0; // Nombre de monstres restants dans le combo
let comboType = 'basic'; // Type de monstre du combo
let spawnInterval = 5; // Intervalle en secondes pour ajouter des unités

function updateGameTime() {
  gameTime++;
  
  if (gameTime === 10) {
    showNotification('🎮 Les monstres arrivent !');
  }
  
  // Appliquer les multiplicateurs selon les paramètres
  if (gameSettings.spawnSpeed === 'slow') {
    spawnInterval = 8;
    maxSpawnUnits = Math.max(3, Math.floor(maxSpawnUnits * 0.6));
  } else if (gameSettings.spawnSpeed === 'fast') {
    spawnInterval = 3;
    maxSpawnUnits = Math.floor(maxSpawnUnits * 1.5);
  } else if (gameSettings.spawnSpeed === 'hard') {
    spawnInterval = 2; // Très rapide
    maxSpawnUnits = Math.floor(maxSpawnUnits * 3); // Triple les spawns
  }
  
  // Augmentation continue du budget de spawn
  if (gameTime % spawnInterval === 0 && gameTime <= 30) {
    spawnUnitCapacity += maxSpawnUnits;
  } else if (gameTime > 30 && gameTime % spawnInterval === 0) {
    // Après 30s, continue à ajouter des unités mais au taux du maxSpawnUnits actuel
    spawnUnitCapacity += maxSpawnUnits;
  }
  
  if (gameTime === 30) {
    maxSpawnUnits = 10; // Augmente après 30s
    monsterHealthMultiplier = 1.2 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier = 1.2 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel = 2;
    updateMonsterHPDisplay();
    showNotification('⚠️ Vague 2 ! Les Tanks arrivent !');
  }
  
  if (gameTime === 60) {
    maxSpawnUnits = 15; // Augmente après 60s
    monsterHealthMultiplier = 1.4 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier = 1.4 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel = 3;
    updateMonsterHPDisplay();
    showNotification('🔥 Vague 3 ! Les Rapides et Diviseurs arrivent !');
  }

  if (gameTime === 90) {
    maxSpawnUnits = 20; // Augmente après 90s
    monsterHealthMultiplier = 1.6 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier = 1.6 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel = 4;
    updateMonsterHPDisplay();
    showNotification('⚠️ Vague 4 ! Préparez-vous !');
  }
  
  if (gameTime === 300) {
    maxSpawnUnits += 5;
    monsterHealthMultiplier += 0.2 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier += 0.2 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel = 10;
    updateMonsterHPDisplay();
    showNotification('💀 Manche 10 ! Les BOSS arrivent enfin !');
  }

  if (gameTime > 90 && gameTime < 300 && gameTime % 30 === 0) {
    maxSpawnUnits += 2; // Augmentation plus faible avant les boss
    monsterHealthMultiplier += 0.1 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier += 0.1 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel++;
    updateMonsterHPDisplay();
    showNotification(`🌟 Vague ${monsterLevel} !`);
  }

  if (gameTime > 300 && gameTime % 30 === 0) {
    maxSpawnUnits += 5; // Augmente plus rapidement après les boss
    monsterHealthMultiplier += 0.2 * (gameSettings.monsterIntensity || 1.0);
    rewardMultiplier += 0.2 * (gameSettings.rewardMultiplier || 1.0);
    monsterLevel++;
    updateMonsterHPDisplay();
    showNotification(`🌟 Vague ${monsterLevel} !`);
  }
}

function getAvailableMonsterTypes() {
  if (gameTime < 30) {
    // 0-30s: Seulement BASIC
    return ['basic'];
  } else if (gameTime < 60) {
    // 30-60s: BASIC + TANK
    return ['basic', 'basic', 'tank'];
  } else if (gameTime < 90) {
    // 60-90s: BASIC + TANK + FAST + SPLITTER
    return ['basic', 'basic', 'tank', 'fast', 'splitter'];
  } else if (gameTime < 120) {
    // 90-120s: BASIC + TANK + FAST + SPLITTER + BUFFER
    return ['basic', 'basic', 'tank', 'fast', 'splitter', 'buffer'];
  } else if (gameTime < 180) {
    // 120-180s: Tous sauf BOSS
    return ['basic', 'basic', 'tank', 'fast', 'splitter', 'buffer', 'stunner'];
  } else if (gameTime < 240) {
    // 180-240s: Ajout de INVISIBLE
    return ['basic', 'tank', 'fast', 'splitter', 'buffer', 'stunner', 'invisible'];
  } else if (gameTime < 300) {
    // 240-300s: Tous sauf BOSS
    return ['basic', 'tank', 'fast', 'splitter', 'buffer', 'stunner', 'invisible'];
  } else {
    // 300s+ (manche 10+): Tous les types
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

function autoSpawnMonster() {
  if (spawnUnitCapacity <= 0) return;
  
  // Vérifier s'il faut initier un combo (30% de chance toutes les 8-10 secondes après 30s)
  if (!comboActive && gameTime > 30 && gameTime % (8 + Math.floor(Math.random() * 3)) === 0) {
    if (Math.random() < 0.3) {
      initializeCombo();
    }
  }
  
  let monsterType;
  
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
  
  let spawned = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  // Essayer de spawn un monstre qui entre dans le budget
  while (attempts < maxAttempts && spawnUnitCapacity > 0) {
    const monsterData = { ...CONSTANTS.MONSTER_TYPES[monsterType.toUpperCase()] };
    const cost = monsterData.spawnCost;
    
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
      spawned = true;
      break;
    }
    
    attempts++;
  }
}

