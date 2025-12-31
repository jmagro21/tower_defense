# 🎮 Tower Defense Multijoueur

Un jeu Tower Defense multijoueur en temps réel où les joueurs s'affrontent pour être le dernier survivant. Construisez vos défenses, envoyez des monstres à vos adversaires et survivez aux assauts !

## 🚀 Fonctionnalités

### Authentification
- ✅ Création de compte avec nom d'utilisateur et mot de passe
- ✅ Connexion sécurisée avec JWT
- ✅ Statistiques de joueur sauvegardées

### Système de salons
- ✅ Création de salon avec code unique (6 caractères)
- ✅ Rejoindre un salon avec un code
- ✅ Salle d'attente avec liste des joueurs
- ✅ L'hôte démarre la partie (minimum 2 joueurs)

### Gameplay Tower Defense
- ✅ Chaque joueur a sa propre map identique
- ✅ 3 types de tours défensives :
  - 🔵 **Tour Basique** : Équilibrée (100💰)
  - 🎯 **Tour Sniper** : Longue portée, gros dégâts (200💰)
  - ⚡ **Tour Rapide** : Tir rapide, faibles dégâts (150💰)
- ✅ 4 types de monstres à envoyer :
  - 👾 **Basique** : Standard (50💰)
  - 🛡️ **Tank** : Beaucoup de vie (150💰)
  - 💨 **Rapide** : Très rapide (100💰)
  - 👹 **Boss** : Énorme, lent (300💰)

### Système d'argent
- ✅ Argent de départ : 500💰
- ✅ Gagner de l'argent en tuant des monstres
- ✅ Dépenser pour construire des tours
- ✅ Dépenser pour envoyer des monstres aux adversaires
- ✅ Amélioration des tours (augmente les dégâts)

### Gestion de partie
- ✅ Limite de 20 monstres passés = défaite
- ✅ Dernier survivant = gagnant
- ✅ Statistiques de fin de partie
- ✅ Retour automatique au lobby après la partie

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

- [ ] Ajout de sons et musique
- [ ] Plus de types de tours et monstres
- [ ] Système de niveau et progression
- [ ] Classement des joueurs
- [ ] Maps différentes
- [ ] Mode spectateur
- [ ] Chat en jeu
- [ ] Replays de parties
- [ ] Sauvegarde de l'état de la partie
- [ ] Matchmaking automatique

## 📄 Licence

MIT

## 👥 Contributeurs

Votre nom ici !

---

**Bon jeu ! 🎮**
