# ─── Stage 1 : Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances
RUN npm ci

# Copier le code source
COPY tsconfig.json ./
COPY src ./src

# Compiler TypeScript → JavaScript
RUN npm run build

# ─── Stage 2 : Production ────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le build compilé
COPY --from=builder /app/dist ./dist

# Copier les fichiers de config nécessaires au runtime
COPY .sequelizerc ./
COPY src/config/sequelize-config.js ./src/config/sequelize-config.js
COPY src/migrations ./src/migrations
COPY src/seeders ./src/seeders

# Créer le dossier uploads
RUN mkdir -p uploads

# Exposer le port
EXPOSE 3001

# Utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Démarrer le serveur
CMD ["node", "dist/server.js"]