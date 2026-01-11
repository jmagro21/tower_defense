# 🎮 Tower Defense Multijoueur - Édition Ultime

> ⚠️ **DISCLAIMER** : Ce projet est du pur **vibe coding** - codé avec passion, créativité et un brin de folie. Les fonctionnalités ont été ajoutées au fil de l'inspiration, sans plan rigide. Le résultat ? Un tower defense chaotique et addictif ! 🚀

Un jeu Tower Defense multijoueur en temps réel où les joueurs s'affrontent pour être le dernier survivant. Construisez vos défenses, envoyez des monstres à vos adversaires, débloquez des recherches, choisissez votre classe et survivez jusqu'à la vague 60+ !

## ✨ Ce qui rend ce projet unique

- **Pas de planification rigide** - Développé au feeling, une feature à la fois
- **Système de progression complexe** - Recherches, classes, capacités, vagues infinies
- **Multijoueur temps réel** - Avec Socket.io pour une expérience fluide
- **Mécaniques originales** - Tours dorées, laboratoires, monstres Titans, mort subite
- **Interface responsive** - Adapté mobile/tablette/desktop

---

## 🎯 Règles du Jeu

### 🏆 Objectif
Être le **dernier survivant** en empêchant les monstres de traverser votre défense !

### ❤️ Santé et Défaite
- Vous commencez avec **0/20 monstres passés**
- Chaque monstre qui atteint la fin du chemin = **+1 monstre passé**
- Si **20 monstres passent**, vous êtes **éliminé**
- Le dernier joueur en vie **gagne la partie**

### 💰 Économie
- **Argent de départ** : 500💰
- **Gagner de l'argent** : Tuez des monstres pour récolter leur récompense
- **Dépenser** : Construire/améliorer des tours, envoyer des monstres aux adversaires

### ⏱️ Système de Vagues Progressif

Le jeu utilise un système de **vagues temporelles** qui augmentent en difficulté :

#### Phase Initiale (0-45s)
- **Vague 1** : Monstres de base uniquement
- **15s** : Premier spawn de monstres
- **45s** : Les Tanks arrivent !

#### Phase Intermédiaire (45s-5min15s)
- **Vague 2 (45s)** : Tanks débloqués, multiplicateur HP x1.2
- **Vague 3 (1min15s)** : Rapides et Diviseurs débloqués, HP x1.4
- **Vague 4 (1min45s)** : Soigneurs, Paralyseurs et Fantômes débloqués, HP x1.6
- **Vague 5-9** : Progression graduelle (+0.1 HP toutes les 30s)

#### Phase Boss (5min+)
- **Vague 10 (5min15s)** : 💀 **BOSS DÉBLOQUÉ** - Spawn accéléré à 2.5s
- **Vague 11-19** : Progression continue (+0.2 HP/30s)

#### Phase Titan (10min+)
- **Vague 20** : 👹 **LE TITAN ARRIVE** - Boss légendaire invisible avec 15000 HP
- **Vague 21-24** : Invasion massive (spawn x1.5)
- **Vague 25** : 🔥 Spawn rapide (1s entre chaque monstre)

#### Phase Finale (20min+)
- **Vague 40** : 🔥🔥 Spawn ultra-rapide (0.5s)
- **Vague 41-60** : Chaos total, invasion massive continue

#### 💀 MORT SUBITE (Vague 60+)
- **Seuls les TITANS spawneront** 
- **Amélioration de tours INTERDITE**
- **Mode survie pur** - Tenez le plus longtemps possible !

---

## 🏰 Tours Défensives (6 types)

### 🔵 Tour Basique
- **Coût** : 100💰
- **Dégâts** : 10
- **Portée** : 150
- **Cadence** : 1.5s
- **Upgrade** : 50💰 (+3 dégâts, -150ms cadence)
- *Tour équilibrée pour début de partie*

### 🎯 Tour Sniper
- **Coût** : 200💰
- **Dégâts** : 50
- **Portée** : 300 (la plus longue)
- **Cadence** : 3s
- **Upgrade** : 100💰 (+15 dégâts, -300ms cadence)
- *Parfaite pour les Boss et cibles lointaines*

### ⚡ Tour Rapide
- **Coût** : 150💰
- **Dégâts** : 5
- **Portée** : 120
- **Cadence** : 0.8s (la plus rapide)
- **Upgrade** : 75💰 (+1.5 dégâts, -75ms cadence)
- *Idéale pour les Rapides et les hordes*

