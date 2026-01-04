// Fonction partagée pour calculer le coût d'amélioration d'une tour côté client
// (importée dynamiquement depuis shared/upgradeUtils.js)

/**
 * Calcule le coût d'amélioration d'une tour selon son niveau actuel et sa config de base
 * @param {number} baseUpgradeCost - coût de base de l'amélioration (ex: towerConfig.upgradeCost)
 * @param {number} currentLevel - niveau actuel de la tour (>=1)
 * @returns {number} coût d'amélioration
 */
export function getTowerUpgradeCost(baseUpgradeCost, currentLevel) {
  const multiplier = Math.pow(2, Math.floor(currentLevel / 5));
  return baseUpgradeCost * multiplier;
}
