// Gestion du système de recherche
let researchTree = {
  attack: {
    monsterHealth: { level: 0, killsBuffer: 0, name: 'Renforcer les monstres', icon: '❤️' },
    monsterSpeed: { level: 0, killsBuffer: 0, name: 'Accélérer les monstres', icon: '⚡' },
    monsterCost: { level: 0, killsBuffer: 0, name: 'Réduire coût monstres', icon: '💰' }
  },
  defense: {
    towerUpgradeCost: { level: 0, killsBuffer: 0, name: 'Amélioration moins chère', icon: '💎' },
    towerDamage: { level: 0, killsBuffer: 0, name: 'Augmenter l\'attaque', icon: '⚔️' },
    towerAttackSpeed: { level: 0, killsBuffer: 0, name: 'Accélérer attaque', icon: '🎯' }
  },
  general: {
    towerSize: { level: 0, killsBuffer: 0, name: 'Augmenter taille max tours', icon: '📏' }
  }
};

let currentResearch = null; // { category, research }
let researchKills = 0; // Kills accumulés pour la recherche en cours

// Déterminer le nombre de kills requis pour compléter un niveau de recherche
function getKillsRequiredForLevel(level, category = null, research = null) {
  // Pour towerSize, toujours 50 kills par niveau
  if (category === 'general' && research === 'towerSize') {
    return 50;
  }
  // Pour les autres, progression standard
  return 5 + (level * 5); // Level 1: 5, Level 2: 10, Level 3: 15, etc...
}

// Obtenir le bonus % en fonction du niveau
function getResearchBonus(level) {
  return level * 2; // +2% par level
}

// Fonction pour calculer les bonus actuels
function getAttackBonuses() {
  const health = getResearchBonus(researchTree.attack.monsterHealth.level);
  const speed = getResearchBonus(researchTree.attack.monsterSpeed.level);
  const cost = getResearchBonus(researchTree.attack.monsterCost.level);
  
  return {
    healthBonus: health,     // +2% par level
    speedBonus: speed,       // +2% par level
    costReduction: cost      // -2% par level (réduit le coût)
  };
}

function getDefenseBonuses() {
  const upgradeCost = getResearchBonus(researchTree.defense.towerUpgradeCost.level);
  const damage = getResearchBonus(researchTree.defense.towerDamage.level);
  const attackSpeed = getResearchBonus(researchTree.defense.towerAttackSpeed.level);
  
  return {
    upgradeCostReduction: upgradeCost,  // -2% par level
    damageBonus: damage,                // +2% par level
    attackSpeedBonus: attackSpeed       // +2% par level
  };
}

// Obtenir les bonus généraux
function getGeneralBonuses() {
  const towerSize = researchTree.general.towerSize.level;
  
  return {
    towerSizeBonus: towerSize * 5  // +5 tours par level
  };
}

// Obtenir la taille max des tours
function getMaxTowerSize() {
  return 20 + getGeneralBonuses().towerSizeBonus;
}

// Ajouter un kill et progresser la recherche
// bonusPoints = points supplémentaires si le monstre était dans l'aura d'un laboratoire
function addResearchKill(bonusPoints = 0, researchTower = null) {
  if (!currentResearch) return;
  
  const { category, research } = currentResearch;
  const targetKills = getKillsRequiredForLevel(researchTree[category][research].level + 1, category, research);
  
  // Base: +1 pour chaque kill
  const totalPoints = 1 + bonusPoints;
  researchKills += totalPoints;
  
  // Afficher l'animation au-dessus d'une tour de recherche
  showResearchPointAnimation(totalPoints, researchTower);
  
  // Mettre à jour la barre de progression
  updateResearchProgressBar();
  
  // Vérifier si la recherche est complétée
  if (researchKills >= targetKills) {
    completeResearch(category, research);
  }
}

// Afficher l'animation +X au-dessus d'une tour de recherche
function showResearchPointAnimation(points = 1, fromTower = null) {
  if (!gameScene) return;
  
  // Trouver une tour de recherche pour afficher l'animation
  let researchTower = fromTower;
  if (!researchTower || researchTower.id !== 'research') {
    // Chercher une tour de recherche aléatoire
    const researchTowers = towers.filter(t => t.id === 'research' && t.sprite && t.sprite.active);
    if (researchTowers.length > 0) {
      researchTower = researchTowers[Math.floor(Math.random() * researchTowers.length)];
    }
  }
  
  if (!researchTower) return;
  
  // Créer le texte avec le nombre de points
  const text = points > 1 ? `+${points} 🔬` : '+1 🔬';
  const color = points > 1 ? '#00ffff' : '#00ff88'; // Cyan si bonus, vert sinon
  
  const floatingText = gameScene.add.text(
    researchTower.x,
    researchTower.y - 30,
    text,
    {
      fontSize: points > 1 ? '22px' : '18px',
      fontStyle: 'bold',
      fill: color,
      stroke: '#000',
      strokeThickness: 3
    }
  );
  floatingText.setOrigin(0.5);
  floatingText.setDepth(100);
  
  // Animation de montée et disparition
  gameScene.tweens.add({
    targets: floatingText,
    y: floatingText.y - 40,
    alpha: 0,
    duration: 1000,
    ease: 'Power2',
    onComplete: () => {
      if (floatingText && floatingText.active) {
        floatingText.destroy();
      }
    }
  });
}