### 🪙 Tour Dorée ⭐
- **Coût** : 250💰
- **Dégâts** : 8
- **Portée** : 180
- **Cadence** : 2s
- **Upgrade** : 80💰
- **BONUS UNIQUE** : Halo d'or (150px) qui **double les récompenses** des monstres tués à proximité
- *Investissement économique - stackez-les pour un boost massif !*

### 🔬 Tour Laboratoire 🧪
- **Coût** : 300💰
- **Dégâts** : 3
- **Portée** : 200
- **Cadence** : 1.5s
- **Upgrade** : 100💰
- **BONUS UNIQUE** : 
  - Génère des **points de recherche** à chaque kill
  - Aura de ralentissement (1% par niveau de recherche)
  - Kill bonus +1 point si monstre dans l'aura
- *Essentiel pour la progression technologique*

### ⚡ Tour Électrique ⚡
- **Coût** : 500💰 (la plus chère)
- **Dégâts** : 15
- **Portée** : 180
- **Cadence** : 5s (très lente)
- **Upgrade** : 150💰 (+8 dégâts)
- **CAPACITÉ UNIQUE** : 
  - Attaque **10 monstres simultanément**
  - **Paralyse pendant 0.5s**
  - *Aucune amélioration de vitesse d'attaque*
- *Parfaite pour contrôler les hordes massives*

### 🎨 Capacités des Tours (4 types)

Achetez des capacités spéciales pour vos tours :

- 👁️ **Vision Véritable** (150💰) : Détecte et attaque les monstres invisibles
- 🔥 **Flèches Enflammées** (200💰) : Brûlure infligeant 2% HP max/sec pendant 3s
- ❄️ **Gel** (180💰) : Ralentit de 50% pendant 2s
- ☠️ **Poison** (220💰) : Empoisonnement 2% HP max/sec pendant 4s

---

## 👾 Monstres Attaquants (9 types)

### Monstres de Base

**👾 Basique**
- Coût : 50💰 | HP : 100 | Vitesse : 30 | Récompense : 5💰
- *Monstre standard, disponible dès le début*

**🛡️ Tank**
- Coût : 150💰 | HP : 300 | Vitesse : 18 | Récompense : 20💰
- *Débloqué vague 2 - Absorbe beaucoup de dégâts*

**💨 Rapide**
- Coût : 100💰 | HP : 50 | Vitesse : 60 | Récompense : 12💰
- *Débloqué vague 3 - Traverse rapidement les défenses*

### Monstres Spéciaux

**🧬 Diviseur**
- Coût : 120💰 | HP : 150 | Vitesse : 40 | Récompense : 50💰
- *Débloqué vague 3 - Se divise en 2 monstres de base à sa mort*

**💚 Soigneur**
- Coût : 200💰 | HP : 200 | Vitesse : 25 | Récompense : 80💰
- *Débloqué vague 4 - Augmente la vie des monstres à proximité (rayon 100px) de 50%*

**⚡ Paralyseur**
- Coût : 180💰 | HP : 180 | Vitesse : 35 | Récompense : 70💰
- *Débloqué vague 4 - Paralyse 2 tours aléatoires pendant 2s en entrant*

**👻 Fantôme**
- Coût : 250💰 | HP : 120 | Vitesse : 45 | Récompense : 90💰
- *Débloqué vague 4 - **INVISIBLE** : seules les tours avec Vision Véritable peuvent l'attaquer*

### Boss Légendaires

**👹 Boss**
- Coût : 300💰 | HP : 1000 | Vitesse : 12 | Récompense : 60💰
- *Débloqué vague 10 - Boss standard avec énormément de vie*

**🔥 TITAN** (Boss Ultime)
- Coût : 10 000💰 | HP : 15 000 | Vitesse : 8 | Récompense : 2000💰
- *Spawn automatiquement à la vague 20*
- **Capacités dévastatrices** :
  - 👁️ **Invisible** (nécessite Vision Véritable)
  - ⚡ **Paralyse** les 5 premières tours qu'il croise pendant 3s
  - 💪 **Buff de zone** : Double la vie des monstres dans un rayon de 200px
  - 🐣 **Spawn de Rapides** toutes les 3s pendant son trajet
  - 💀 **Division finale** : Se divise en **5 Boss** à sa mort

---

