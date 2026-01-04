// Gestion du chemin et de la grille
let path = [];
let currentMap = CONSTANTS.MAPS.STANDARD; // Map sélectionnée par défaut
let pathCells = new Set(); // Cases occupées par le chemin
let towerCells = new Set(); // Cases occupées par des tours

function setMap(mapId) {
  // Valeur par défaut si mapId n'est pas fourni
  if (!mapId) {
    mapId = 'standard';
  }
  currentMap = CONSTANTS.MAPS[mapId.toUpperCase()] || CONSTANTS.MAPS.STANDARD;
  path = [...currentMap.path];
}

// Convertir coordonnées en position de case (grille)
function snapToGrid(x, y) {
  const gridSize = CONSTANTS.GAME.GRID_SIZE;
  const cellX = Math.floor(x / gridSize) * gridSize + gridSize / 2;
  const cellY = Math.floor(y / gridSize) * gridSize + gridSize / 2;
  return { x: cellX, y: cellY };
}

// Obtenir la clé unique d'une case
function getCellKey(x, y) {
  const snapped = snapToGrid(x, y);
  return `${snapped.x},${snapped.y}`;
}

function createPath() {
  // La path est définie au démarrage du jeu selon la map choisie
  // Utiliser la map globale sélectionnée (ne pas forcer 'standard')
  setMap(window.selectedMap || 'standard');
  
  // Calculer les cases occupées par le chemin
  calculatePathCells();
}

// Calculer toutes les cases occupées par le chemin
function calculatePathCells() {
  pathCells.clear();
  const gridSize = CONSTANTS.GAME.GRID_SIZE;
  const halfGrid = gridSize / 2;
  const pathWidth = 26; // Demi-largeur du chemin (légèrement plus que la moitié visuelle)
  
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    
    // Parcourir tous les points du segment avec des petits pas
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / 10); // Pas de 10 pixels pour plus de précision
    
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const x = p1.x + dx * t;
      const y = p1.y + dy * t;
      
      // Trouver la case qui contient ce point
      const cellX = Math.floor(x / gridSize) * gridSize + halfGrid;
      const cellY = Math.floor(y / gridSize) * gridSize + halfGrid;
      
      // Ajouter la case principale
      pathCells.add(`${cellX},${cellY}`);
      
      // Ajouter les cases adjacentes si le chemin les touche
      // Vérifier les 8 cases adjacentes
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          if (ox === 0 && oy === 0) continue;
          
          const adjCellX = cellX + ox * gridSize;
          const adjCellY = cellY + oy * gridSize;
          
          // Calculer la distance du centre de la case adjacente au point du chemin
          const distX = Math.abs(adjCellX - x);
          const distY = Math.abs(adjCellY - y);
          
          // Si le chemin passe assez près du centre de la case adjacente
          if (distX <= halfGrid + pathWidth && distY <= halfGrid + pathWidth) {
            pathCells.add(`${adjCellX},${adjCellY}`);
          }
        }
      }
    }
  }
}

function drawPath(scene) {
  const graphics = scene.add.graphics();
  
  graphics.lineStyle(52, 0x654321, 1);
  graphics.beginPath();
  graphics.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) graphics.lineTo(path[i].x, path[i].y);
  graphics.strokePath();

  graphics.lineStyle(45, 0xa89968, 1);
  graphics.beginPath();
  graphics.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) graphics.lineTo(path[i].x, path[i].y);
  graphics.strokePath();

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    scene.add.circle(midX, midY, 3, 0x654321, 0.3);
  }
}

function drawGrid(scene) {
  const graphics = scene.add.graphics();
  const gridSize = CONSTANTS.GAME.GRID_SIZE;
  
  // Dessiner les cases
  for (let x = 0; x < CONSTANTS.GAME.MAP_WIDTH; x += gridSize) {
    for (let y = 0; y < CONSTANTS.GAME.MAP_HEIGHT; y += gridSize) {
      const cellKey = getCellKey(x + gridSize / 2, y + gridSize / 2);
      
      if (pathCells.has(cellKey)) {
        // Cases du chemin - rouge transparent
        graphics.fillStyle(0xff0000, 0.05);
        graphics.fillRect(x, y, gridSize, gridSize);
      } else {
        // Cases disponibles - vert très transparent
        graphics.fillStyle(0x00ff00, 0.02);
        graphics.fillRect(x, y, gridSize, gridSize);
      }
      
      // Contour des cases
      graphics.lineStyle(1, 0x4a7c1f, 0.15);
      graphics.strokeRect(x, y, gridSize, gridSize);
    }
  }
}

function isOnPath(x, y) {
  const cellKey = getCellKey(x, y);
  return pathCells.has(cellKey);
}

function isCellOccupied(x, y) {
  const cellKey = getCellKey(x, y);
  return towerCells.has(cellKey);
}

function occupyCell(x, y) {
  const cellKey = getCellKey(x, y);
  towerCells.add(cellKey);
}

function freeCell(x, y) {
  const cellKey = getCellKey(x, y);
  towerCells.delete(cellKey);
}
