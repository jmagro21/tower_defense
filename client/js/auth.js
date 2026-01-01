// Gestion de l'authentification
let token = null;  // Plus besoin de localStorage, le cookie est HTTP-only
let currentUser = null;

async function register() {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  if (!username || !password) {
    showAuthError('Veuillez remplir tous les champs');
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      showScreen('lobby-screen');
      updateUserDisplay();
      initSocket();
    } else {
      showAuthError(data.error || 'Erreur lors de l\'inscription');
    }
  } catch (error) {
    showAuthError('Erreur de connexion au serveur');
  }
}

async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    showAuthError('Veuillez remplir tous les champs');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      showScreen('lobby-screen');
      updateUserDisplay();
      initSocket();
    } else {
      showAuthError(data.error || 'Identifiants incorrects');
    }
  } catch (error) {
    showAuthError('Erreur de connexion au serveur');
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentRoom');
  localStorage.removeItem('gameState');
  currentUser = null;
  if (socket) {
    socket.disconnect();
  }
  showScreen('auth-screen');
}

function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
  hideAuthError();
}

function showLogin() {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  hideAuthError();
}

function showAuthError(message) {
  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

function hideAuthError() {
  const errorEl = document.getElementById('auth-error');
  errorEl.classList.remove('show');
}

function updateUserDisplay() {
  if (currentUser) {
    document.getElementById('username-display').textContent = `👤 ${currentUser.username}`;
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function showToast(message, type = 'info') {
  // Créer le conteneur toast s'il n'existe pas
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(toastContainer);
  }

  // Créer l'élément toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 15px 20px;
    margin: 10px 0;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-in;
  `;
  
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Retirer après 3 secondes
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
