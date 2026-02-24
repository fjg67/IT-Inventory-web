#!/bin/bash
# ============================================
# Script d'initialisation SSL — Let's Encrypt
# À exécuter une seule fois sur le VPS
# ============================================

set -e

DOMAIN="it-inventory.com"
EMAIL="admin@it-inventory.com"  # ← Remplacez par votre email

echo "============================================"
echo " Initialisation SSL pour $DOMAIN"
echo "============================================"

# 1. Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installez-le d'abord."
    exit 1
fi

# 2. Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p certbot/conf
mkdir -p certbot/www

# 3. Démarrer Nginx en HTTP uniquement
echo "🚀 Démarrage de Nginx en HTTP..."
docker compose up -d nginx

# 4. Attendre que Nginx soit prêt
echo "⏳ Attente du démarrage de Nginx..."
sleep 5

# 5. Obtenir le certificat SSL
echo "🔐 Obtention du certificat SSL..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# 6. Vérifier que le certificat a été obtenu
if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificat SSL obtenu avec succès !"
    echo ""
    echo "🔧 ÉTAPES SUIVANTES :"
    echo "  1. Éditez nginx/conf.d/default.conf"
    echo "  2. Décommentez le bloc HTTPS (server 443)"
    echo "  3. Décommentez la redirection HTTP → HTTPS"
    echo "  4. Commentez le bloc 'location /' dans le server 80"
    echo "  5. Relancez : docker compose restart nginx"
    echo ""
else
    echo "❌ Erreur lors de l'obtention du certificat"
    echo "Vérifiez que votre domaine pointe vers ce serveur."
    exit 1
fi

echo "============================================"
echo " SSL initialisé avec succès ! 🎉"
echo "============================================"