## 🎓 Système de Classes (4 classes)

Choisissez votre classe au début de la partie (15 secondes pour choisir) :

### 💰 **Capitaliste** 
- Argent de départ : **800💰** (+300)
- *Parfait pour rusher les tours chères dès le début*

### 🏰 **Ingénieur**
- Tours de départ : **+10 tours max** (total : 30)
- *Permet de construire plus de défenses*

### 🔬 **Scientifique**
- Bonus recherche : **+5 points** sur toutes les recherches
- *Accélère drastiquement la progression technologique*

### ⚔️ **Guerrier**
- Dégâts des tours : **+20%** permanent
- *Build orienté dégâts purs*

---

## 🔬 Système de Recherche

Les **Tours Laboratoire** génèrent des **points de recherche** à chaque kill. Investissez dans 3 branches technologiques :

### 🗡️ Branche Attaque

**❤️ Renforcer les monstres**
- Effet : +2% HP par niveau
- Coût : 5 + (niveau × 5) kills
- Max : Niveau 25 → +50% HP

**⚡ Accélérer les monstres**
- Effet : +2% vitesse par niveau
- Coût : 5 + (niveau × 5) kills
- Max : Niveau 25 → +50% vitesse

**💰 Réduire coût monstres**
- Effet : -2% coût par niveau
- Coût : 5 + (niveau × 5) kills
- Max : Niveau 25 → -50% coût

### 🛡️ Branche Défense

**💎 Amélioration moins chère**
- Effet : -2% coût upgrade tours par niveau
- Coût : 5 + (niveau × 5) kills
- Max : Niveau 25 → -50% coût

**⚔️ Augmenter l'attaque**
- Effet : +2% dégâts tours par niveau
- Coût : 5 + (niveau × 5) kills
- Max : Niveau 25 → +50% dégâts

**🎯 Accélérer attaque**
- Effet : +2% vitesse d'attaque par niveau
- Coût : 5 + (niveau × 5) kills
- Max : Niveau 25 → +50% vitesse

### ⚙️ Branche Général

**📏 Augmenter taille max tours**
- Effet : +5 tours max par niveau
- Coût progression exponentielle : 50 × 1.15^niveau
- Base : 20 tours → Déblocable jusqu'à 145 tours (niveau 25)

---

## 🗺️ Maps Disponibles (4 maps)

### 🔷 Standard
- Chemin en zigzag simple
- *Idéal pour débuter*

### 🌀 Spirale
- Chemin en spirale vers le centre
- *Permet de placer beaucoup de tours au centre*

### ➡️ Droit
- Chemin droit vertical
- *Parfait pour les tours sniper alignées*

### 🐍 Serpent
- Chemin sinueux complexe
- *Offre des positions stratégiques variées*

---

## 🚀 Différences par rapport aux Tower Defense classiques

### ✨ Innovations de ce projet

1. **Système de recherche progressif** - Les kills nourrissent votre technologie
2. **Tours spéciales économiques** - Tour Dorée multiplie les gains
3. **Tours de recherche** - Laboratoire génère des points tech
4. **Système de classes** - 4 playstyles différents
5. **Monstres avec capacités uniques** - Paralyseurs, Soigneurs, Diviseurs, Invisibles
6. **Boss Titan légendaire** - Spawn auto vague 20, 8 capacités dévastatrices
7. **Mort subite vague 60+** - Seuls les Titans spawneront, no upgrades
8. **Vagues infinies** - Le jeu continue indéfiniment jusqu'à défaite
9. **Spawn dynamique** - Vitesse et densité augmentent avec les vagues
10. **Capacités de tours** - 4 types d'effets achetables (feu, glace, poison, vision)
11. **Mode multijoueur asymétrique** - Chaque joueur a sa map mais s'affrontent indirectement
12. **Système de combo** - Envoi massif de monstres spécifiques
13. **Déplacement de tours** - Repositionnez vos défenses pendant la partie

### 🎮 Mécaniques classiques conservées

- Placement de tours sur grille
- Upgrade de tours
- Différents types d'ennemis
- Chemin prédéfini
- Gestion de ressources (argent)

---

## 🎯 Stratégies Avancées

### 💰 Build Économique ("Gold Rush")
1. Rusher **plusieurs Tours Dorées** en stack
2. Placer des tours classiques dans leur halo d'or
3. Multiplier les récompenses par 2, 4, 6+ selon le nombre de halos
4. Profiter de l'argent massif pour dominer mid-game

