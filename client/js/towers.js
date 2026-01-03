// Gestion des tours
let selectedTowerType = null;
let towers = [];
let selectedTower = null;
let towerRangePreview = null; // Cercle de preview pour la portée
let movingTower = null; // Tour en cours de déplacement
const MOVE_TOWER_COST = 25; // Coût pour déplacer une tour
let towerClickHandled = false; // Drapeau pour éviter la fermeture immédiate du menu
let showRangeCircles = false; // Afficher les cercles de portée de toutes les tours

function selectTower(towerType, evt) {
  // Empêcher la propagation sur mobile
  if (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  
  // Si la même tour est déjà sélectionnée, la désélectionner
  if (selectedTowerType === towerType) {
    deselectTower();
    return;
  }
  
  selectedTowerType = towerType;
  document.querySelectorAll('.tower-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Trouver le bouton cliqué de manière plus fiable
  const clickedBtn = evt ? evt.currentTarget : document.querySelector(`.tower-btn[onclick*="'${towerType}'"]`);
  if (clickedBtn) {
    clickedBtn.classList.add('selected');
  }
  
  // Nettoyer l'ancien cercle de preview s'il existe
  if (towerRangePreview) {
    towerRangePreview.destroy();
    towerRangePreview = null;
  }
  
  // Créer le cercle de preview si le jeu est actif
  if (gameScene) {
    const towerData = CONSTANTS.TOWER_TYPES[towerType.toUpperCase()];
    if (towerData) {
      towerRangePreview = gameScene.add.circle(0, 0, towerData.range, 0x00ff00, 0.15);
      towerRangePreview.setStrokeStyle(2, 0x00ff00, 0.5);
      towerRangePreview.setDepth(5);
      towerRangePreview.setVisible(false);
    }
  }
}

function deselectTower() {
  selectedTowerType = null;
  
  // Retirer la classe selected de tous les boutons
  document.querySelectorAll('.tower-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Détruire le cercle de preview
  if (towerRangePreview) {
    towerRangePreview.destroy();
    towerRangePreview = null;
  }
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

  // Snap sur la grille
  const snapped = snapToGrid(x, y);
  x = snapped.x;
  y = snapped.y;

  if (isOnPath(x, y)) {
    showToast('Vous ne pouvez pas placer une tour sur le chemin !', 'error');
    return;
  }
  
  if (isCellOccupied(x, y)) {
    showToast('Une tour est déjà présente sur cette case !', 'warning');
    return;
  }

  socket.emit(CONSTANTS.SOCKET_EVENTS.PLACE_TOWER, {
    towerType: selectedTowerType, x, y
  });

  selectedTowerType = null;
  document.querySelectorAll('.tower-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Détruire le cercle de preview
  if (towerRangePreview) {
    towerRangePreview.destroy();
    towerRangePreview = null;
  }
}

function addTowerToScene(towerData) {
  // Appliquer les bonus de recherche de défense
  const defenseBonuses = getDefenseBonuses();
  
  // Créer une copie des données de la tour pour ne pas modifier l'original
  // Pour le fireRate : réduire le délai en fonction du bonus (ex: -10% de délai = tire plus vite)
  const enhancedTowerData = {
    ...towerData,
    damage: towerData.damage * (1 + defenseBonuses.damageBonus / 100),
    fireRate: towerData.fireRate * (1 - defenseBonuses.attackSpeedBonus / 100)  // Réduire le délai = augmenter la vitesse
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
  } else if (enhancedTowerData.id === 'gold') {
    const base = gameScene.add.circle(0, 5, 18, 0xf39c12);
    const tower = gameScene.add.circle(0, 0, 16, 0xffd700);
    const gem1 = gameScene.add.circle(-6, -4, 4, 0xffeb3b);
    const gem2 = gameScene.add.circle(6, -4, 4, 0xffeb3b);
    const gem3 = gameScene.add.circle(0, -10, 5, 0xffc107);
    const coin1 = gameScene.add.circle(-8, 2, 3, 0xf1c40f);
    const coin2 = gameScene.add.circle(8, 2, 3, 0xf1c40f);
    towerGraphics = [base, tower, coin1, coin2, gem1, gem2, gem3];
    
    // Animation de brillance
    gameScene.tweens.add({
      targets: [gem1, gem2, gem3],
      alpha: 0.5,
      scale: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  } else if (enhancedTowerData.id === 'research') {
    const base = gameScene.add.circle(0, 6, 18, 0x34495e);
    const tower = gameScene.add.rectangle(0, 0, 24, 28, 0x3498db);
    const window1 = gameScene.add.rectangle(-6, -6, 8, 8, 0x74b9ff);
    const window2 = gameScene.add.rectangle(6, -6, 8, 8, 0x74b9ff);
    const roof = gameScene.add.polygon(0, -14, [
      -14, 0, 0, -8, 14, 0
    ], 0x2c3e50);
    const atom1 = gameScene.add.circle(-4, 8, 3, 0x00b894);
    const atom2 = gameScene.add.circle(4, 8, 3, 0x00b894);
    const beam = gameScene.add.rectangle(0, -18, 2, 6, 0x0984e3);
    towerGraphics = [base, tower, roof, window1, window2, atom1, atom2, beam];
    
    // Animation des atomes
    gameScene.tweens.add({
      targets: [atom1, atom2, beam],
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  } else if (enhancedTowerData.id === 'electric') {
    // Tour électrique - Tesla coil style
    const base = gameScene.add.circle(0, 8, 20, 0x2c3e50);
    const coil1 = gameScene.add.rectangle(0, 0, 10, 30, 0x7f8c8d);
    const coil2 = gameScene.add.circle(0, -15, 12, 0x3498db);
    const spark1 = gameScene.add.circle(-8, -18, 3, 0x00ffff);
    const spark2 = gameScene.add.circle(8, -18, 3, 0x00ffff);
    const spark3 = gameScene.add.circle(0, -22, 4, 0xffff00);
    const ring1 = gameScene.add.circle(0, -5, 8, 0x5dade2, 0);
    ring1.setStrokeStyle(2, 0x5dade2);
    const ring2 = gameScene.add.circle(0, 5, 6, 0x5dade2, 0);
    ring2.setStrokeStyle(2, 0x5dade2);
    towerGraphics = [base, coil1, ring1, ring2, coil2, spark1, spark2, spark3];
    
    // Animation des éclairs
    gameScene.tweens.add({
      targets: [spark1, spark2, spark3],
      alpha: 0.2,
      scale: 1.5,
      duration: 200,
      yoyo: true,
      repeat: -1
    });
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

  container.on('pointerdown', (pointer) => {
    // Empêcher la propagation pour ne pas déclencher le clic sur le canvas
    pointer.event.stopPropagation();
    // Marquer que le clic sur une tour a été traité
    towerClickHandled = true;
    openTowerMenu(towerData, container);
    // Réinitialiser le drapeau après un court délai
    setTimeout(() => { towerClickHandled = false; }, 50);
  });

  // Ajouter l'aura dorée pour les tours GOLD
  let goldAura = null;
  if (enhancedTowerData.id === 'gold') {
    const goldRadius = CONSTANTS.TOWER_TYPES.GOLD.goldRadius || 150;
    goldAura = gameScene.add.circle(enhancedTowerData.x, enhancedTowerData.y, goldRadius, 0xffd700, 0.1);
    goldAura.setStrokeStyle(3, 0xffaa00, 0.5);
    goldAura.setDepth(0); // En arrière-plan
    
    // Animation de pulsation
    gameScene.tweens.add({
      targets: goldAura,
      alpha: 0.2,
      scale: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }

  // Ajouter l'aura de recherche pour les tours RESEARCH
  let researchAura = null;
  if (enhancedTowerData.id === 'research') {
    const researchRadius = CONSTANTS.TOWER_TYPES.RESEARCH.auraRadius || 150;
    researchAura = gameScene.add.circle(enhancedTowerData.x, enhancedTowerData.y, researchRadius, 0x00ff88, 0.08);
    researchAura.setStrokeStyle(2, 0x00cc66, 0.4);
    researchAura.setDepth(0); // En arrière-plan
    
    // Animation de pulsation subtile
    gameScene.tweens.add({
      targets: researchAura,
      alpha: 0.15,
      scale: 1.03,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
  }

  const newTower = {
    ...enhancedTowerData,
    level: enhancedTowerData.level || 1, // S'assurer que le niveau est défini
    sprite: container,
    rangeCircle: rangeCircle,
    goldAura: goldAura,
    researchAura: researchAura,
    targetMode: 'nearest_end', // Mode de ciblage par défaut: plus proche de la fin
    levelText: levelText,
    cooldown: 0,
    isStunned: false,
    stunEffect: null,
    stunIcon: null,
    stunEndTime: 0,
    abilities: []  // Liste des compétences achetées
  };
  
  towers.push(newTower);
  
  // Synchroniser avec window.towers pour les autres scripts
  window.towers = towers;
  console.log('[TOWERS] Tour ajoutée, total:', towers.length, towers);
}

function openTowerMenu(towerData, container) {
  selectedTower = towers.find(t => t.sprite === container);
  
  // Si on ne trouve pas par sprite, utiliser les données passées
  if (!selectedTower) {
    selectedTower = {
      ...towerData,
      sprite: container
    };
  }
  
  if (!selectedTower || !selectedTower.id) return;
  
  const towerConfig = CONSTANTS.TOWER_TYPES[selectedTower.id.toUpperCase()];
  if (!towerConfig) return;
  
  const defenseBonuses = getDefenseBonuses();
  
  // S'assurer que les propriétés existent et ont des valeurs valides
  const currentDamage = selectedTower.damage || towerConfig.damage || 1;
  const currentFireRate = selectedTower.fireRate || towerConfig.fireRate || 1000;
  const currentRange = selectedTower.range || towerConfig.range || 100;
  
  // Calculer le multiplicateur actuel de cadence
  const currentMultiplier = 1000 / currentFireRate;
  
  // Initialiser les stats par défaut
  let newDamage = currentDamage;
  let newFireRate = currentFireRate;
  let newRange = currentRange;
  
  // Appliquer les améliorations selon le type de tour
  // Bonus de cadence en flat: Rapide +0.20x, Basique +0.10x, Sniper +0.10x, Gold/Research: aucun
  if (selectedTower.id === 'basic') {
    // Basique: dégats et +0.10x de cadence
    newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
    const newMultiplier = currentMultiplier + 0.10 * (1 + defenseBonuses.attackSpeedBonus / 100);
    newFireRate = Math.max(200, Math.floor(1000 / newMultiplier));
  } else if (selectedTower.id === 'sniper') {
    // Sniper: niveau 1-5 = range et dégats, niveau 5+ = dégats et +0.10x cadence
    if ((selectedTower.level || 1) < 5) {
      newRange = currentRange + 50;
      newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
      newFireRate = currentFireRate;
    } else {
      newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
      const newMultiplier = currentMultiplier + 0.10 * (1 + defenseBonuses.attackSpeedBonus / 100);
      newFireRate = Math.max(500, Math.floor(1000 / newMultiplier));
    }
  } else if (selectedTower.id === 'rapid') {
    // Rapide: dégats et +0.20x de cadence
    newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
    const newMultiplier = currentMultiplier + 0.20 * (1 + defenseBonuses.attackSpeedBonus / 100);
    newFireRate = Math.max(100, Math.floor(1000 / newMultiplier));
  } else if (selectedTower.id === 'gold' || selectedTower.id === 'research') {
    // Gold et Research: seulement les dégats, pas de bonus de cadence
    newDamage = currentDamage + (towerConfig.damageUpgrade || 0) * (1 + defenseBonuses.damageBonus / 100);
    newFireRate = currentFireRate;
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
  
  // Coût d'amélioration: prix x2 tous les 5 niveaux pour toutes les tours
  const currentLevel = selectedTower.level || 1;
  const priceMultiplier = Math.pow(2, Math.floor(currentLevel / 5));
  const baseUpgradeCost = towerConfig.upgradeCost * priceMultiplier;
  const upgradeCost = Math.floor(baseUpgradeCost * (1 - defenseBonuses.upgradeCostReduction / 100));
  
  console.log('Mise à jour du DOM...');
  
  // Mise à jour du menu
  const menuTitle = document.getElementById('tower-menu-title');
  if (menuTitle) menuTitle.textContent = `${towerConfig.name} - Niveau ${selectedTower.level || 1}`;
  
  const menuLevel = document.getElementById('tower-menu-level');
  if (menuLevel) menuLevel.textContent = selectedTower.level || 1;
  
  const dmgCurrent = document.getElementById('tower-menu-damage-current');
  if (dmgCurrent) dmgCurrent.textContent = currentDamage.toFixed(1);
  
  const dmgNext = document.getElementById('tower-menu-damage-next');
  if (dmgNext) dmgNext.textContent = newDamage.toFixed(1);
  
  const frCurrent = document.getElementById('tower-menu-firerate-current');
  if (frCurrent) frCurrent.textContent = `${fireRateMultiplier}x`;
  
  const frNext = document.getElementById('tower-menu-firerate-next');
  if (frNext) frNext.textContent = `${newFireRateMultiplier}x`;
  
  const upgradeCostElem = document.getElementById('tower-upgrade-cost');
  if (upgradeCostElem) upgradeCostElem.textContent = `${upgradeCost} 💰`;
  
  console.log('DOM mis à jour, affichage des compétences et ciblage...');
  
  // Afficher la portée si c'est un sniper
  const rangeRow = document.getElementById('tower-menu-range-row');
  if (rangeRow) {
    if (selectedTower.id === 'sniper') {
      if (selectedTower.level < 5) {
        rangeRow.style.display = 'block';
        const rngCurrent = document.getElementById('tower-menu-range-current');
        const rngNext = document.getElementById('tower-menu-range-next');
        if (rngCurrent) rngCurrent.textContent = selectedTower.range;
        if (rngNext) rngNext.textContent = selectedTower.range + 50;
      } else {
        rangeRow.style.display = 'none';
      }
    } else {
      rangeRow.style.display = 'none';
    }
  }
  
  // Afficher la cadence ou le bonus recherche/or selon le type de tour
  const fireRateRow = document.getElementById('tower-menu-firerate-row');
  const researchRow = document.getElementById('tower-menu-research-row');
  const goldRow = document.getElementById('tower-menu-gold-row');
  
  if (selectedTower.id === 'research') {
    // Tour Laboratoire: cacher la cadence, afficher le bonus recherche
    if (fireRateRow) fireRateRow.style.display = 'none';
    if (researchRow) {
      researchRow.style.display = 'flex';
      const currentLevel = selectedTower.level || 1;
      const currentBonus = 1 + Math.floor(currentLevel / 5);
      const nextBonus = 1 + Math.floor((currentLevel + 1) / 5);
      
      const researchCurrent = document.getElementById('tower-menu-research-current');
      const researchNext = document.getElementById('tower-menu-research-next');
      if (researchCurrent) researchCurrent.textContent = `+${currentBonus}`;
      if (researchNext) researchNext.textContent = `+${nextBonus}`;
    }
    if (goldRow) goldRow.style.display = 'none';
  } else if (selectedTower.id === 'gold') {
    // Tour Dorée: cacher la cadence, afficher le bonus or
    if (fireRateRow) fireRateRow.style.display = 'none';
    if (researchRow) researchRow.style.display = 'none';
    if (goldRow) {
      goldRow.style.display = 'flex';
      const currentLevel = selectedTower.level || 1;
      const currentBonus = 2 + (Math.floor(currentLevel / 5) * 0.2);
      const nextBonus = 2 + (Math.floor((currentLevel + 1) / 5) * 0.2);
      
      const goldCurrent = document.getElementById('tower-menu-gold-current');
      const goldNext = document.getElementById('tower-menu-gold-next');
      if (goldCurrent) goldCurrent.textContent = `x${currentBonus.toFixed(1)}`;
      if (goldNext) goldNext.textContent = `x${nextBonus.toFixed(1)}`;
    }
  } else {
    // Autres tours: afficher la cadence, cacher le bonus recherche et or
    if (fireRateRow) fireRateRow.style.display = 'flex';
    if (researchRow) researchRow.style.display = 'none';
    if (goldRow) goldRow.style.display = 'none';
  }
  
  console.log('Avant updateAbilitiesDisplay');
  
  // Afficher les compétences disponibles
  try {
    updateAbilitiesDisplay();
  } catch(e) {
    console.error('Erreur updateAbilitiesDisplay:', e);
  }
  
  // Mettre à jour l'affichage du mode de ciblage
  try {
    updateTargetModeDisplay();
  } catch(e) {
    console.error('Erreur updateTargetModeDisplay:', e);
  }
  
  // Afficher le menu en dernier
  const menu = document.getElementById('tower-menu');
  if (menu) {
    menu.classList.remove('hidden');
  }
}

function updateAbilitiesDisplay() {
  if (!selectedTower) return;
  
  const abilitiesList = document.getElementById('tower-abilities-list');
  if (!abilitiesList) {
    console.warn('tower-abilities-list element not found');
    return;
  }
  
  abilitiesList.innerHTML = '';
  
  const abilities = CONSTANTS.TOWER_ABILITIES ? Object.values(CONSTANTS.TOWER_ABILITIES) : [];
  if (abilities.length === 0) {
    console.warn('Aucune compétence trouvée dans CONSTANTS.TOWER_ABILITIES');
    return;
  }
  
  abilities.forEach(ability => {
    const hasAbility = selectedTower.abilities && selectedTower.abilities.includes(ability.id);
    
    const abilityBtn = document.createElement('button');
    abilityBtn.className = 'ability-btn';
    if (hasAbility) {
      abilityBtn.classList.add('purchased');
      abilityBtn.disabled = true;
    }
    
    abilityBtn.innerHTML = `
      <span class="ability-icon">${ability.icon}</span>
      <div class="ability-info">
        <span class="ability-name">${ability.name}</span>
        <span class="ability-desc">${ability.description}</span>
      </div>
      <span class="ability-cost">${hasAbility ? '✓ Acheté' : ability.cost + ' 💰'}</span>
    `;
    
    if (!hasAbility) {
      abilityBtn.onclick = () => buyAbility(ability.id);
    }
    
    abilitiesList.appendChild(abilityBtn);
  });
}

function buyAbility(abilityId) {
  if (!selectedTower) return;
  
  const ability = CONSTANTS.TOWER_ABILITIES[abilityId.toUpperCase()];
  if (!ability) return;
  
  if (playerMoney < ability.cost) {
    showToast('Pas assez d\'argent !', 'warning');
    return;
  }
  
  // Acheter la compétence
  playerMoney -= ability.cost;
  
  if (!selectedTower.abilities) {
    selectedTower.abilities = [];
  }
  selectedTower.abilities.push(ability.id);
  
  // Ajouter un indicateur visuel sur la tour
  addAbilityIndicator(selectedTower, ability);
  
  updateUI();
  updateAbilitiesDisplay();
  showToast(`${ability.icon} ${ability.name} acheté !`, 'success');
}

function addAbilityIndicator(tower, ability) {
  if (!tower.sprite || !gameScene) return;
  
  // Créer une icône au-dessus de la tour
  const abilityIcon = gameScene.add.text(
    tower.x + (tower.abilities.length - 1) * 15 - 15,
    tower.y - 45,
    ability.icon,
    {
      fontSize: '14px',
      stroke: '#000',
      strokeThickness: 2
    }
  );
  abilityIcon.setOrigin(0.5);
  abilityIcon.setDepth(12);
  
  if (!tower.abilityIcons) {
    tower.abilityIcons = [];
  }
  tower.abilityIcons.push(abilityIcon);
}

function closeTowerMenu() {
  document.getElementById('tower-menu').classList.add('hidden');
  selectedTower = null;
}

function startMovingTower() {
  if (!selectedTower) return;
  
  if (playerMoney < MOVE_TOWER_COST) {
    showToast('Pas assez d\'argent pour déplacer la tour !', 'warning');
    return;
  }
  
  // Stocker la tour à déplacer
  movingTower = selectedTower;
  window.movingTower = movingTower;
  
  // Créer un cercle de preview de portée
  if (gameScene && !towerRangePreview) {
    towerRangePreview = gameScene.add.circle(0, 0, movingTower.range, 0xffff00, 0.15);
    towerRangePreview.setStrokeStyle(2, 0xffff00, 0.5);
    towerRangePreview.setDepth(5);
    towerRangePreview.setVisible(false);
  }
  
  // Rendre la tour semi-transparente
  movingTower.sprite.setAlpha(0.5);
  
  closeTowerMenu();
  showToast('👉 Cliquez sur un emplacement pour déplacer la tour', 'info');
}

function moveTower(x, y) {
  if (!movingTower) return;
  
  // Snap sur la grille
  const snapped = snapToGrid(x, y);
  x = snapped.x;
  y = snapped.y;
  
  // Vérifier si la nouvelle position est valide
  if (isOnPath(x, y)) {
    showToast('Vous ne pouvez pas placer une tour sur le chemin !', 'error');
    return;
  }
  
  // Vérifier si la case est occupée (sauf par la tour qu'on déplace)
  if (isCellOccupied(x, y) && !(movingTower.x === x && movingTower.y === y)) {
    showToast('Une tour est déjà présente sur cette case !', 'warning');
    return;
  }
  
  // Appliquer le déplacement localement (sans attendre le serveur)
  const oldX = movingTower.x;
  const oldY = movingTower.y;
  
  // Supprimer l'ancienne position des cellules occupées
  towerCells.delete(`${oldX},${oldY}`);
  
  // Mettre à jour la position de la tour
  movingTower.x = x;
  movingTower.y = y;
  movingTower.sprite.setPosition(x, y);
  
  // Mettre à jour le cercle de portée
  if (movingTower.rangeCircle) {
    movingTower.rangeCircle.setPosition(x, y);
  }
  
  // Mettre à jour les auras si présentes
  if (movingTower.goldAura) {
    movingTower.goldAura.setPosition(x, y);
  }
  if (movingTower.researchAura) {
    movingTower.researchAura.setPosition(x, y);
  }
  
  // Mettre à jour les icônes d'abilities
  if (movingTower.abilityIcons && movingTower.abilityIcons.length > 0) {
    movingTower.abilityIcons.forEach((icon, index) => {
      icon.setPosition(x + index * 15 - 15, y - 45);
    });
  }
  
  // Ajouter la nouvelle position aux cellules occupées
  towerCells.add(`${x},${y}`);
  
  // Déduire le coût
  playerMoney -= MOVE_TOWER_COST;
  updateUI();
  
  // Envoyer la mise à jour au serveur
  if (socket) {
    socket.emit(CONSTANTS.SOCKET_EVENTS.MOVE_TOWER, {
      oldX: oldX,
      oldY: oldY,
      newX: x,
      newY: y
    });
  }
  
  // Restaurer l'opacité de la tour
  movingTower.sprite.setAlpha(1);
  
  // Nettoyer le cercle de preview
  if (towerRangePreview) {
    towerRangePreview.destroy();
    towerRangePreview = null;
  }
  
  showToast(`✅ Tour déplacée ! (-${MOVE_TOWER_COST} 💰)`, 'success');
  
  movingTower = null;
  window.movingTower = null;
}

function upgradeTower() {
  if (!selectedTower) return;
  
  const towerConfig = CONSTANTS.TOWER_TYPES[selectedTower.id.toUpperCase()];
  if (!towerConfig) return;
  
  const defenseBonuses = getDefenseBonuses();
  
  // Passif classe Ingénieur: réduction supplémentaire
  let engineerDiscount = 0;
  if (typeof getEngineerUpgradeDiscount === 'function') {
    engineerDiscount = getEngineerUpgradeDiscount();
  }
  
  // Coût d'amélioration: prix x2 tous les 5 niveaux pour toutes les tours
  const currentLevel = selectedTower.level || 1;
  const priceMultiplier = Math.pow(2, Math.floor(currentLevel / 5));
  const baseUpgradeCost = towerConfig.upgradeCost * priceMultiplier;
  const totalReduction = defenseBonuses.upgradeCostReduction + engineerDiscount;
  const upgradeCost = Math.floor(baseUpgradeCost * (1 - totalReduction / 100));
  
  if (playerMoney < upgradeCost) {
    showToast('Pas assez d\'argent pour améliorer !', 'warning');
    return;
  }
  
  socket.emit('UPGRADE_TOWER', {
    towerId: selectedTower.id,
    x: selectedTower.x,
    y: selectedTower.y,
    upgradeCost: upgradeCost  // Envoyer le coût avec réduction de recherche
  });
  
  // Ne pas fermer le menu, il sera mis à jour par l'événement TOWER_UPGRADED
}

// Toggle l'affichage des cercles d'aura des monstres (buffer, bigboss)
function toggleMonsterAuras() {
  showMonsterAuras = !showMonsterAuras;
  
  // Mettre à jour le bouton
  const auraButton = document.getElementById('aura-button');
  if (auraButton) {
    if (showMonsterAuras) {
      auraButton.classList.add('active');
      auraButton.textContent = '👁️ Auras ON';
    } else {
      auraButton.classList.remove('active');
      auraButton.textContent = '👁️ Auras OFF';
    }
  }
  
  // Afficher ou masquer les cercles d'aura de tous les monstres
  monsters.forEach(monster => {
    if (monster.buffCircle) {
      monster.buffCircle.setVisible(showMonsterAuras);
    }
  });
  
  showToast(showMonsterAuras ? '👁️ Auras monstres visibles' : '👁️ Auras monstres masquées', 'info');
}

function sellTower() {
  if (!selectedTower) return;
  
  socket.emit('SELL_TOWER', {
    x: selectedTower.x,
    y: selectedTower.y
  });
  
  closeTowerMenu();
}

// Changer le mode de ciblage d'une tour
function setTargetMode(mode) {
  if (!selectedTower) return;
  
  selectedTower.targetMode = mode;
  updateTargetModeDisplay();
  
  // Feedback visuel
  const modeName = {
    'closest': 'Plus proche',
    'weakest': 'Plus faible HP',
    'fastest': 'Plus rapide',
    'nearest_end': 'Plus près de la fin',
    'most_hp': 'Plus de HP'
  }[mode];
  
  showToast(`🎯 Ciblage: ${modeName}`, 'info');
}

// Mettre à jour l'affichage du mode de ciblage
function updateTargetModeDisplay() {
  if (!selectedTower) return;
  
  const currentMode = selectedTower.targetMode || 'nearest_end';
  const buttons = document.querySelectorAll('.targeting-btn');
  
  buttons.forEach(btn => {
    const mode = btn.getAttribute('data-mode');
    if (mode === currentMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
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
  
  // Mettre à jour Gold
  const goldDamage = Math.floor(CONSTANTS.TOWER_TYPES.GOLD.damage * (1 + defenseBonuses.damageBonus / 100));
  const goldElement = document.getElementById('tower-gold-damage');
  if (goldElement) goldElement.textContent = `${goldDamage} dégâts`;
  
  // Mettre à jour Research
  const researchDamage = Math.floor(CONSTANTS.TOWER_TYPES.RESEARCH.damage * (1 + defenseBonuses.damageBonus / 100));
  const researchElement = document.getElementById('tower-research-damage');
  if (researchElement) researchElement.textContent = `${researchDamage} dégâts`;
  
  // Mettre à jour Electric
  const electricDamage = Math.floor(CONSTANTS.TOWER_TYPES.ELECTRIC.damage * (1 + defenseBonuses.damageBonus / 100));
  const electricElement = document.getElementById('tower-electric-damage');
  if (electricElement) electricElement.textContent = `${electricDamage} dégâts`;
}

// Exposer towers et movingTower globalement pour les autres scripts
window.towers = towers;
window.movingTower = movingTower;

function getTowers() {
  return towers;
}

function getMovingTower() {
  return movingTower;
}

function setMovingTower(tower) {
  movingTower = tower;
  window.movingTower = tower;
}