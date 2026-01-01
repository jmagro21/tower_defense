// Initialisation de l'application
window.addEventListener('DOMContentLoaded', () => {
  // Vérifier si l'utilisateur est déjà connecté (via le cookie)
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }
  
  // Vérifier la validité du cookie token (si l'utilisateur était connecté)
  fetch('/api/auth/verify', {
    method: 'GET',
    credentials: 'include'  // Important: envoyer les cookies
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Token invalide');
    }
  }).then(data => {
    if (data.user) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    
    const gameState = localStorage.getItem('gameState');
    const currentRoom = localStorage.getItem('currentRoom');
    
    if (gameState === 'playing' && currentRoom) {
      // Réinitialiser vers le lobby si la partie est terminée
      localStorage.removeItem('gameState');
      localStorage.removeItem('currentRoom');
      showScreen('lobby-screen');
    } else {
      showScreen('lobby-screen');
    }
    
    updateUserDisplay();
    initSocket();
  }).catch(() => {
    localStorage.clear();
    currentUser = null;
    showScreen('auth-screen');
  });

  // Gestion de la touche Entrée pour les formulaires
  document.getElementById('login-username').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });

  document.getElementById('login-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });

  document.getElementById('register-username').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') register();
  });

  document.getElementById('register-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') register();
  });

  document.getElementById('room-code-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
  });

  // Auto-formatage du code de salon
  document.getElementById('room-code-input').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });
});
