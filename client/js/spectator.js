// Système de spectateur - Observer la map d'un autre joueur
let spectatingPlayer = null;
let spectatorCanvas = null;
let spectatorCtx = null;
let spectatorInterval = null;
let spectatorData = null;

// Couleurs des tours
const TOWER_COLORS = {
  basic: '#3498db',
  sniper: '#e74c3c',
  rapid: '#f1c40f',
  gold: '#f39c12',
  research: '#2ecc71',
  electric: '#00ffff'
};

// Couleurs des monstres
const MONSTER_COLORS = {
  basic: '#e74c3c',
  tank: '#7f8c8d',
  fast: '#f39c12',
  splitter: '#9b59b6',
  buffer: '#2ecc71',
  stunner: '#f1c40f',
  invisible: '#95a5a6',
  boss: '#c0392b',
  bigboss: '#8e44ad'
};

function spectatePlayer(username) {
  if (!username || username === currentUser?.username) return;
  
  spectatingPlayer = username;
  
  // Afficher le modal
  const modal = document.getElementById('spectator-modal');
  if (!modal) {
    createSpectatorModal();
  }
  
  document.getElementById('spectator-modal').classList.remove('hidden');
  document.getElementById('spectator-player-name').textContent = username;
  
  // Initialiser le canvas
  spectatorCanvas = document.getElementById('spectator-canvas');
  spectatorCtx = spectatorCanvas.getContext('2d');
  
  // Demander les données au serveur
  if (socket) {
    socket.emit('spectatePlayer', { username: username });
  }
  
  // Démarrer la mise à jour périodique (toutes les 500ms)
  if (spectatorInterval) clearInterval(spectatorInterval);
  spectatorInterval = setInterval(() => {
    if (socket && spectatingPlayer) {
      socket.emit('spectatePlayer', { username: spectatingPlayer });
    }
  }, 500);
  
  showToast(`👁️ Observation de ${username}...`, 'info');
}

function createSpectatorModal() {
  const modal = document.createElement('div');
  modal.id = 'spectator-modal';
  modal.className = 'modal-overlay hidden';
  modal.innerHTML = `
    <div class="spectator-modal-content">
      <div class="spectator-header">
        <h2>👁️ Observation: <span id="spectator-player-name"></span></h2>
        <button class="btn-close" onclick="closeSpectator()">✕</button>
      </div>
      <div class="spectator-body">
        <canvas id="spectator-canvas" width="440" height="340"></canvas>
        <div class="spectator-stats">
          <span id="spectator-towers">🏰 Tours: 0</span>
          <span id="spectator-monsters">👾 Monstres: 0</span>
          <span id="spectator-health">❤️ Vie: 0</span>
        </div>
      </div>
      <div class="spectator-legend">
        <span class="legend-item"><span class="legend-color" style="background:#3498db"></span> Basique</span>
        <span class="legend-item"><span class="legend-color" style="background:#e74c3c"></span> Sniper</span>
        <span class="legend-item"><span class="legend-color" style="background:#f1c40f"></span> Rapide</span>
        <span class="legend-item"><span class="legend-color" style="background:#f39c12"></span> Dorée</span>
        <span class="legend-item"><span class="legend-color" style="background:#2ecc71"></span> Labo</span>
        <span class="legend-item"><span class="legend-color" style="background:#00ffff"></span> Électrique</span>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeSpectator() {
  spectatingPlayer = null;
  spectatorData = null;
  
  if (spectatorInterval) {
    clearInterval(spectatorInterval);
    spectatorInterval = null;
  }
  
  const modal = document.getElementById('spectator-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  
  // Informer le serveur qu'on arrête d'observer
  if (socket) {
    socket.emit('stopSpectating');
  }
}

function updateSpectatorView(data) {
  if (!data || !spectatorCtx || !spectatingPlayer) return;
  
  spectatorData = data;
  
  const ctx = spectatorCtx;
  const canvas = spectatorCanvas;
  const scaleX = canvas.width / 880;
  const scaleY = canvas.height / 680;
  
  // Fond
  ctx.fillStyle = '#1a3d1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Grille
  ctx.strokeStyle = '#2a4d2a';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < canvas.width; i += 20 * scaleX) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < canvas.height; i += 20 * scaleY) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
  
  // Chemin
  if (data.path && data.path.length > 0) {
    ctx.fillStyle = '#3d5c3d';
    data.path.forEach(point => {
      ctx.fillRect(
        (point.x - 20) * scaleX,
        (point.y - 20) * scaleY,
        40 * scaleX,
        40 * scaleY
      );
    });
  }
  
  // Tours
  if (data.towers && data.towers.length > 0) {
    data.towers.forEach(tower => {
      const x = tower.x * scaleX;
      const y = tower.y * scaleY;
      const color = TOWER_COLORS[tower.type] || '#3498db';
      
      // Tour (sans cercle de portée car les tailles ne sont pas correctes)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Niveau
      if (tower.level > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(tower.level, x, y + 3);
      }
    });
  }
  
  // Monstres
  if (data.monsters && data.monsters.length > 0) {
    data.monsters.forEach(monster => {
      const x = monster.x * scaleX;
      const y = monster.y * scaleY;
      const color = MONSTER_COLORS[monster.type] || '#e74c3c';
      const size = monster.type === 'boss' ? 8 : monster.type === 'bigboss' ? 12 : 5;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Contour pour les boss
      if (monster.type === 'boss' || monster.type === 'bigboss') {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }
  
  // Mettre à jour les stats
  document.getElementById('spectator-towers').textContent = `🏰 Tours: ${data.towers?.length || 0}`;
  document.getElementById('spectator-monsters').textContent = `👾 Monstres: ${data.monsters?.length || 0}`;
  document.getElementById('spectator-health').textContent = `❤️ Vie: ${CONSTANTS.GAME.MONSTER_PASS_LIMIT - (data.health || 0)}`;
}

// Écouter les données du serveur
function setupSpectatorSocket() {
  if (!socket) return;
  
  socket.on('spectatorData', (data) => {
    if (data && data.username === spectatingPlayer) {
      updateSpectatorView(data);
    }
  });
  
  socket.on('playerEliminated', (data) => {
    if (data.username === spectatingPlayer) {
      showToast(`💀 ${spectatingPlayer} a été éliminé !`, 'warning');
    }
  });
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
  // Créer le modal au démarrage
  setTimeout(() => {
    createSpectatorModal();
    setupSpectatorSocket();
  }, 1000);
});
