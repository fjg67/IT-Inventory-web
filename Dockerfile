# ============================================
# Dockerfile — IT-Inventory (Build multi-stage)
# ============================================

# --- Stage 1 : Build du frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --force
COPY frontend/ ./
RUN npm run build

# --- Stage 2 : Build du backend ---
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --force --include=dev
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# --- Stage 3 : Image de production ---
FROM node:20-alpine AS production
WORKDIR /app

# Installer uniquement les dépendances de production
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --force --omit=dev

# Copier Prisma schema et générer le client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copier le backend compilé
COPY --from=backend-build /app/backend/dist ./dist

# Copier le frontend buildé dans le dossier public du backend
COPY --from=frontend-build /app/frontend/dist ./dist/public

# Créer le dossier uploads
RUN mkdir -p /app/uploads

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Exposer le port
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Démarrer l'application
CMD ["node", "dist/app.js"]
