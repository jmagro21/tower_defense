// Système de tooltip avec descriptions et mini-démos animées
let tooltipTimeout = null;
let currentTooltipTarget = null;
let tooltipCanvas = null;
let tooltipCtx = null;
let tooltipAnimationFrame = null;
let tooltipAnimationData = null;

// Couleurs réelles des tours
const TOWER_VISUALS = {
  basic: {
    name: 'Tour Basique',
    icon: '🔷',
    baseColor: '#808080',
    bodyColor: '#606060',
    topColor: '#505050',
    cannonColor: '#404040',
    description: 'Tour standard équilibrée. Bons dégâts et portée moyenne. Idéale pour débuter.',
    stats: ['Dégâts: 10', 'Portée: 150', 'Cadence: 1.5s'],
    behavior: 'Tire des projectiles sur les ennemis à portée',
    projectileColor: '#ffffff'
  },
  sniper: {
    name: 'Tour Sniper',
    icon: '🎯',
    baseColor: '#4a4a4a',
    bodyColor: '#2c3e50',
    scopeColor: '#3498db',
    barrelColor: '#1a252f',
    description: 'Longue portée et gros dégâts mais cadence lente. Parfaite pour éliminer les cibles prioritaires.',
    stats: ['Dégâts: 50', 'Portée: 300', 'Cadence: 3s'],
    behavior: 'Tire des projectiles longue distance très puissants',
    projectileColor: '#3498db'
  },
  rapid: {
    name: 'Tour Rapide',
    icon: '⚡',
    baseColor: '#95a5a6',
    bodyColor: '#e74c3c',
    cannonColor: '#c0392b',
    description: 'Cadence de tir très élevée mais faibles dégâts. Efficace contre les groupes de petits monstres.',
    stats: ['Dégâts: 5', 'Portée: 120', 'Cadence: 0.8s'],
    behavior: 'Mitraille les ennemis à grande vitesse',
    projectileColor: '#e74c3c'
  },
  gold: {
    name: 'Tour Dorée',
    icon: '💰',
    baseColor: '#f39c12',
    bodyColor: '#ffd700',
    gemColor: '#ffeb3b',
    coinColor: '#f1c40f',
    description: 'Double les récompenses en or des monstres tués dans son aura. Investissement rentable!',
    stats: ['Dégâts: 8', 'Aura: 150', 'Bonus: x2 or'],
    behavior: 'Aura dorée qui double les gains des kills proches',
    projectileColor: '#ffd700'
  },
  research: {
    name: 'Tour Laboratoire',
    icon: '🔬',
    baseColor: '#34495e',
    bodyColor: '#3498db',
    windowColor: '#74b9ff',
    atomColor: '#00b894',
    description: 'Ralentit les ennemis et donne des points de recherche bonus sur les kills dans l\'aura.',
    stats: ['Dégâts: 3', 'Aura: 150', 'Slow: 1%'],
    behavior: 'Aura violette qui ralentit et boost la recherche',
    projectileColor: '#00b894'
  },
  electric: {
    name: 'Tour Électrique',
    icon: '⚡',
    baseColor: '#2c3e50',
    coilColor: '#7f8c8d',
    topColor: '#3498db',
    sparkColor: '#00ffff',
    description: 'Décharge électrique touchant jusqu\'à 10 cibles et les étourdissant brièvement.',
    stats: ['Dégâts: 15', 'Cibles: 10', 'Stun: 0.5s'],
    behavior: 'Arc électrique en chaîne entre plusieurs ennemis',
    projectileColor: '#00ffff'
  }
};

