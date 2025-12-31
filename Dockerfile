# Dockerfile pour l'application Node.js
FROM node:lts-alpine3.23

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Installer pnpm
RUN npm install -g pnpm

# Installer les dépendances
RUN pnpm install

# Copier le reste de l'application
COPY . .

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["pnpm", "start"]
