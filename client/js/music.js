// Gestion de la musique du jeu
let backgroundMusic = null;
let musicVolume = 0.5; // Volume par défaut à 50%
let isMusicMuted = false;

// Initialiser la musique
function initMusic() {
  // Charger les préférences sauvegardées
  const savedVolume = localStorage.getItem('musicVolume');
  const savedMuted = localStorage.getItem('musicMuted');
  
  if (savedVolume !== null) {
    musicVolume = parseFloat(savedVolume);
  }
  if (savedMuted !== null) {
    isMusicMuted = savedMuted === 'true';
  }
  
  // Créer l'élément audio
  backgroundMusic = document.getElementById('background-music');
  if (backgroundMusic) {
    backgroundMusic.loop = true;
    backgroundMusic.volume = isMusicMuted ? 0 : musicVolume;
    
    // Démarrer la musique au premier clic de l'utilisateur (restriction navigateur)
    const startMusic = () => {
      if (backgroundMusic && backgroundMusic.paused) {
        backgroundMusic.play().catch(e => console.log('Lecture audio bloquée:', e));
      }
      document.removeEventListener('click', startMusic);
    };
    document.addEventListener('click', startMusic);
  }
  
  // Mettre à jour les contrôles UI
  updateMusicControls();
}

// Jouer la musique
function playMusic() {
  if (backgroundMusic && backgroundMusic.paused) {
    backgroundMusic.play().catch(e => console.log('Erreur lecture audio:', e));
  }
}

// Mettre en pause la musique
function pauseMusic() {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
  }
}

// Changer le volume
function setMusicVolume(volume) {
  musicVolume = Math.max(0, Math.min(1, volume));
  if (backgroundMusic) {
    backgroundMusic.volume = isMusicMuted ? 0 : musicVolume;
  }
  localStorage.setItem('musicVolume', musicVolume);
  updateMusicControls();
}

// Toggle mute
function toggleMusicMute() {
  isMusicMuted = !isMusicMuted;
  if (backgroundMusic) {
    backgroundMusic.volume = isMusicMuted ? 0 : musicVolume;
  }
  localStorage.setItem('musicMuted', isMusicMuted);
  updateMusicControls();
}

// Mettre à jour les contrôles UI
function updateMusicControls() {
  // Contrôles lobby
  const volumeSlider = document.getElementById('music-volume-slider');
  const volumeValue = document.getElementById('music-volume-value');
  const muteBtn = document.getElementById('music-mute-btn');
  
  // Contrôles en jeu
  const volumeSliderGame = document.getElementById('music-volume-slider-game');
  const muteBtnGame = document.getElementById('music-mute-btn-game');
  
  // Mettre à jour les sliders
  if (volumeSlider) {
    volumeSlider.value = musicVolume;
  }
  if (volumeSliderGame) {
    volumeSliderGame.value = musicVolume;
  }
  
  // Mettre à jour l'affichage du volume
  if (volumeValue) {
    volumeValue.textContent = `${Math.round(musicVolume * 100)}%`;
  }
  
  // Mettre à jour les boutons mute
  if (muteBtn) {
    muteBtn.textContent = isMusicMuted ? '🔇 Réactiver' : '🔊 Couper';
    muteBtn.classList.toggle('muted', isMusicMuted);
  }
  if (muteBtnGame) {
    muteBtnGame.textContent = isMusicMuted ? '🔇' : '🔊';
    muteBtnGame.classList.toggle('muted', isMusicMuted);
  }
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  initMusic();
});
