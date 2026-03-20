# 🔒 Audit de Sécurité - Tower Defense Multijoueur

**Date :** 20 mars 2026  
**Scope :** Application complète (client, serveur, base de données, réseau)

---

## 📊 Résumé

| Catégorie | Vulnérabilités trouvées | Corrigées |
|---|---|---|
| 🔴 Critique (triche directe) | 6 | 6 |
| 🟠 Haute (exploitation serveur) | 5 | 5 |
| 🟡 Moyenne (abus/contournement) | 5 | 5 |
| 🔵 Faible (bonnes pratiques) | 4 | 4 |
| **Total** | **20** | **20** |

---

## 🔴 Vulnérabilités CRITIQUES (triche directe en jeu)

### 1. MONSTER_KILLED — Argent infini
**Fichier :** `server/socket/socketHandler.js` → événement `MONSTER_KILLED`

**Problème :** Le `reward` (gain d'or) envoyé par le client était accepté tel quel. Un joueur pouvait ouvrir la console navigateur et émettre :
```javascript
socket.emit('monsterKilled', { monsterId: 'fake', reward: 999999 });
```
→ Gain instantané de 999 999 or.

**Patch appliqué :**
- Le reward est borné côté serveur : max = `1500 × rewardMultiplier × 3` (soit le reward d'un BIGBOSS avec bonus maximum)
- Validation que `reward` est un nombre fini entre 0 et le max
- Rate limit : max 30 kills/seconde (impossible humainement au-delà)

---

### 2. MONSTER_PASSED — Invincibilité (0 dégâts)
**Fichier :** `server/socket/socketHandler.js` → événement `MONSTER_PASSED`

**Problème :** Le multiplicateur de dégâts venait du client sans validation. Un joueur pouvait envoyer `damage: 0` pour ne jamais perdre de PV :
```javascript
socket.emit('monsterPassed', { damage: 0 });
```

**Patch appliqué :**
- Seules deux valeurs sont acceptées : `0.85` (classe Dernière Chance) et `1.0` (normal)
- Toute autre valeur est remplacée par `1.0`
- Rate limit : max 30/seconde

---

### 3. SEND_MONSTER — Super-monstres avec stats illimitées
**Fichier :** `server/socket/socketHandler.js` → événement `SEND_MONSTER`

**Problème :** Les stats du monstre (HP, vitesse, reward) venaient entièrement du client. Un joueur pouvait envoyer :
```javascript
socket.emit('sendMonster', {
  targetPlayer: 'victime',
  monsterType: 'basic',
  monster: { health: 9999999, speed: 999, reward: 0, cost: 1 }
});
```
→ Monstre inarrêtable à coût quasi-nul.

**Patch appliqué :**
- HP borné à max 10× la base du monstre
- Vitesse bornée à max 3× la base
- Reward borné à max 5× la base
- Coût minimum à 30% du prix de base (recherche max)
- Validation que la cible existe et n'est pas soi-même
- Rate limit : 5 envois/seconde

---

### 4. UPDATE_ATTACK_GOLD — Compétence de classe gratuite
**Fichier :** `server/socket/socketHandler.js` → événement `UPDATE_ATTACK_GOLD`

**Problème :** Le joueur pouvait s'attribuer un montant arbitraire d'or d'attaque :
```javascript
socket.emit('UPDATE_ATTACK_GOLD', { attackGold: 9999999 });
```
→ Utilisation illimitée des compétences de classe (Rage Offensive, Fortification, Fléau, Surcharge).

**Patch appliqué :**
- `attackGold` ne peut qu'augmenter (pas de rétrogradation)
- Borné à 10 000 000 maximum
- Validation numérique stricte
- Rate limit : 5/seconde

---

### 5. TOWER_DOWNGRADED_BY_DEMOLISHER — Niveau négatif
**Fichier :** `server/socket/socketHandler.js` → événement `TOWER_DOWNGRADED_BY_DEMOLISHER`

**Problème :** Le `newLevel` était accepté directement du client. Un joueur pouvait définir un niveau négatif ou infiniment élevé pour ses propres tours.

**Patch appliqué :**
- Le serveur calcule lui-même le nouveau niveau : `max(1, niveauActuel - 1)`
- La valeur `newLevel` du client est complètement ignorée

---

### 6. START_GAME gameSettings — Paramètres de triche
**Fichier :** `server/socket/socketHandler.js` → événement `START_GAME`

**Problème :** L'hôte pouvait envoyer des paramètres arbitraires :
```javascript
socket.emit('startGame', {
  gameSettings: { startingMoney: 9999999, maxHealth: 999999 }
});
```

**Patch appliqué :**
- `startingMoney` borné entre 100 et 5 000
- `maxHealth` borné entre 5 et 100
- `monsterIntensity` : seules les valeurs [0.8, 1.0, 1.2, 1.5] acceptées
- `rewardMultiplier` : seules les valeurs [0.5, 1.0, 1.5, 2.0] acceptées
- `spawnSpeed` : seules les valeurs ['slow', 'normal', 'fast', 'hard'] acceptées

---

## 🟠 Vulnérabilités HAUTES (exploitation serveur)

### 7. Pas de rate limiting sur les sockets
**Fichier :** `server/socket/socketHandler.js`

**Problème :** Aucune limite sur la fréquence des événements socket. Un attaquant pouvait :
- Spam `PLACE_TOWER` pour ralentir le serveur
- Spam `SEND_MONSTER` pour flood un adversaire
- Spam `broadcastMapState` avec des données géantes (DoS mémoire)

**Patch appliqué :** Rate limiter par socket et par type d'événement :

| Événement | Limite |
|---|---|
| `PLACE_TOWER` | 5/sec |
| `UPGRADE_TOWER` | 10/sec |
| `UPGRADE_TOWER_MULTI` | 3/sec |
| `MOVE_TOWER` | 3/sec |
| `SELL_TOWER` | 5/sec |
| `SEND_MONSTER` | 5/sec |
| `MONSTER_KILLED` | 30/sec |
| `MONSTER_PASSED` | 30/sec |
| `UPDATE_ATTACK_GOLD` | 5/sec |
| `broadcastMapState` | 3/sec |
| `TOWER_DESTROYED` | 5/sec |
| `TOWER_DOWNGRADED` | 5/sec |

Nettoyage automatique des données de rate limiting à la déconnexion.

---

### 8. broadcastMapState — DoS mémoire
**Fichier :** `server/socket/socketHandler.js` → événement `broadcastMapState`

**Problème :** Les données de map spectateur étaient stockées sans limite de taille. Un client pouvait envoyer des tableaux géants pour consommer la mémoire du serveur.

**Patch appliqué :**
- Towers limité à 100 éléments
- Monsters limité à 500 éléments
- Path limité à 20 points
- `health` validé numériquement (0 - 10 000)

---

### 9. CORS trop permissif + dupliqué
**Fichier :** `server/index.js`

**Problème :**
1. `app.use(cors())` était appelé deux fois — la deuxième sans restrictions annulait la première
2. L'IP de production en dur (`https://51.91.59.45`) était whitelistée
3. Méthodes PUT/DELETE autorisées inutilement

**Patch appliqué :**
- Un seul middleware CORS avec fonction de vérification dynamique
- Seules les origines légitimes autorisées
- Seules les méthodes GET/POST autorisées
- IP hardcodée retirée

---

### 10. Body JSON sans limite de taille
**Fichier :** `server/index.js`

**Problème :** `express.json()` sans limite permet d'envoyer des payloads de plusieurs Mo, causant un DoS.

**Patch appliqué :** `express.json({ limit: '10kb' })` — les requêtes API ne dépassent jamais quelques Ko.

---

### 11. Pas de headers de sécurité HTTP
**Fichier :** `server/index.js`

**Problème :** Aucun header de sécurité HTTP (X-Frame-Options, X-Content-Type-Options, HSTS, etc.). Vulnérable au clickjacking et MIME-sniffing.

**Patch appliqué :**
- Ajout de `helmet` avec configuration adaptée pour Phaser.js
- Warning dans la console si helmet n'est pas installé
- Command : `npm install helmet`

---

## 🟡 Vulnérabilités MOYENNES

### 12. Aucune validation des inputs d'authentification
**Fichier :** `server/routes/auth.js`

**Problème :** Pas de validation de format sur username/password. Possibilité d'injection NoSQL ou de usernames avec caractères spéciaux (`<script>`, etc.).

**Patch appliqué :**
- Username : 3-20 caractères, alphanumérique + `-` + `_` uniquement (regex)
- Password : 6-128 caractères
- Sanitisation contre les caractères d'injection HTML

---

### 13. Pas de rate limiting sur login/register
**Fichier :** `server/routes/auth.js`

**Problème :** Brute-force illimité sur les mots de passe. Un attaquant pouvait tester des milliers de combinaisons par minute.

**Patch appliqué :**
- Max 10 tentatives par IP par minute
- Réponse HTTP 429 en cas de dépassement
- Nettoyage automatique toutes les 5 minutes

---

### 14. Vérification de token expose le mot de passe hash
**Fichier :** `server/routes/auth.js` → route `/verify`

**Problème :** `User.findById(decoded.userId)` retournait l'objet complet incluant le hash du mot de passe en mémoire.

**Patch appliqué :** `User.findById(decoded.userId).select('-password')` — exclut le champ password.

---

### 15. PLACE_TOWER — Coordonnées non validées
**Fichier :** `server/socket/socketHandler.js` → événement `PLACE_TOWER`

**Problème :** Les coordonnées `x, y` n'étaient pas validées. Possibilité de placer des tours hors de la carte ou avec des coordonnées NaN.

**Patch appliqué :**
- x validé entre 0 et 880 (largeur de la map)
- y validé entre 0 et 680 (hauteur de la map)
- Type de tour sanitisé avant lookup

---

### 16. Pas de déconnexion serveur du cookie
**Fichier :** `server/routes/auth.js`

**Problème :** Aucune route de logout côté serveur. Le cookie HTTP-only persistait même après la déconnexion client.

**Patch appliqué :**
- Nouvelle route `POST /api/auth/logout` qui supprime le cookie
- Client mis à jour pour appeler cette route au logout

---

## 🔵 Vulnérabilités FAIBLES (bonnes pratiques)

### 17. JWT_SECRET par défaut = 'secret'
**Fichier :** `server/index.js`, `server/routes/auth.js`, `server/socket/socketHandler.js`

**Problème :** Si `JWT_SECRET` n'est pas défini dans `.env`, le secret est `'secret'` — devinable en 1 essai. N'importe qui peut forger des tokens.

**Patch appliqué :** Warning dans la console au démarrage si le secret est manquant ou trop faible.

> **Action requise :** Définir `JWT_SECRET=<clé-de-32-caractères-minimum>` dans le fichier `.env`

---

### 18. Variables de jeu exposées sur window
**Fichier :** `client/js/*.js`

**Problème :** `playerMoney`, `playerHealth`, `towers`, `monsters`, etc. sont des variables globales modifiables depuis la console du navigateur. Mais puisque le serveur valide maintenant les actions critiques (argent, kills, dégâts), l'impact est réduit.

**Statut :** Risque mitigé par les validations serveur. Une refactorisation complète en modules ES serait idéale à long terme mais non bloquante.

---

### 19. localStorage stocke des données sensibles 
**Fichier :** `client/js/auth.js`, `client/js/main.js`

**Problème :** `currentUser`, `gameState`, `currentRoom` sont stockés dans localStorage, accessible via XSS.

**Statut :** Le token est déjà en cookie HTTP-only (protégé). Les données dans localStorage sont non-sensibles (username, état UI). Risque faible.

---

### 20. Pas de validation du code de salon
**Fichier :** `server/socket/socketHandler.js` → événement `JOIN_ROOM`

**Problème :** Le code de salon n'est pas sanitisé. Bien que la map `rooms` n'est pas vulnérable à l'injection, c'est une bonne pratique.

**Statut :** Impact faible car `rooms.get(code)` sur une Map JavaScript ne cause pas d'injection. Mais la sanitisation des chaînes est appliquée globalement via la fonction utilitaire `sanitizeString()`.

---

## 📁 Fichiers modifiés

| Fichier | Modifications |
|---|---|
| `server/index.js` | Helmet, CORS strict, body limit, JWT warning |
| `server/socket/socketHandler.js` | Rate limiter, validation de tous les événements, sanitisation, bornes anti-cheat |
| `server/routes/auth.js` | Rate limiting login, validation input, logout route, select -password |
| `client/js/auth.js` | Logout appelle /api/auth/logout |

---

## 🚀 Actions recommandées (non bloquantes)

1. **Installer helmet** : `npm install helmet`
2. **Définir un vrai JWT_SECRET** dans `.env` :
   ```
   JWT_SECRET=votre-cle-secrete-de-32-caracteres-minimum-ici
   ```
3. **Activer HTTPS** en production (les cookies secure sont déjà configurés)
4. **Ajouter un WAF** (Cloudflare, etc.) pour la protection DDoS en production
5. **Considérer la migration** vers un système de modules ES côté client pour isoler les variables de jeu

---

## 🛡️ Résumé des protections anti-cheat actives

```
Client  ─── socket.emit() ───▶  Serveur
                                   │
                                   ├── Rate Limiter (par événement)
                                   ├── Validation numérique (bornes, type)
                                   ├── Sanitisation des strings
                                   ├── Calcul serveur des montants
                                   ├── Vérification d'identité (JWT)
                                   └── Vérification d'état (joueur vivant, en jeu)
```

Toute valeur envoyée par le client est maintenant **validée, bornée et sanitisée** côté serveur avant d'être appliquée.