### 🔬 Build Technologique ("Big Brain")
1. Choisir classe **Scientifique** (+5 points recherche)
2. Construire 3-4 **Tours Laboratoire** early
3. Rush les recherches défensives (dégâts + vitesse)
4. Dominer late-game avec des tours surpuissantes

### ⚡ Build Contrôle ("Crowd Control")
1. Acheter des **Tours Électriques** (10 cibles + stun)
2. Ajouter capacités **Gel** et **Poison** sur les tours
3. Contrôler les hordes massives en les ralentissant
4. Survivre aux vagues 40+ où les spawns sont ultra-rapides

### 🎯 Build Sniper ("One Shot")
1. Choisir classe **Guerrier** (+20% dégâts)
2. Stack des **Tours Sniper** fully upgradées
3. Recherche **Augmenter l'attaque** niveau max
4. One-shot les Boss et Titans

---

## 📊 Statistiques et Classement

Pendant la partie, suivez en temps réel :
- ❤️ **Santé** (monstres passés / 20)
- 💰 **Or total** accumulé
- 💀 **Kills** effectués
- ⚔️ **Or d'attaque** dépensé en monstres envoyés

Le classement affiche tous les joueurs, vivants et éliminés, avec leur statut actuel.

---

## 🚀 Fonctionnalités Techniques

### ✅ Authentification & Salons
- Création de compte avec nom d'utilisateur et mot de passe
- Connexion sécurisée avec **JWT**
- Système de salons avec code unique (6 caractères)
- Salle d'attente avec liste des joueurs
- L'hôte démarre la partie (minimum 2 joueurs)
- Statistiques de joueur sauvegardées en MongoDB

### 🎮 Système de Jeu
- Architecture **client-serveur temps réel** avec Socket.io
- **Multijoueur asynchrone** - Chaque joueur a sa map mais s'affrontent indirectement
- Maps identiques choisies en pré-game
- **Phaser 3** pour le rendu 2D du jeu
- **60 FPS** stable avec optimisations de rendu

### 📱 Interface & UX
- **Responsive design** - Mobile, tablette, desktop
- Support **touch** pour mobile (swipe, tap, pinch)
- Tooltips informatifs sur toutes les actions
- Notifications en temps réel
- Mode spectateur (voir les joueurs éliminés)
- Musique de fond avec contrôle volume
- Toast messages pour feedback immédiat

### 🔧 Backend Robuste
- **Node.js + Express** pour l'API REST
- **Socket.io** pour le temps réel
- **MongoDB + Mongoose** pour la persistence
- **bcryptjs** pour le hashage sécurisé des mots de passe
- Gestion des salles avec nettoyage automatique
- Synchronisation multi-joueurs fluide

### 🧹 Optimisations & Nettoyage
- Système de cleanup automatique (sprites, timers, événements)
- Gestion mémoire optimisée pour longues parties
- Destruction propre des objets Phaser
- Prévention des memory leaks
- Déconnexion gracieuse des joueurs

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- MongoDB (installé localement ou connexion à une instance)
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd tower-defense-multiplayer
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Créez un fichier `.env` à la racine du projet :
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tower-defense
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
NODE_ENV=development
```

### 4. Démarrer MongoDB
Assurez-vous que MongoDB est en cours d'exécution :
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongodb
# ou
brew services start mongodb-community
```

## 🎮 Lancement du jeu

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📁 Structure du projet

```
tower-defense-multiplayer/
├── client/                 # Frontend du jeu
│   ├── index.html         # Page principale
│   ├── css/
│   │   └── style.css      # Styles du jeu
│   └── js/
│       ├── constants.js   # Constantes du jeu
│       ├── auth.js        # Gestion authentification
│       ├── lobby.js       # Gestion lobby/salons
│       ├── game.js        # Logique du jeu Phaser
│       └── main.js        # Initialisation
├── server/                # Backend Node.js
│   ├── index.js          # Point d'entrée serveur
│   ├── models/
│   │   └── User.js       # Modèle utilisateur MongoDB
│   ├── routes/
│   │   └── auth.js       # Routes d'authentification
│   ├── game/
│   │   └── GameRoom.js   # Gestion des salons de jeu
│   └── socket/
│       └── socketHandler.js  # Gestion Socket.io
├── shared/               # Code partagé
│   └── constants.js      # Constantes partagées
├── package.json
└── .env                  # Configuration (à créer)
```