// Couleurs réelles des monstres
const MONSTER_VISUALS = {
  basic: {
    name: 'Monstre Basique',
    icon: '👹',
    bodyColor: '#e74c3c',
    size: 12,
    description: 'Ennemi standard sans capacité spéciale. Facile à éliminer mais nombreux.',
    stats: ['PV: 100', 'Vitesse: 30', 'Coût: 50'],
    behavior: 'Avance simplement sur le chemin',
    speed: 0.8
  },
  tank: {
    name: 'Monstre Tank',
    icon: '🛡️',
    bodyColor: '#95a5a6',
    armorColor: '#7f8c8d',
    size: 14,
    description: 'Très résistant mais lent. Nécessite beaucoup de dégâts pour être éliminé.',
    stats: ['PV: 300', 'Vitesse: 18', 'Coût: 150'],
    behavior: 'Avance lentement en encaissant les dégâts',
    speed: 0.4
  },
  fast: {
    name: 'Monstre Rapide',
    icon: '💨',
    bodyColor: '#f39c12',
    tailColor: '#e67e22',
    size: 10,
    description: 'Très rapide mais fragile. Peut traverser vos défenses si vous n\'êtes pas préparé.',
    stats: ['PV: 50', 'Vitesse: 60', 'Coût: 100'],
    behavior: 'Sprint rapidement à travers le chemin',
    speed: 1.8
  },
  splitter: {
    name: 'Diviseur',
    icon: '🔀',
    bodyColor: '#16a085',
    blobColor: '#1abc9c',
    size: 14,
    description: 'Se divise en 2 monstres basiques à sa mort. Attention aux surprises!',
    stats: ['PV: 150', 'Vitesse: 40', 'Coût: 120'],
    behavior: 'Se divise en 2 quand il meurt',
    speed: 0.7
  },
  buffer: {
    name: 'Soigneur',
    icon: '💚',
    bodyColor: '#2ecc71',
    crossColor: '#ffffff',
    coreColor: '#27ae60',
    size: 15,
    description: 'Augmente les PV des monstres proches de 50%. Cible prioritaire!',
    stats: ['PV: 200', 'Aura: 100', 'Buff: +50% PV'],
    behavior: 'Aura verte qui renforce les alliés proches',
    speed: 0.5
  },
  stunner: {
    name: 'Paralyseur',
    icon: '⚡',
    bodyColor: '#f1c40f',
    sparkColor: '#ffffff',
    boltColor: '#e67e22',
    size: 14,
    description: 'Peut paralyser jusqu\'à 2 tours pendant 2 secondes. Très dangereux!',
    stats: ['PV: 180', 'Stun: 2s', 'Max: 2 tours'],
    behavior: 'Désactive les tours sur son passage',
    speed: 0.6
  },
  invisible: {
    name: 'Fantôme',
    icon: '👻',
    bodyColor: '#9b59b6',
    auraColor: '#8e44ad',
    size: 13,
    description: 'Invisible! Seules les tours avec Vision Véritable peuvent l\'attaquer.',
    stats: ['PV: 120', 'Vitesse: 45', 'Coût: 250'],
    behavior: 'Se déplace invisible jusqu\'à être révélé',
    speed: 0.9,
    invisible: true
  },
  boss: {
    name: 'Boss',
    icon: '👿',
    bodyColor: '#8e44ad',
    hornColor: '#000000',
    eyeColor: '#ff0000',
    size: 20,
    description: 'Ennemi puissant avec énormément de PV. Préparez vos meilleures défenses!',
    stats: ['PV: 1000', 'Vitesse: 12', 'Coût: 300'],
    behavior: 'Avance lentement mais très résistant',
    speed: 0.3
  },
  bigboss: {
    name: 'Titan',
    icon: '💀',
    bodyColor: '#6b3fa0',
    auraColor: '#4a2c7a',
    hornColor: '#1a1a2e',
    size: 28,
    description: 'Le monstre ultime! Invisible, paralyse les tours, boost ses alliés et spawn des rapides. Se divise en 5 boss à sa mort!',
    stats: ['PV: 15000', 'Stun: 3s', 'Split: 5 boss'],
    behavior: 'Cumule TOUTES les capacités spéciales',
    speed: 0.2
  }
};

