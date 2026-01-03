// Système de classes et compétences
let playerClass = null; // 'attack', 'defense', 'lastchance', 'engineer'
let classChosen = false;
let skillCost = 50000; // Coût initial de la compétence active
let skillCostMultiplier = 1.25; // Multiplicateur après chaque utilisation
let skillUsageCount = 0; // Nombre d'utilisations de la compétence

// Effets temporaires actifs
let attackClassActiveUntil = 0; // Timestamp fin effet réduction coût monstres
let defenseClassActiveUntil = 0; // Timestamp fin effet boost attaque tours

// Compteurs pour passifs
let defenseKillCounter = 0; // Compteur kills pour passif Defense

// Définition des classes
const PLAYER_CLASSES = {
  attack: {
    id: 'attack',
    name: 'Attaquant',
    icon: '⚔️',
    color: '#e74c3c',
    description: 'Spécialisé dans l\'envoi de monstres',
    active: {
      name: 'Rage Offensive',
      description: 'Réduit le coût des monstres de 20% pendant 5 secondes',
      duration: 5000,
      effect: 'monsterCostReduction',
      value: 20
    },
    passive: {
      name: 'Butin de Guerre',
      description: 'Gagnez des points de recherche quand vous envoyez des mobs',
      effect: 'researchOnSend'
    }
  },
  defense: {
    id: 'defense',
    name: 'Défenseur',
    icon: '🛡️',
    color: '#3498db',
    description: 'Spécialisé dans la défense par tours',
    active: {
      name: 'Fortification',
      description: 'Augmente l\'attaque des tours de 30% pendant 15 secondes',
      duration: 15000,
      effect: 'towerDamageBoost',
      value: 30
    },
    passive: {
      name: 'Efficacité Mortelle',
      description: 'Tous les 100 mobs tués, gagnez 50 points de recherche',
      effect: 'researchOnKills',
      killsRequired: 100,
      researchReward: 50
    }
  },
  lastchance: {
    id: 'lastchance',
    name: 'Dernière Chance',
    icon: '💀',
    color: '#9b59b6',
    description: 'Pour les situations désespérées',
    active: {
      name: 'Fléau',
      description: 'Enlève 50% des HP de toutes les unités sur le terrain',
      effect: 'halfHealthAll',
      value: 50
    },
    passive: {
      name: 'Résilience',
      description: 'Un mob qui passe enlève seulement 0.85 HP au lieu de 1',
      effect: 'reducedDamage',
      value: 0.85
    }
  },
  engineer: {
    id: 'engineer',
    name: 'Ingénieur',
    icon: '🔧',
    color: '#f39c12',
    description: 'Maître des améliorations',
    active: {
      name: 'Surcharge',
      description: 'Augmente de 3 niveaux toutes les tours sur le terrain',
      effect: 'boostAllTowers',
      value: 3
    },
    passive: {
      name: 'Optimisation',
      description: '-6% de coût pour l\'amélioration des tours',
      effect: 'upgradeDiscount',
      value: 6
    }
  }
};

// Ouvrir le modal de sélection de classe
function showClassSelection() {
  const modal = document.getElementById('class-selection-modal');
  if (modal) {
    modal.classList.remove('hidden');
    updateClassSelectionUI();
  }
}