## 🎯 Comment jouer

### 1. Créer un compte
- Lancez le jeu
- Cliquez sur "S'inscrire"
- Entrez un nom d'utilisateur et un mot de passe

### 2. Créer ou rejoindre un salon
- **Créer** : Cliquez sur "Créer un salon" et partagez le code
- **Rejoindre** : Entrez le code du salon à 6 caractères

### 3. Salle d'attente
- Attendez que d'autres joueurs rejoignent (minimum 2)
- L'hôte peut démarrer la partie

### 4. Gameplay
#### Défense
- Sélectionnez une tour dans le shop
- Cliquez sur la map pour la placer (pas sur le chemin !)
- Les tours tirent automatiquement sur les monstres

#### Attaque
- Choisissez un joueur cible dans la liste déroulante
- Sélectionnez un type de monstre
- Cliquez pour l'envoyer à votre adversaire

#### Objectif
- Empêchez 20 monstres de passer
- Éliminez vos adversaires en leur envoyant des monstres
- Soyez le dernier survivant !

## 🔧 Technologies utilisées

### Frontend
- **Phaser 3** : Moteur de jeu 2D
- **Socket.io Client** : Communication temps réel
- **HTML5/CSS3** : Interface utilisateur

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **Socket.io** : WebSocket temps réel
- **MongoDB** : Base de données
- **Mongoose** : ODM MongoDB
- **JWT** : Authentification
- **bcryptjs** : Hachage des mots de passe

## 🐛 Dépannage

### MongoDB ne se connecte pas
```bash
# Vérifiez que MongoDB est en cours d'exécution
# Windows
net start MongoDB

# Vérifiez la connexion
mongo
```

### Le port 3000 est déjà utilisé
Modifiez le port dans le fichier `.env` :
```env
PORT=3001
```

### Erreur de connexion Socket.io
Vérifiez que l'URL du serveur dans `client/js/lobby.js` correspond :
```javascript
socket = io('http://localhost:3000');
```

## 📝 Améliorations possibles

- [ ] Ajout de sons d'effets (tirs, explosions, kills)
- [ ] Replay system pour revoir les parties
- [ ] Plus de maps (labyrinthe, double chemin)
- [ ] Mode classement avec ELO
- [ ] Matchmaking automatique
- [ ] Chat en jeu
- [ ] Système d'achievements
- [ ] Skins de tours personnalisables
- [ ] Mode coopératif (défense partagée)
- [ ] Événements temporaires (double or, boss rush)
- [ ] API publique pour statistiques
- [ ] Mode tournoi automatisé

## 🐛 Bugs Connus & Limitations

- Les performances peuvent baisser après la vague 60+ (spawn ultra-rapide)
- Le Titan peut parfois paralyser plus de 5 tours si elles sont très proches
- Le classement peut se désynchroniser si un joueur se déconnecte brutalement
- Mobile : les tooltips peuvent être difficiles à lire sur petits écrans
- Le mode spectateur ne montre pas les effets visuels des autres joueurs

## 📄 Licence

MIT - Libre d'utilisation, modification et distribution

## 🤝 Contribution

Pull requests bienvenues ! Pour des changements majeurs :
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 💬 Support

Pour toute question ou problème :
- Ouvrir une **issue** sur GitHub
- Rejoindre la discussion dans les issues existantes

## 🎉 Crédits

- **Phaser 3** - Moteur de jeu incroyable
- **Socket.io** - Communication temps réel fluide
- **MongoDB** - Base de données NoSQL performante
- **Tous les testeurs** qui ont supporté mes bugs ! 😄

---

**Développé avec ❤️ et beaucoup de café ☕**

**Bon jeu ! 🎮 Survivrez-vous jusqu'à la vague 100 ?**

---

### 📈 Statistiques du Projet

```
Lignes de code : ~8000+
Fichiers : 30+
Fonctionnalités : 50+
Heures de développement : Beaucoup trop pour compter 😅
Bugs corrigés : ∞
```

### 🏆 Records Personnels

Essayez de battre ces records :
- 🥇 **Vague la plus haute** : ???
- 🥇 **Kills en une partie** : ???
- 🥇 **Or total accumulé** : ???
- 🥇 **Temps de survie** : ???

*Partagez vos records en créant une issue !*
