// Gestion des événements tactiles pour mobile
// Ce fichier corrige les problèmes de touch sur iOS/Android en mode portrait

(function() {
  'use strict';
  
  // Détecter si on est sur mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isPortrait = () => window.innerHeight > window.innerWidth;
  
  // Fonction pour initialiser les événements tactiles
  function initTouchEvents() {
    console.log('[Mobile] Initialisation des événements tactiles...');
    console.log('[Mobile] Est mobile:', isMobile);
    console.log('[Mobile] Est portrait:', isPortrait());
    
    // Récupérer tous les boutons interactifs
    const towerButtons = document.querySelectorAll('.tower-btn');
    const monsterButtons = document.querySelectorAll('.monster-btn');
    const allButtons = document.querySelectorAll('button');
    
    // Ajouter des écouteurs tactiles aux boutons de tour
    towerButtons.forEach(btn => {
      addTouchHandler(btn, (e) => {
        const title = btn.getAttribute('title') || '';
        // Extraire le type de tour depuis le title ou data attribute
        let towerType = '';
        if (title.includes('Basique')) towerType = 'basic';
        else if (title.includes('Sniper')) towerType = 'sniper';
        else if (title.includes('Rapide')) towerType = 'rapid';
        else if (title.includes('Dorée')) towerType = 'gold';
        else if (title.includes('Laboratoire')) towerType = 'research';
        
        if (towerType && typeof selectTower === 'function') {
          console.log('[Mobile] Tour sélectionnée:', towerType);
          selectTower(towerType, e);
        }
      });
    });
    
    // Ajouter des écouteurs tactiles aux boutons de monstre
    monsterButtons.forEach(btn => {
      addTouchHandler(btn, (e) => {
        const title = btn.getAttribute('title') || '';
        // Extraire le type de monstre depuis le title
        let monsterType = '';
        if (title.includes('Basique')) monsterType = 'basic';
        else if (title.includes('Rapide')) monsterType = 'fast';
        else if (title.includes('Tank')) monsterType = 'tank';
        else if (title.includes('Diviseur')) monsterType = 'splitter';
        else if (title.includes('Soigneur')) monsterType = 'buffer';
        else if (title.includes('Paralyseur')) monsterType = 'stunner';
        else if (title.includes('Fantôme')) monsterType = 'invisible';
        else if (title.includes('Titan')) monsterType = 'bigboss';
        else if (title.includes('Boss')) monsterType = 'boss';
        
        if (monsterType && typeof sendMonster === 'function') {
          console.log('[Mobile] Monstre envoyé:', monsterType);
          sendMonster(monsterType);
        }
      });
    });
    
    // S'assurer que tous les boutons ont des gestionnaires tactiles fonctionnels
    allButtons.forEach(btn => {
      // Empêcher le délai de 300ms sur iOS
      btn.style.touchAction = 'manipulation';
      
      // Ajouter un feedback visuel pour les touches
      btn.addEventListener('touchstart', function(e) {
        this.classList.add('touch-active');
      }, { passive: true });
      
      btn.addEventListener('touchend', function(e) {
        this.classList.remove('touch-active');
      }, { passive: true });
      
      btn.addEventListener('touchcancel', function(e) {
        this.classList.remove('touch-active');
      }, { passive: true });
    });
    
    // Empêcher le zoom sur double-tap pour les éléments interactifs
    document.addEventListener('dblclick', function(e) {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        e.preventDefault();
      }
    });
    
    console.log('[Mobile] Événements tactiles initialisés');
    console.log('[Mobile] Tours trouvées:', towerButtons.length);
    console.log('[Mobile] Monstres trouvés:', monsterButtons.length);
  }
  
  // Fonction utilitaire pour ajouter un gestionnaire tactile
  function addTouchHandler(element, callback) {
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    
    element.addEventListener('touchstart', function(e) {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    element.addEventListener('touchend', function(e) {
      const touchDuration = Date.now() - touchStartTime;
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);
      
      // Vérifier que c'est un tap court et pas un swipe
      if (touchDuration < 500 && deltaX < 30 && deltaY < 30) {
        // Empêcher le clic fantôme qui suit le touchend
        e.preventDefault();
        callback(e);
      }
    }, { passive: false });
  }
  
  // Initialiser quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTouchEvents);
  } else {
    initTouchEvents();
  }
  
  // Ré-initialiser après le chargement complet (pour les éléments dynamiques)
  window.addEventListener('load', function() {
    setTimeout(initTouchEvents, 500);
  });
  
  // Exposer une fonction pour ré-initialiser (utile après le rendu dynamique)
  window.reinitMobileTouch = initTouchEvents;
  
})();
