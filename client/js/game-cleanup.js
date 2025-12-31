// Nettoyage et fin de partie
function returnToLobby() {
  const modal = document.getElementById('game-over-modal');
  modal.classList.add('hidden');
  
  if (game) {
    try {
      game.destroy(true, false);
    } catch (e) {
      console.error('Erreur destruction Phaser:', e);
    }
    game = null;
  }
  
  gameScene = null;
  towers = [];
  monsters = [];
  path = [];
  
  playerMoney = 500;
  playerHealth = 0;
  playerKills = 0;
  gameTime = 0;
  spawnUnitCapacity = 0;
  maxSpawnUnits = 5;
  monsterLevel = 1;
  monsterHealthMultiplier = 1;
  rewardMultiplier = 1;
  selectedTowerType = null;
  
  localStorage.removeItem('gameState');
  localStorage.removeItem('currentRoom');
  localStorage.removeItem('isHost');
  
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.innerHTML = '';
  }
  
  window.location.reload();
}

function quitGame() {
  if (confirm('Voulez-vous vraiment quitter la partie ?')) {
    if (socket) {
      socket.emit(CONSTANTS.SOCKET_EVENTS.LEAVE_ROOM);
    }
    
    if (game) {
      try {
        game.destroy(true, false);
      } catch (e) {
        console.error('Erreur destruction Phaser:', e);
      }
      game = null;
    }
    
    gameScene = null;
    towers = [];
    monsters = [];
    
    localStorage.removeItem('gameState');
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('isHost');
    
    window.location.reload();
  }
}
