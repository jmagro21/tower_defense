// Gestion du chemin et de la grille
let path = [];
let currentMap = CONSTANTS.MAPS.STANDARD; // Map sélectionnée par défaut

function setMap(mapId) {
  currentMap = CONSTANTS.MAPS[mapId.toUpperCase()] || CONSTANTS.MAPS.STANDARD;
  path = [...currentMap.path];
}

function createPath() {
  // La path est définie au démarrage du jeu selon la map choisie
  // Utiliser la map globale sélectionnée (ne pas forcer 'standard')
  setMap(selectedMap || 'standard');
}

function drawPath() {
  const graphics = gameScene.add.graphics();
  
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
    gameScene.add.circle(midX, midY, 3, 0x654321, 0.3);
  }
}

function drawGrid() {
  const graphics = gameScene.add.graphics();
  graphics.lineStyle(1, 0x4a7c1f, 0.15);

  for (let x = 0; x < CONSTANTS.GAME.MAP_WIDTH; x += CONSTANTS.GAME.GRID_SIZE) {
    graphics.lineBetween(x, 0, x, CONSTANTS.GAME.MAP_HEIGHT);
  }

  for (let y = 0; y < CONSTANTS.GAME.MAP_HEIGHT; y += CONSTANTS.GAME.GRID_SIZE) {
    graphics.lineBetween(0, y, CONSTANTS.GAME.MAP_WIDTH, y);
  }
}

function isOnPath(x, y) {
  const pathMargin = 30;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    
    const minX = Math.min(p1.x, p2.x) - pathMargin;
    const maxX = Math.max(p1.x, p2.x) + pathMargin;
    const minY = Math.min(p1.y, p2.y) - pathMargin;
    const maxY = Math.max(p1.y, p2.y) + pathMargin;
    
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      return true;
    }
  }
  return false;
}