// Compléter une recherche
function completeResearch(category, research) {
  researchTree[category][research].level++;
  researchKills = 0;
  currentResearch = null;
  
  const researchData = researchTree[category][research];
  showToast(`🔬 Recherche ${researchData.name} complétée au niveau ${researchData.level} !`, 'success');
  
  // Mettre à jour l'affichage des dégâts des tours si c'est une recherche de dégâts
  if (category === 'defense' && research === 'towerDamage') {
    updateTowerShopDisplay();
  }
  
  // Mettre à jour l'affichage des coûts des monstres si c'est une recherche de coût
  if (category === 'attack' && research === 'monsterCost') {
    updateMonsterCostDisplay();
  }
  
  updateResearchProgressBar();
  updateResearchUI();
}

// Démarrer une nouvelle recherche
function startResearch(category, research) {
  // Si une recherche est en cours, sauvegarder ses kills en buffer
  if (currentResearch) {
    const { category: oldCat, research: oldRes } = currentResearch;
    researchTree[oldCat][oldRes].killsBuffer = researchKills;
  }
  
  // Charger la nouvelle recherche et restaurer son buffer de kills
  currentResearch = { category, research };
  researchKills = researchTree[category][research].killsBuffer || 0;
  
  updateResearchProgressBar();
  showToast(`🔬 Recherche lancée: ${researchTree[category][research].name}`, 'info');
  updateResearchUI();
}

// Mettre à jour l'affichage du panneau de recherche
function updateResearchUI() {
  const contentContainer = document.getElementById('research-content');
  if (!contentContainer) return;  // Ne rien faire si le panneau n'est pas visible
  
  // Mettre à jour la barre de progression en cours
  updateResearchProgressBar();
  
  // Construire l'affichage de l'attaque
  let attackHTML = '<div class="research-category"><h4>🗡️ Attaque</h4>';
  for (const [key, data] of Object.entries(researchTree.attack)) {
    const isCurrent = currentResearch?.category === 'attack' && currentResearch?.research === key;
    const killsNeeded = getKillsRequiredForLevel(data.level + 1, 'attack', key);
    const progress = isCurrent ? (researchKills / killsNeeded * 100) : 0;
    const buttonClass = isCurrent ? 'in-progress' : '';
    
    // Calculer les stats actuelles et futures
    const currentBonus = getResearchBonus(data.level);
    const nextBonus = getResearchBonus(data.level + 1);
    const bonusSign = key === 'monsterCost' ? '-' : '+'; // Réduction de coût est négative
    
    attackHTML += `
      <div class="research-item ${buttonClass}">
        <div class="research-header">
          <span class="research-icon">${data.icon}</span>
          <span class="research-name">${data.name}</span>
          <span class="research-level">Nv.${data.level}</span>
        </div>
        <div class="research-stats">
          <span class="current-bonus">${bonusSign}${currentBonus}%</span>
          <span class="next-bonus">→ ${bonusSign}${nextBonus}%</span>
        </div>
        ${isCurrent ? `
          <div class="research-progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
            <span class="progress-text">${researchKills}/${killsNeeded}</span>
          </div>
        ` : ''}
        <button class="btn-research ${isCurrent ? 'cancel' : ''}" onclick="toggleResearch('attack', '${key}')">
          ${isCurrent ? '❌ Annuler' : '▶️ Lancer'}
        </button>
      </div>
    `;
  }
  attackHTML += '</div>';
  
  // Construire l'affichage de la défense
  let defenseHTML = '<div class="research-category"><h4>🛡️ Défense</h4>';
  for (const [key, data] of Object.entries(researchTree.defense)) {
    const isCurrent = currentResearch?.category === 'defense' && currentResearch?.research === key;
    const killsNeeded = getKillsRequiredForLevel(data.level + 1, 'defense', key);
    const progress = isCurrent ? (researchKills / killsNeeded * 100) : 0;
    const buttonClass = isCurrent ? 'in-progress' : '';
    
    // Calculer les stats actuelles et futures
    const currentBonus = getResearchBonus(data.level);
    const nextBonus = getResearchBonus(data.level + 1);
    const bonusSign = key === 'towerUpgradeCost' ? '-' : '+'; // Réduction de coût est négative
    
    defenseHTML += `
      <div class="research-item ${buttonClass}">
        <div class="research-header">
          <span class="research-icon">${data.icon}</span>
          <span class="research-name">${data.name}</span>
          <span class="research-level">Nv.${data.level}</span>
        </div>
        <div class="research-stats">
          <span class="current-bonus">${bonusSign}${currentBonus}%</span>
          <span class="next-bonus">→ ${bonusSign}${nextBonus}%</span>
        </div>
        ${isCurrent ? `
          <div class="research-progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
            <span class="progress-text">${researchKills}/${killsNeeded}</span>
          </div>
        ` : ''}
        <button class="btn-research ${isCurrent ? 'cancel' : ''}" onclick="toggleResearch('defense', '${key}')">
          ${isCurrent ? '❌ Annuler' : '▶️ Lancer'}
        </button>
      </div>
    `;
  }
  defenseHTML += '</div>';
  
  // Construire l'affichage de la catégorie Général
  let generalHTML = '<div class="research-category"><h4>⚙️ Général</h4>';
  for (const [key, data] of Object.entries(researchTree.general)) {
    const isCurrent = currentResearch?.category === 'general' && currentResearch?.research === key;
    const killsNeeded = getKillsRequiredForLevel(data.level + 1, 'general', key);
    const progress = isCurrent ? (researchKills / killsNeeded * 100) : 0;
    const buttonClass = isCurrent ? 'in-progress' : '';
    
    // Pour towerSize, afficher en nombre de tours au lieu de pourcentage
    const currentBonus = key === 'towerSize' ? data.level * 5 : getResearchBonus(data.level);
    const nextBonus = key === 'towerSize' ? (data.level + 1) * 5 : getResearchBonus(data.level + 1);
    const bonusUnit = key === 'towerSize' ? ' tours' : '%';
    
    generalHTML += `
      <div class="research-item ${buttonClass}">
        <div class="research-header">
          <span class="research-icon">${data.icon}</span>
          <span class="research-name">${data.name}</span>
          <span class="research-level">Nv.${data.level}</span>
        </div>
        <div class="research-stats">
          <span class="current-bonus">+${currentBonus}${bonusUnit}</span>
          <span class="next-bonus">→ +${nextBonus}${bonusUnit}</span>
        </div>
        ${isCurrent ? `
          <div class="research-progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
            <span class="progress-text">${researchKills}/${killsNeeded}</span>
          </div>
        ` : ''}
        <button class="btn-research ${isCurrent ? 'cancel' : ''}" onclick="toggleResearch('general', '${key}')">
          ${isCurrent ? '❌ Annuler' : '▶️ Lancer'}
        </button>
      </div>
    `;
  }
  generalHTML += '</div>';
  
  document.getElementById('research-content').innerHTML = attackHTML + defenseHTML + generalHTML;
}

