#!/bin/bash
# ============================================
# Script de déploiement — IT-Inventory
# À exécuter sur le VPS pour déployer/mettre à jour
# ============================================

set -e

echo "============================================"
echo " Déploiement IT-Inventory"
echo " $(date)"
echo "============================================"

# 1. Récupérer les dernières modifications
echo "📥 Récupération du code depuis GitHub..."
git pull origin main

# 2. Vérifier le fichier .env.production
if [ ! -f ".env.production" ]; then
    echo "❌ Fichier .env.production manquant !"
    echo "Créez-le avec : cp .env.production.example .env.production"
    echo "Puis éditez-le avec vos valeurs."
    exit 1
fi

# 3. Construire et démarrer les conteneurs
echo "🏗️  Construction de l'image Docker..."
docker compose build --no-cache

echo "🚀 Démarrage des conteneurs..."
docker compose up -d

# 4. Attendre le démarrage
echo "⏳ Attente du démarrage de l'application..."
sleep 10

# 5. Vérifier la santé de l'application
echo "🏥 Vérification de la santé..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Application déployée avec succès !"
    echo "🌐 Accessible sur https://it-inventory.com"
else
    echo "⚠️  L'application n'est pas encore prête (HTTP $HTTP_STATUS)"
    echo "Vérifiez les logs : docker compose logs -f app"
fi

# 6. Nettoyage des anciennes images
echo "🧹 Nettoyage des anciennes images Docker..."
docker image prune -f

echo ""
echo "============================================"
echo " Déploiement terminé ! 🎉"
echo "============================================"
echo ""
echo "Commandes utiles :"
echo "  docker compose logs -f app     → Logs de l'application"
echo "  docker compose logs -f nginx   → Logs de Nginx"
echo "  docker compose restart         → Redémarrer"
echo "  docker compose down            → Arrêter"