function initTooltipSystem() {
  if (!document.getElementById('info-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.id = 'info-tooltip';
    tooltip.className = 'info-tooltip hidden';
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <span class="tooltip-icon"></span>
        <span class="tooltip-name"></span>
      </div>
      <div class="tooltip-demo">
        <canvas id="tooltip-canvas" width="200" height="100"></canvas>
      </div>
      <div class="tooltip-description"></div>
      <div class="tooltip-stats"></div>
      <div class="tooltip-behavior"></div>
    `;
    document.body.appendChild(tooltip);
  }
  
  tooltipCanvas = document.getElementById('tooltip-canvas');
  if (tooltipCanvas) {
    tooltipCtx = tooltipCanvas.getContext('2d');
  }
}

function showTowerTooltip(towerType, x, y) {
  const info = TOWER_VISUALS[towerType];
  if (!info) return;
  
  const tooltip = document.getElementById('info-tooltip');
  if (!tooltip) return;
  
  tooltip.querySelector('.tooltip-icon').textContent = info.icon;
  tooltip.querySelector('.tooltip-name').textContent = info.name;
  tooltip.querySelector('.tooltip-description').textContent = info.description;
  tooltip.querySelector('.tooltip-stats').innerHTML = info.stats.map(s => `<span class="stat-tag">${s}</span>`).join('');
  tooltip.querySelector('.tooltip-behavior').textContent = '🎮 ' + info.behavior;
  
  positionTooltip(tooltip, x, y);
  tooltip.classList.remove('hidden');
  
  startTowerDemoAnimation(towerType, info);
}

function showMonsterTooltip(monsterType, x, y) {
  const info = MONSTER_VISUALS[monsterType];
  if (!info) return;
  
  const tooltip = document.getElementById('info-tooltip');
  if (!tooltip) return;
  
  tooltip.querySelector('.tooltip-icon').textContent = info.icon;
  tooltip.querySelector('.tooltip-name').textContent = info.name;
  tooltip.querySelector('.tooltip-description').textContent = info.description;
  tooltip.querySelector('.tooltip-stats').innerHTML = info.stats.map(s => `<span class="stat-tag">${s}</span>`).join('');
  tooltip.querySelector('.tooltip-behavior').textContent = '🎮 ' + info.behavior;
  
  positionTooltip(tooltip, x, y);
  tooltip.classList.remove('hidden');
  
  startMonsterDemoAnimation(monsterType, info);
}

function positionTooltip(tooltip, x, y) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left = x + 20;
  let top = y + 20;
  
  if (left + 270 > viewportWidth) left = x - 290;
  if (top + 320 > viewportHeight) top = y - 340;
  
  tooltip.style.left = Math.max(10, left) + 'px';
  tooltip.style.top = Math.max(10, top) + 'px';
}

function hideTooltip() {
  const tooltip = document.getElementById('info-tooltip');
  if (tooltip) tooltip.classList.add('hidden');
  if (tooltipAnimationFrame) {
    cancelAnimationFrame(tooltipAnimationFrame);
    tooltipAnimationFrame = null;
  }
  tooltipAnimationData = null;
}

function startTowerDemoAnimation(towerType, info) {
  if (!tooltipCtx) return;
  
  const fireRates = { basic: 50, sniper: 100, rapid: 15, gold: 60, research: 50, electric: 80 };
  
  tooltipAnimationData = {
    type: 'tower',
    towerType: towerType,
    info: info,
    time: 0,
    monsters: [{ x: 220, y: 50, hp: 100, maxHp: 100 }],
    projectiles: [],
    lastShot: 0,
    fireRate: fireRates[towerType] || 50,
    killCount: 0,
    deathEffects: []
  };
  
  animateTooltipDemo();
}

function startMonsterDemoAnimation(monsterType, info) {
  if (!tooltipCtx) return;
  
  tooltipAnimationData = {
    type: 'monster',
    monsterType: monsterType,
    info: info,
    time: 0,
    monsterX: 220,
    monsterY: 50,
    splitPhase: 0,
    opacity: 1,
    passCount: 0,
    // Propriétés pour le système de tir
    monsterProjectiles: [],
    monsterHitFlash: 0,
    monsterHp: info.hp >= 150 ? 150 : 100,
    monsterMaxHp: info.hp >= 150 ? 150 : 100,
    towerStunned: false,
    stunTimer: 0,
    monsterLastShot: 0,
    monsterDeathEffects: []
  };
  
  animateTooltipDemo();
}

function animateTooltipDemo() {
  if (!tooltipAnimationData || !tooltipCtx) return;
  
  const ctx = tooltipCtx;
  const canvas = tooltipCanvas;
  
  // Fond terrain
  ctx.fillStyle = '#1a3d1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Grille
  ctx.strokeStyle = '#2a4d2a';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < canvas.width; i += 20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
  }
  for (let i = 0; i < canvas.height; i += 20) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
  }
  
  // Chemin
  ctx.fillStyle = '#3d5c3d';
  ctx.fillRect(0, 35, canvas.width, 30);
  ctx.strokeStyle = '#2d4a2d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 35); ctx.lineTo(canvas.width, 35);
  ctx.moveTo(0, 65); ctx.lineTo(canvas.width, 65);
  ctx.stroke();
  
  if (tooltipAnimationData.type === 'tower') {
    animateTowerDemo(ctx);
  } else {
    animateMonsterDemo(ctx);
  }
  
  tooltipAnimationData.time++;
  tooltipAnimationFrame = requestAnimationFrame(animateTooltipDemo);
}

// Dessiner une tour
function drawTower(ctx, type, x, y, scale = 1) {
  const info = TOWER_VISUALS[type];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  if (type === 'basic') {
    ctx.fillStyle = info.baseColor;
    ctx.beginPath(); ctx.arc(0, 3, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.topColor;
    ctx.beginPath(); ctx.arc(0, -6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.cannonColor;
    ctx.fillRect(-3, -12, 6, 10);
  } else if (type === 'sniper') {
    ctx.fillStyle = info.baseColor;
    ctx.fillRect(-10, 6, 20, 6);
    ctx.fillStyle = info.bodyColor;
    ctx.fillRect(-7, -8, 14, 18);
    ctx.fillStyle = info.barrelColor;
    ctx.fillRect(-2, -18, 4, 14);
    ctx.fillStyle = info.scopeColor;
    ctx.beginPath(); ctx.arc(0, -10, 6, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'rapid') {
    ctx.fillStyle = info.baseColor;
    ctx.beginPath(); ctx.arc(0, 5, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.cannonColor;
    ctx.fillRect(-8, -12, 4, 10);
    ctx.fillRect(-2, -14, 4, 10);
    ctx.fillRect(4, -12, 4, 10);
  } else if (type === 'gold') {
    ctx.fillStyle = info.baseColor;
    ctx.beginPath(); ctx.arc(0, 3, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.gemColor;
    ctx.beginPath();
    ctx.arc(-5, -3, 3, 0, Math.PI * 2);
    ctx.arc(5, -3, 3, 0, Math.PI * 2);
    ctx.arc(0, -8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = info.coinColor;
    ctx.beginPath();
    ctx.arc(-6, 2, 2, 0, Math.PI * 2);
    ctx.arc(6, 2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'research') {
    ctx.fillStyle = info.baseColor;
    ctx.beginPath(); ctx.arc(0, 4, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.bodyColor;
    ctx.fillRect(-10, -10, 20, 22);
    ctx.fillStyle = info.windowColor;
    ctx.fillRect(-7, -7, 6, 6);
    ctx.fillRect(1, -7, 6, 6);
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(-12, -10); ctx.lineTo(0, -18); ctx.lineTo(12, -10);
    ctx.fill();
    ctx.fillStyle = info.atomColor;
    ctx.beginPath();
    ctx.arc(-3, 6, 2, 0, Math.PI * 2);
    ctx.arc(3, 6, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'electric') {
    ctx.fillStyle = info.baseColor;
    ctx.beginPath(); ctx.arc(0, 5, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.coilColor;
    ctx.fillRect(-4, -10, 8, 20);
    ctx.fillStyle = info.topColor;
    ctx.beginPath(); ctx.arc(0, -12, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.sparkColor;
    ctx.beginPath();
    ctx.arc(-6, -14, 2, 0, Math.PI * 2);
    ctx.arc(6, -14, 2, 0, Math.PI * 2);
    ctx.arc(0, -18, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// Dessiner un monstre
function drawMonster(ctx, type, x, y, scale = 1, opacity = 1) {
  const info = MONSTER_VISUALS[type];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = opacity;
  
  if (type === 'basic') {
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3, -2, 2, 0, Math.PI * 2);
    ctx.arc(3, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-3, -2, 1, 0, Math.PI * 2);
    ctx.arc(3, -2, 1, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'tank') {
    ctx.fillStyle = info.bodyColor;
    ctx.fillRect(-10, -8, 20, 16);
    ctx.fillStyle = info.armorColor;
    ctx.fillRect(-12, -10, 6, 6);
    ctx.fillRect(6, -10, 6, 6);
    ctx.fillRect(-12, 4, 6, 6);
    ctx.fillRect(6, 4, 6, 6);
  } else if (type === 'fast') {
    ctx.fillStyle = info.tailColor;
    ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.lineTo(-18, -3); ctx.lineTo(-18, 3);
    ctx.fill();
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(5, -1, 2, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'splitter') {
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.blobColor;
    ctx.beginPath();
    ctx.arc(-5, -3, 5, 0, Math.PI * 2);
    ctx.arc(5, -3, 5, 0, Math.PI * 2);
    ctx.arc(-3, 5, 4, 0, Math.PI * 2);
    ctx.arc(3, 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, -1, 2, 0, Math.PI * 2);
    ctx.arc(4, -1, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'buffer') {
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.crossColor;
    ctx.fillRect(-3, -8, 6, 16);
    ctx.fillRect(-8, -3, 16, 6);
    ctx.fillStyle = info.coreColor;
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'stunner') {
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.sparkColor;
    ctx.beginPath();
    ctx.moveTo(-2, -8); ctx.lineTo(2, -2); ctx.lineTo(-1, 0);
    ctx.lineTo(3, 8); ctx.lineTo(-1, 2); ctx.lineTo(1, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-7, -5, 2, 0, Math.PI * 2);
    ctx.arc(7, -5, 2, 0, Math.PI * 2);
    ctx.arc(-5, 6, 2, 0, Math.PI * 2);
    ctx.arc(5, 6, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'invisible') {
    ctx.fillStyle = 'rgba(142, 68, 173, 0.15)';
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(155, 89, 182, 0.25)';
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-4, -2, 2, 0, Math.PI * 2);
    ctx.arc(4, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(-4, -2, 1, 0, Math.PI * 2);
    ctx.arc(4, -2, 1, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'boss') {
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.hornColor;
    ctx.beginPath();
    ctx.moveTo(-10, -12); ctx.lineTo(-6, -18); ctx.lineTo(-12, -6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -12); ctx.lineTo(6, -18); ctx.lineTo(12, -6);
    ctx.fill();
    ctx.fillStyle = info.eyeColor;
    ctx.beginPath();
    ctx.arc(-6, -4, 3, 0, Math.PI * 2);
    ctx.arc(6, -4, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'bigboss') {
    ctx.fillStyle = 'rgba(26, 10, 46, 0.2)';
    ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(74, 44, 122, 0.3)';
    ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.bodyColor;
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.hornColor;
    ctx.beginPath();
    ctx.moveTo(-14, -16); ctx.lineTo(-10, -26); ctx.lineTo(-18, -8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, -16); ctx.lineTo(10, -26); ctx.lineTo(18, -8);
    ctx.fill();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(-8, -6, 4, 0, Math.PI * 2);
    ctx.arc(8, -6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(-8, -6, 2, 0, Math.PI * 2);
    ctx.arc(8, -6, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// Animation de tour (tue les mobs)
function animateTowerDemo(ctx) {
  const data = tooltipAnimationData;
  const towerX = 50;
  const towerY = 25;
  
  // Portée
  ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
  ctx.beginPath();
  ctx.arc(towerX, towerY + 25, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Auras spéciales
  if (data.towerType === 'gold') {
    ctx.fillStyle = `rgba(255, 215, 0, ${0.1 + Math.sin(data.time * 0.1) * 0.05})`;
    ctx.beginPath();
    ctx.arc(towerX, towerY + 25, 50, 0, Math.PI * 2);
    ctx.fill();
  } else if (data.towerType === 'research') {
    ctx.fillStyle = `rgba(52, 152, 219, ${0.1 + Math.sin(data.time * 0.1) * 0.05})`;
    ctx.beginPath();
    ctx.arc(towerX, towerY + 25, 50, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawTower(ctx, data.towerType, towerX, towerY, 0.8);
  
  // Effets de mort et d'impact
  data.deathEffects = data.deathEffects.filter(effect => {
    effect.life--;
    if (effect.type === 'death') {
      // Explosion de mort
      const alpha = effect.life / 25;
      const radius = 20 - effect.life * 0.6;
      ctx.fillStyle = `rgba(255, 80, 80, ${alpha})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      ctx.fill();
      // Particules
      ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + effect.life * 0.2;
        const dist = (25 - effect.life) * 0.8;
        ctx.beginPath();
        ctx.arc(effect.x + Math.cos(angle) * dist, effect.y + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (effect.type === 'hit') {
      // Impact
      const alpha = effect.life / 8;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 12 - effect.life, 0, Math.PI * 2);
      ctx.stroke();
    }
    return effect.life > 0;
  });
  
  // Monstres
  data.monsters.forEach(monster => {
    monster.x -= 0.5;
    
    // Flash quand touché
    if (monster.hitFlash > 0) {
      monster.hitFlash--;
    }
    
    if (monster.x < -20 || monster.hp <= 0) {
      if (monster.hp <= 0) {
        data.killCount++;
        data.deathEffects.push({ x: monster.x, y: monster.y, life: 25, type: 'death' });
      }
      monster.x = 220;
      monster.hp = monster.maxHp;
      monster.hitFlash = 0;
    }
    
    // Effet de flash rouge quand touché
    if (monster.hitFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${monster.hitFlash / 10})`;
      ctx.beginPath();
      ctx.arc(monster.x, monster.y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    
    drawMonster(ctx, 'basic', monster.x, monster.y, 0.7);
    
    // Barre de vie
    const hpPercent = monster.hp / monster.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(monster.x - 12, monster.y - 18, 24, 4);
    ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(monster.x - 12, monster.y - 18, 24 * hpPercent, 4);
  });
  
  // Tir
  if (data.time - data.lastShot > data.fireRate) {
    const target = data.monsters.find(m => m.x < 140 && m.x > 30 && m.hp > 0);
    if (target) {
      data.lastShot = data.time;
      
      if (data.towerType === 'electric') {
        data.projectiles.push({
          type: 'electric',
          targetX: target.x,
          targetY: target.y,
          life: 15,
          monster: target
        });
        target.hp -= 50;
        target.hitFlash = 10;
        data.deathEffects.push({ x: target.x, y: target.y, life: 8, type: 'hit' });
      } else {
        const damage = { sniper: 100, rapid: 20, gold: 35, research: 25, basic: 50 }[data.towerType] || 40;
        data.projectiles.push({
          x: towerX,
          y: towerY + 10,
          targetX: target.x,
          targetY: target.y,
          speed: data.towerType === 'sniper' ? 10 : data.towerType === 'rapid' ? 8 : 6,
          damage: damage,
          monster: target
        });
      }
    }
  }
  
  // Projectiles
  data.projectiles = data.projectiles.filter(proj => {
    if (proj.type === 'electric') {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(towerX, towerY);
      
      for (let i = 1; i <= 4; i++) {
        const t = i / 4;
        const px = towerX + (proj.targetX - towerX) * t;
        const py = towerY + (proj.targetY - towerY) * t;
        ctx.lineTo(px + (Math.random() - 0.5) * 15, py + (Math.random() - 0.5) * 10);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      proj.life--;
      return proj.life > 0;
    } else {
      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 10) {
        proj.monster.hp -= proj.damage;
        proj.monster.hitFlash = 8;
        // Effet d'impact
        data.deathEffects.push({ x: proj.x, y: proj.y, life: 10, type: 'hit' });
        return false;
      }
      
      proj.x += (dx / dist) * proj.speed;
      proj.y += (dy / dist) * proj.speed;
      
      // Traînée du projectile
      ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
      ctx.beginPath();
      ctx.arc(proj.x - (dx / dist) * 5, proj.y - (dy / dist) * 5, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = data.info.projectileColor;
      ctx.shadowColor = data.info.projectileColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, data.towerType === 'sniper' ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      return true;
    }
  });
  
  // Compteur
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 10px Arial';
  ctx.fillText(`💀 ${data.killCount}`, 165, 15);
}

// Animation de monstre (montre les capacités spéciales)
function animateMonsterDemo(ctx) {
  const data = tooltipAnimationData;
  const info = data.info;
  const towerX = 100;
  const towerY = 25;
  
  // Initialiser les projectiles si pas fait
  if (!data.monsterProjectiles) {
    data.monsterProjectiles = [];
    data.monsterHitFlash = 0;
    data.monsterHp = 100;
    data.monsterMaxHp = 100;
    data.towerStunned = false;
    data.stunTimer = 0;
    data.monsterLastShot = 0;
    data.monsterDeathEffects = [];
  }
  
  // Tour (peut être paralysée)
  const towerAlpha = data.towerStunned ? 0.4 : 1;
  drawTower(ctx, 'basic', towerX, towerY, 0.6, towerAlpha);
  
  // Portée de la tour
  ctx.fillStyle = data.towerStunned ? 'rgba(255, 200, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';
  ctx.beginPath();
  ctx.arc(towerX, towerY + 25, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Effet de paralysie sur la tour
  if (data.towerStunned) {
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    const stunRadius = 20 + Math.sin(data.time * 0.3) * 5;
    ctx.beginPath();
    ctx.arc(towerX, towerY + 12, stunRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('⚡ STUN', towerX - 18, towerY - 8);
    
    data.stunTimer--;
    if (data.stunTimer <= 0) {
      data.towerStunned = false;
    }
  }
  
  // Mouvement du monstre
  const speed = data.towerStunned ? info.speed * 1.5 : info.speed; // Plus rapide si tour stun
  data.monsterX -= speed;
  
  // Reset quand le monstre sort
  if (data.monsterX < -30) {
    data.monsterX = 220;
    data.splitPhase = 0;
    data.passCount++;
    data.monsterHp = data.monsterMaxHp;
    data.monsterHitFlash = 0;
  }
  
  // Invisibilité
  if (info.invisible) {
    data.opacity = 0.3 + Math.sin(data.time * 0.15) * 0.2;
  }
  
  // Effets de mort/impact
  data.monsterDeathEffects = data.monsterDeathEffects.filter(effect => {
    effect.life--;
    const alpha = effect.life / 10;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 12 - effect.life, 0, Math.PI * 2);
    ctx.stroke();
    return effect.life > 0;
  });
  
  // Tour tire sur le monstre (si pas stun et monstre visible)
  const canSeeMonster = !info.invisible || data.opacity > 0.4;
  if (!data.towerStunned && canSeeMonster && data.time - data.monsterLastShot > 25) {
    if (data.monsterX < 160 && data.monsterX > 40) {
      data.monsterLastShot = data.time;
      data.monsterProjectiles.push({
        x: towerX,
        y: towerY + 10,
        targetX: data.monsterX,
        targetY: data.monsterY,
        speed: 5,
        damage: 15
      });
    }
  }
  
  // Projectiles de la tour
  data.monsterProjectiles = data.monsterProjectiles.filter(proj => {
    const dx = proj.targetX - proj.x;
    const dy = proj.targetY - proj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 10) {
      // Impact sur le monstre
      data.monsterHp -= proj.damage;
      data.monsterHitFlash = 8;
      data.monsterDeathEffects.push({ x: proj.x, y: proj.y, life: 10 });
      return false;
    }
    
    proj.x += (dx / dist) * proj.speed;
    proj.y += (dy / dist) * proj.speed;
    
    // Traînée
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(proj.x - (dx / dist) * 4, proj.y - (dy / dist) * 4, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Projectile
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    return true;
  });
  
  // Effets spéciaux du monstre
  
  // Buffer - aura de buff
  if (data.monsterType === 'buffer' && data.monsterX < 180) {
    const auraRadius = 30 + Math.sin(data.time * 0.1) * 5;
    ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
    ctx.beginPath();
    ctx.arc(data.monsterX, data.monsterY, auraRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // Stunner - paralyse la tour quand proche
  if (data.monsterType === 'stunner' && data.monsterX < 140 && data.monsterX > 60) {
    if (!data.towerStunned && data.monsterX < 120 && data.monsterX > 80) {
      data.towerStunned = true;
      data.stunTimer = 80; // Stun pendant 80 frames
    }
    // Onde de choc
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    const wavePhase = (data.time % 30) / 30;
    for (let i = 0; i < 2; i++) {
      const wave = ((wavePhase + i * 0.5) % 1);
      ctx.globalAlpha = 1 - wave;
      ctx.beginPath();
      ctx.arc(data.monsterX, data.monsterY, 15 + wave * 40, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  
  // Flash quand touché
  if (data.monsterHitFlash > 0) {
    data.monsterHitFlash--;
    ctx.fillStyle = `rgba(255, 255, 255, ${data.monsterHitFlash / 8})`;
    ctx.beginPath();
    ctx.arc(data.monsterX, data.monsterY, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Split
  if (data.monsterType === 'splitter' && data.monsterX < 30 && data.splitPhase === 0) {
    data.splitPhase = 1;
  }
  
  if (data.splitPhase === 1) {
    drawMonster(ctx, 'basic', data.monsterX, data.monsterY - 12, 0.5);
    drawMonster(ctx, 'basic', data.monsterX, data.monsterY + 12, 0.5);
  } else {
    drawMonster(ctx, data.monsterType, data.monsterX, data.monsterY, 0.8, data.opacity);
  }
  
  // Barre de vie du monstre (si tank ou boss)
  if (info.hp >= 150 || data.monsterType === 'tank' || data.monsterType === 'boss' || data.monsterType === 'bigboss') {
    const hpPercent = Math.max(0, data.monsterHp / data.monsterMaxHp);
    ctx.fillStyle = '#333';
    ctx.fillRect(data.monsterX - 15, data.monsterY - 22, 30, 5);
    ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(data.monsterX - 15, data.monsterY - 22, 30 * hpPercent, 5);
  }
  
  // Bigboss spawn
  if (data.monsterType === 'bigboss' && data.time % 50 === 0 && data.monsterX < 180 && data.monsterX > 50) {
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(data.monsterX + 35, data.monsterY, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Indicateur de passage
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 10px Arial';
  ctx.fillText(`✓ ${data.passCount}`, 5, 15);
}

// Setup des tooltips
function setupTowerButtonTooltips() {
  document.querySelectorAll('.tower-btn[data-tower]').forEach(btn => {
    let hoverTimer = null;
    
    btn.addEventListener('mouseenter', (e) => {
      hoverTimer = setTimeout(() => {
        showTowerTooltip(btn.dataset.tower, e.clientX, e.clientY);
      }, 1000);
    });
    
    btn.addEventListener('mouseleave', () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      hideTooltip();
    });
    
    btn.addEventListener('mousemove', (e) => {
      const tooltip = document.getElementById('info-tooltip');
      if (tooltip && !tooltip.classList.contains('hidden')) {
        positionTooltip(tooltip, e.clientX, e.clientY);
      }
    });
  });
}

function setupMonsterButtonTooltips() {
  document.querySelectorAll('.monster-btn[data-monster]').forEach(btn => {
    let hoverTimer = null;
    
    btn.addEventListener('mouseenter', (e) => {
      hoverTimer = setTimeout(() => {
        showMonsterTooltip(btn.dataset.monster, e.clientX, e.clientY);
      }, 1000);
    });
    
    btn.addEventListener('mouseleave', () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      hideTooltip();
    });
    
    btn.addEventListener('mousemove', (e) => {
      const tooltip = document.getElementById('info-tooltip');
      if (tooltip && !tooltip.classList.contains('hidden')) {
        positionTooltip(tooltip, e.clientX, e.clientY);
      }
    });
  });
}

function setupTooltipSystem() {
  initTooltipSystem();
  setupTowerButtonTooltips();
  setupMonsterButtonTooltips();
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(setupTooltipSystem, 500);
});

window.setupTooltipSystem = setupTooltipSystem;
