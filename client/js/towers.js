// Gestion des tours
let selectedTowerType = null;
let towers = [];
let selectedTower = null;

function selectTower(towerType) {
  selectedTowerType = towerType;
  document.querySelectorAll('.tower-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.closest('.tower-btn').classList.add('selected');
}

function placeTower(x, y) {
  if (!selectedTowerType) return;

  const towerData = CONSTANTS.TOWER_TYPES[selectedTowerType.toUpperCase()];
  if (!towerData) return;

  const maxTowers = getMaxTowerSize();
  if (towers.length >= maxTowers) {
    showToast(`Limite de ${maxTowers} tours atteinte !`, 'warning');
    return;
  }

  if (playerMoney < towerData.cost) {
    showToast('Pas assez d\'argent !', 'warning');
    return;
  }

  if (isOnPath(x, y)) {
    showToast('Vous ne pouvez pas placer une tour sur le chemin !', 'error');
    return;
  }

  socket.emit(CONSTANTS.SOCKET_EVENTS.PLACE_TOWER, {
    towerType: selectedTowerType, x, y
  });

  selectedTowerType = null;
  document.querySelectorAll('.tower-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
}

function addTowerToScene(towerData) {
  // Appliquer les bonus de recherche de défense
  const defenseBonuses = getDefenseBonuses();
  
  // Créer une copie des données de la tour pour ne pas modifier l'original
  const enhancedTowerData = {
    ...towerData,
    damage: towerData.damage * (1 + defenseBonuses.damageBonus / 100),
    fireRate: towerData.fireRate / (1 + defenseBonuses.attackSpeedBonus / 100)  // fireRate en ms, donc moins = plus rapide
  };
  
  const container = gameScene.add.container(enhancedTowerData.x, enhancedTowerData.y);

  const rangeCircle = gameScene.add.circle(enhancedTowerData.x, enhancedTowerData.y, enhancedTowerData.range, 0x00ff00, 0.05);
  rangeCircle.setStrokeStyle(2, 0x00ff00, 0.2);
  rangeCircle.setVisible(false);

  let towerGraphics;

  if (enhancedTowerData.id === 'basic') {
    const base = gameScene.add.circle(0, 5, 18, 0x808080);
    const tower = gameScene.add.circle(0, 0, 15, 0x606060);
    const top = gameScene.add.circle(0, -8, 10, 0x505050);
    const cannon = gameScene.add.rectangle(0, -5, 6, 15, 0x404040);
    towerGraphics = [base, tower, cannon, top];
  } else if (enhancedTowerData.id === 'sniper') {
    const base = gameScene.add.rectangle(0, 10, 25, 8, 0x4a4a4a);
    const tower = gameScene.add.rectangle(0, 0, 18, 25, 0x2c3e50);
    const scope = gameScene.add.circle(0, -12, 8, 0x3498db);
    const barrel = gameScene.add.rectangle(0, -8, 4, 20, 0x1a252f);
    towerGraphics = [base, tower, barrel, scope];
  } else if (enhancedTowerData.id === 'rapid') {
    const base = gameScene.add.star(0, 8, 6, 15, 20, 0x95a5a6);
    const tower = gameScene.add.circle(0, 0, 16, 0xe74c3c);
    const cannon1 = gameScene.add.rectangle(-8, -5, 5, 12, 0xc0392b);
    const cannon2 = gameScene.add.rectangle(0, -8, 5, 12, 0xc0392b);
    const cannon3 = gameScene.add.rectangle(8, -5, 5, 12, 0xc0392b);
    towerGraphics = [base, tower, cannon1, cannon2, cannon3];
  } else {
    // Par défaut, créer une tour basique simple
    const base = gameScene.add.circle(0, 5, 18, 0x808080);
    const tower = gameScene.add.circle(0, 0, 15, 0x606060);
    towerGraphics = [base, tower];
  }

  towerGraphics.forEach(g => container.add(g));

  const levelText = gameScene.add.text(0, 20, `Nv.${enhancedTowerData.level || 1}`, {
    fontSize: '16px', 
    fill: '#ffff00',
    fontStyle: 'bold',
    stroke: '#000',
    strokeThickness: 3,
    backgroundColor: '#1a1a1a', 
    padding: { x: 6, y: 4 },
    align: 'center'
  });
  levelText.setOrigin(0.5);
  levelText.setDepth(10);
  container.add(levelText);

  container.setSize(40, 40);
  container.setInteractive();
  
  container.on('pointerover', () => {
    rangeCircle.setVisible(true);
    container.setScale(1.1);
  });
  
  container.on('pointerout', () => {
    rangeCircle.setVisible(false);
    container.setScale(1);
  });

  container.on('pointerdown', () => {
    openTowerMenu(enhancedTowerData, container);
  });

  towers.push({
    ...enhancedTowerData,
    sprite: container,
    rangeCircle: rangeCircle,
    levelText: levelText,
    cooldown: 0
  });
}

function openTowerMenu(towerData, container) {
  selectedTower = towers.find(t => t.sprite === container);
  if (!selectedTower) return;
  
  const towerConfig = CONSTANTS.TOWER_TYPES[selectedTower.id.toUpperCase()];
  if (!towerConfig) return;
  
  const defenseBonuses = getDefenseBonuses();
  
  // S'assurer que les propriétés existent et ont des valeurs valides
  const currentDamage = selectedTower.damage || towerConfig.damage || 1;
  const currentFireRate = selectedTower.fireRate || towerConfig.fireRate || 1000;
  const currentRange = selectedTower.range || towerConfig.range || 100;
  
  // Initialiser les stats par défaut avec des valeurs de secours
  let newDamage = currentDamage + (towerConfig.damageUpgrade || 0);
  let newFireRate = currentFireRate + (towerConfig.fireRateUpgrade || 0);
  let newRange = currentRange;
  
  // Appliquer les bonuses selon le type de tour
  if (selectedTower.id === 'basic') {
    // Basique: dégats et cadence
    newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
    newFireRate = currentFireRate + (towerConfig.fireRateUpgrade || 0) * (1 + defenseBonuses.attackSpeedBonus / 100);
  } else if (selectedTower.id === 'sniper') {
    // Sniper: niveau 1-5 = range et dégats, niveau 5+ = attaque et vitesse
    if ((selectedTower.level || 1) < 5) {
      newRange = currentRange + 50;
      newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
      newFireRate = currentFireRate;
    } else {
      newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
      newFireRate = currentFireRate + (towerConfig.fireRateUpgrade || 0) * (1 + defenseBonuses.attackSpeedBonus / 100);
    }
  } else if (selectedTower.id === 'rapid') {
    // Rapide: uniquement attaque et vitesse (vitesse augmente plus)
    newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
    newFireRate = currentFireRate + ((towerConfig.fireRateUpgrade || 0) * 1.5) * (1 + defenseBonuses.attackSpeedBonus / 100);
  }
  
  // S'assurer que les valeurs sont valides
  if (!newDamage || newDamage <= 0) {
    newDamage = currentDamage || 1;
  }
  if (!newFireRate || newFireRate <= 0) {
    newFireRate = currentFireRate || 1000;
  }
  
  const fireRateMultiplier = (1000 / currentFireRate).toFixed(2);
  const newFireRateMultiplier = (1000 / newFireRate).toFixed(2);
  
  // Coût d'amélioration réduit par la recherche
  const upgradeCost = Math.floor(towerConfig.upgradeCost * (1 - defenseBonuses.upgradeCostReduction / 100));
  
  // Mise à jour du menu
  document.getElementById('tower-menu-title').textContent = `${towerConfig.name} - Niveau ${selectedTower.level || 1}`;
  document.getElementById('tower-menu-level').textContent = selectedTower.level || 1;
  document.getElementById('tower-menu-damage-current').textContent = currentDamage.toFixed(1);
  document.getElementById('tower-menu-damage-next').textContent = newDamage.toFixed(1);
  document.getElementById('tower-menu-firerate-current').textContent = `${fireRateMultiplier}x`;
  document.getElementById('tower-menu-firerate-next').textContent = `${newFireRateMultiplier}x`;
  document.getElementById('tower-upgrade-cost').textContent = `${upgradeCost} 💰`;
  
  // Afficher la portée si c'est un sniper
  const rangeRow = document.getElementById('tower-menu-range-row');
  if (selectedTower.id === 'sniper') {
    if (selectedTower.level < 5) {
      rangeRow.style.display = 'block';
      document.getElementById('tower-menu-range-current').textContent = selectedTower.range;
      document.getElementById('tower-menu-range-next').textContent = selectedTower.range + 50;
    } else {
      rangeRow.style.display = 'none';
    }
  } else {
    rangeRow.style.display = 'none';
  }
  
  const menu = document.getElementById('tower-menu');
  menu.classList.remove('hidden');
}

function closeTowerMenu() {
  document.getElementById('tower-menu').classList.add('hidden');
  selectedTower = null;
}

function upgradeTower() {
  if (!selectedTower) return;
  
  const towerConfig = CONSTANTS.TOWER_TYPES[selectedTower.id.toUpperCase()];
  const upgradeCost = towerConfig.upgradeCost;
  
  if (playerMoney < upgradeCost) {
    showToast('Pas assez d\'argent pour améliorer !', 'warning');
    return;
  }
  
  socket.emit('UPGRADE_TOWER', {
    towerId: selectedTower.id,
    x: selectedTower.x,
    y: selectedTower.y
  });
  
  closeTowerMenu();
}

function sellTower() {
  if (!selectedTower) return;
  
  socket.emit('SELL_TOWER', {
    x: selectedTower.x,
    y: selectedTower.y
  });
  
  closeTowerMenu();
}
// Mettre à jour les dégâts affichés dans le panneau de sélection des tours
function updateTowerShopDisplay() {
  const defenseBonuses = getDefenseBonuses();
  
  // Mettre à jour Basic
  const basicDamage = Math.floor(CONSTANTS.TOWER_TYPES.BASIC.damage * (1 + defenseBonuses.damageBonus / 100));
  const basicElement = document.getElementById('tower-basic-damage');
  if (basicElement) basicElement.textContent = `${basicDamage} dégâts`;
  
  // Mettre à jour Sniper
  const sniperDamage = Math.floor(CONSTANTS.TOWER_TYPES.SNIPER.damage * (1 + defenseBonuses.damageBonus / 100));
  const sniperElement = document.getElementById('tower-sniper-damage');
  if (sniperElement) sniperElement.textContent = `${sniperDamage} dégâts`;
  
  // Mettre à jour Rapid
  const rapidDamage = Math.floor(CONSTANTS.TOWER_TYPES.RAPID.damage * (1 + defenseBonuses.damageBonus / 100));
  const rapidElement = document.getElementById('tower-rapid-damage');
  if (rapidElement) rapidElement.textContent = `${rapidDamage} dégâts`;
}