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
      
      const gameState = localStorage.getItem('gameState');
      const currentRoom = localStorage.getItem('currentRoom');
      
      if (gameState === 'playing' && currentRoom) {
        // Ne pas effacer l'état - tenter la reconnexion via le socket
        // Le serveur vérifiera si la partie est toujours en cours
        // et enverra l'événement RECONNECTED si c'est le cas
        showScreen('lobby-screen');
      } else {
        showScreen('lobby-screen');
      }
      
      updateUserDisplay();
      initSocket();
    } else {
      throw new Error('Utilisateur non trouvé');
    }
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

  // Empêcher les clics sur le menu d'amélioration de passer à travers
  const towerMenu = document.getElementById('tower-menu');
  if (towerMenu) {
    towerMenu.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    towerMenu.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
  }

  // Même chose pour le modal de recherche
  const researchModal = document.getElementById('research-modal');
  if (researchModal) {
    researchModal.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    researchModal.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
  }

  // Pour le modal de gestion des tours, empêcher la propagation seulement sur le fond
  const towersModal = document.getElementById('towers-modal');
  if (towersModal) {
    towersModal.addEventListener('mousedown', (e) => {
      // Ne bloquer que si on clique sur le fond du modal, pas sur son contenu
      if (e.target === towersModal) {
        e.stopPropagation();
      }
    });
    towersModal.addEventListener('pointerdown', (e) => {
      // Ne bloquer que si on clique sur le fond du modal, pas sur son contenu
      if (e.target === towersModal) {
        e.stopPropagation();
      }
    });
  }
});