// Toggle la recherche (lancer ou annuler)
function toggleResearch(category, research) {
  if (currentResearch?.category === category && currentResearch?.research === research) {
    // Annuler la recherche en cours et sauvegarder les kills en buffer
    researchTree[category][research].killsBuffer = researchKills;
    currentResearch = null;
    researchKills = 0;
    updateResearchProgressBar();
    showToast('❌ Recherche annulée', 'info');
  } else {
    // Lancer une nouvelle recherche
    startResearch(category, research);
  }
}

// Ouvrir/Fermer le panneau de recherche
function toggleResearchPanel() {
  const modal = document.getElementById('research-modal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    updateResearchUI();
  } else {
    modal.classList.add('hidden');
  }
}

// Fermer le panneau quand on clique en dehors
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('research-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }
});

// Mettre à jour la barre de progression de recherche affichée dans la modal
function updateResearchProgressBar() {
  const progressSection = document.getElementById('research-progress-section');
  const progressFill = document.getElementById('research-progress-fill');
  const progressText = document.getElementById('research-progress-text');
  const progressName = document.getElementById('research-progress-name');
  const researchButton = document.getElementById('research-button');
  
  if (!progressSection) return;
  
  if (currentResearch) {
    const { category, research } = currentResearch;
    const researchData = researchTree[category][research];
    const killsNeeded = getKillsRequiredForLevel(researchData.level + 1, category, research);
    const progress = (researchKills / killsNeeded * 100);
    
    // Afficher la section
    progressSection.classList.remove('hidden');
    
    // Mettre à jour les éléments du modal
    progressName.textContent = `${researchData.icon} ${researchData.name} (Nv.${researchData.level + 1})`;
    progressText.textContent = `${researchKills}/${killsNeeded}`;
    progressFill.style.width = progress + '%';
    
    // Mettre à jour la barre de progression du bouton
    if (researchButton) {
      researchButton.style.setProperty('--research-progress', progress + '%');
    }
  } else {
    // Masquer la section si aucune recherche n'est en cours
    progressSection.classList.add('hidden');
    // Remettre la progression à 0%
    if (researchButton) {
      researchButton.style.setProperty('--research-progress', '0%');
    }
  }
}