// Fermer le modal de sélection
function hideClassSelection() {
  const modal = document.getElementById('class-selection-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Mettre à jour l'UI de sélection
function updateClassSelectionUI() {
  const container = document.getElementById('class-selection-content');
  if (!container) return;
  
  let html = '<div class="class-grid">';
  
  for (const [key, classData] of Object.entries(PLAYER_CLASSES)) {
    html += `
      <div class="class-card" onclick="selectClass('${key}')" style="--class-color: ${classData.color}">
        <div class="class-icon">${classData.icon}</div>
        <div class="class-name">${classData.name}</div>
        <div class="class-description">${classData.description}</div>
        <div class="class-abilities">
          <div class="class-ability active-ability">
            <span class="ability-type">⚡ Actif:</span>
            <span class="ability-name">${classData.active.name}</span>
            <span class="ability-desc">${classData.active.description}</span>
          </div>
          <div class="class-ability passive-ability">
            <span class="ability-type">🔄 Passif:</span>
            <span class="ability-name">${classData.passive.name}</span>
            <span class="ability-desc">${classData.passive.description}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

// Sélectionner une classe
function selectClass(classId) {
  if (classChosen) return;
  
  playerClass = classId;
  classChosen = true;
  skillUsageCount = 0;
  skillCost = 50000;
  
  const classData = PLAYER_CLASSES[classId];
  showToast(`${classData.icon} Classe ${classData.name} sélectionnée !`, 'success');
  showNotification(`${classData.icon} Vous êtes un ${classData.name} !`);
  
  hideClassSelection();
  updateSkillButton();
}

// Mettre à jour le bouton de compétence
function updateSkillButton() {
  const btn = document.getElementById('skill-button');
  if (!btn || !playerClass) return;
  
  const classData = PLAYER_CLASSES[playerClass];
  const currentCost = Math.floor(skillCost * Math.pow(skillCostMultiplier, skillUsageCount));
  
  btn.innerHTML = `${classData.icon} ${classData.active.name} <span class="skill-cost">(${formatNumber(currentCost)} ⚔️)</span>`;
  btn.style.setProperty('--class-color', classData.color);
  btn.classList.remove('hidden');
  
  // Vérifier si le joueur peut utiliser la compétence
  if (playerAttackGold >= currentCost) {
    btn.classList.remove('disabled');
  } else {
    btn.classList.add('disabled');
  }
}

// Formater les grands nombres
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Utiliser la compétence active
function useActiveSkill() {
  if (!playerClass || !classChosen) {
    showToast('❌ Vous devez d\'abord choisir une classe !', 'error');
    return;
  }
  
  const currentCost = Math.floor(skillCost * Math.pow(skillCostMultiplier, skillUsageCount));
  
  if (playerAttackGold < currentCost) {
    showToast(`❌ Pas assez de dépenses d'attaque ! (${formatNumber(currentCost)} ⚔️ requis)`, 'error');
    return;
  }

  const classData = PLAYER_CLASSES[playerClass];

  // Déduire le coût d'attaque
  playerAttackGold -= currentCost;
  if (playerAttackGold < 0) playerAttackGold = 0;

  // Appliquer l'effet selon la classe
  switch (playerClass) {
    case 'attack':
      applyAttackClassActive();
      break;
    case 'defense':
      applyDefenseClassActive();
      break;
    case 'lastchance':
      applyLastChanceClassActive();
      break;
    case 'engineer':
      applyEngineerClassActive();
      break;
  }

  skillUsageCount++;

  showToast(`⚡ ${classData.active.name} activé !`, 'success');
  showNotification(`⚡ ${classData.icon} ${classData.active.name} !`);
  updateSkillButton();
  // Mettre à jour l'affichage de l'or d'attaque
  if (typeof updateUI === 'function') updateUI();
  // Envoyer la mise à jour au serveur si nécessaire
  if (typeof socket !== 'undefined' && socket.emit) {
    socket.emit('UPDATE_ATTACK_GOLD', { attackGold: playerAttackGold });
  }
}

// === EFFETS ACTIFS ===

// Attaque: Réduction coût monstres 20% pendant 5s
function applyAttackClassActive() {
  attackClassActiveUntil = Date.now() + 5000;
  
  // Timer pour désactiver
  setTimeout(() => {
    attackClassActiveUntil = 0;
    showToast('⏰ Rage Offensive terminée', 'info');
  }, 5000);
}

// Défense: Boost dégâts tours 30% pendant 15s
function applyDefenseClassActive() {
  defenseClassActiveUntil = Date.now() + 15000;
  
  // Appliquer le boost à toutes les tours
  if (towers) {
    towers.forEach(tower => {
      if (!tower.originalDamage) {
        tower.originalDamage = tower.damage;
      }
      tower.damage = Math.floor(tower.originalDamage * 1.3);
    });
  }
  
  // Timer pour désactiver
  setTimeout(() => {
    defenseClassActiveUntil = 0;
    // Restaurer les dégâts originaux
    if (towers) {
      towers.forEach(tower => {
        if (tower.originalDamage) {
          tower.damage = tower.originalDamage;
          delete tower.originalDamage;
        }
      });
    }
    showToast('⏰ Fortification terminée', 'info');
  }, 15000);
}

// Dernière Chance: 50% HP à tous les monstres
function applyLastChanceClassActive() {
  if (monsters && monsters.length > 0) {
    monsters.forEach(monster => {
      if (monster.currentHealth) {
        monster.currentHealth = Math.floor(monster.currentHealth * 0.5);
        // Mettre à jour la barre de vie
        if (monster.healthBar) {
          const healthPercent = monster.currentHealth / monster.health;
          monster.healthBar.width = 30 * healthPercent;
          monster.healthBar.setFillStyle(0x00ff00); // Optionnel: change la couleur
        }
      }
    });
    showToast(`💀 ${monsters.length} monstres affaiblis !`, 'success');
  } else {
    showToast('❌ Aucun monstre sur le terrain !', 'error');
  }
}

// Ingénieur: +3 niveaux à toutes les tours
function applyEngineerClassActive() {
  if (towers && towers.length > 0) {
    const maxLevel = getMaxTowerSize();
    let upgradedCount = 0;
    
    towers.forEach(tower => {
      const oldLevel = tower.level || 1;
      const newLevel = Math.min(oldLevel + 3, maxLevel);
      if (newLevel > oldLevel) {
        tower.level = newLevel;
        upgradedCount++;
        // Always recalculate stats from the new level
        const towerType = (tower.id || tower.type || 'basic').toUpperCase();
        const towerData = CONSTANTS.TOWER_TYPES[towerType];
        const damageBonus = getDefenseBonuses().damageBonus;
        const attackSpeedBonus = getDefenseBonuses().attackSpeedBonus;
        tower.damage = Math.floor(towerData.damage * (1 + (tower.level - 1) * 0.35) * (1 + damageBonus / 100));
        tower.fireRate = Math.floor(towerData.fireRate / (1 + (tower.level - 1) * 0.15) / (1 + attackSpeedBonus / 100));
        // Update level label
        if (tower.levelText) {
          tower.levelText.setText(`Nv.${tower.level}`);
        }
        // Animation
        if (tower.sprite && gameScene) {
          gameScene.tweens.add({
            targets: tower.sprite,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
          });
        }
      }
    });
    // Force UI refresh after bulk upgrade
    if (typeof updateTowersPanelUI === 'function') updateTowersPanelUI();
    if (typeof updateUI === 'function') updateUI();
    showToast(`🔧 ${upgradedCount} tours améliorées !`, 'success');
  } else {
    showToast('❌ Aucune tour sur le terrain !', 'error');
  }
}

// === EFFETS PASSIFS ===

// Vérifier si la réduction de coût monstre est active (Attaque)
function getMonsterCostMultiplier() {
  if (playerClass === 'attack' && attackClassActiveUntil > Date.now()) {
    return 0.8; // -20%
  }
  return 1.0;
}

// Passif Attaque: Gagner recherche quand on envoie des mobs
function onMonsterSent(monsterCost) {
  if (playerClass === 'attack') {
    // Gagner 1 point de recherche par 100 gold dépensé
    const researchPoints = Math.floor(monsterCost / 100);
    if (researchPoints > 0 && currentResearch) {
      researchKills += researchPoints;
      updateResearchProgressBar();
    }
  }
}

// Passif Défense: Gagner recherche tous les 100 kills
function onMonsterKilled() {
  if (playerClass === 'defense') {
    defenseKillCounter++;
    if (defenseKillCounter >= 100) {
      defenseKillCounter = 0;
      // Ajouter 50 points de recherche
      if (currentResearch) {
        researchKills += 50;
        updateResearchProgressBar();
        showToast('🛡️ +50 points de recherche (Passif Défenseur)', 'success');
      }
    }
  }
}

// Passif Dernière Chance: Réduction dégâts des mobs qui passent
function getMonsterPassDamage() {
  if (playerClass === 'lastchance') {
    return 0.85;
  }
  return 1.0;
}

// Passif Ingénieur: Réduction coût amélioration tours
function getEngineerUpgradeDiscount() {
  if (playerClass === 'engineer') {
    return 6; // -6%
  }
  return 0;
}

// Réinitialiser le système de classes
function resetClassSystem() {
  playerClass = null;
  classChosen = false;
  skillCost = 50000;
  skillUsageCount = 0;
  attackClassActiveUntil = 0;
  defenseClassActiveUntil = 0;
  defenseKillCounter = 0;
  
  const btn = document.getElementById('skill-button');
  if (btn) {
    btn.classList.add('hidden');
  }
}
