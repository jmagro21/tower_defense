// Fonction partagée pour calculer le coût d'amélioration d'une tour
// Utilisable côté client et serveur

/**
 * Calcule le coût d'amélioration d'une tour selon son niveau actuel et sa config de base
 * @param {number} baseUpgradeCost - coût de base de l'amélioration (ex: towerConfig.upgradeCost)
 * @param {number} currentLevel - niveau actuel de la tour (>=1)
 * @returns {number} coût d'amélioration
 */
function getTowerUpgradeCost(baseUpgradeCost, currentLevel) {
  // Prix x2 tous les 5 niveaux par rapport au prix précédent
  const multiplier = Math.pow(2, Math.floor(currentLevel / 5));
  return baseUpgradeCost * multiplier;
}

module.exports = { getTowerUpgradeCost };