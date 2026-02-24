#!/bin/bash
# ============================================
# Script d'installation du VPS — IT-Inventory
# À exécuter une seule fois sur un VPS Ubuntu/Debian neuf
# ============================================

set -e

echo "============================================"
echo " Installation du VPS pour IT-Inventory"
echo "============================================"

# 1. Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installer Docker
echo "🐳 Installation de Docker..."
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Installer Docker Compose (inclus avec Docker récent)
echo "🔧 Vérification de Docker Compose..."
docker compose version

# 4. Installer Git
echo "📥 Installation de Git..."
sudo apt install -y git

# 5. Configurer le firewall
echo "🔒 Configuration du firewall..."
sudo apt install -y ufw
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# 6. Cloner le projet
echo "📂 Clonage du projet..."
cd /opt
sudo git clone https://github.com/VOTRE_UTILISATEUR/it-inventory-web.git
sudo chown -R $USER:$USER /opt/it-inventory-web
cd /opt/it-inventory-web

# 7. Créer le fichier .env.production
echo "📝 Création du fichier de configuration..."
cp .env.production.example .env.production
echo ""
echo "⚠️  IMPORTANT : Éditez .env.production avec vos valeurs !"
echo "   nano .env.production"
echo ""

echo "============================================"
echo " Installation terminée ! 🎉"
echo "============================================"
echo ""
echo "PROCHAINES ÉTAPES :"
echo "  1. Déconnectez-vous et reconnectez-vous (pour le groupe Docker)"
echo "  2. cd /opt/it-inventory-web"
echo "  3. nano .env.production  (configurer la base de données et JWT)"
echo "  4. bash scripts/deploy.sh  (déployer l'application)"
echo "  5. bash scripts/init-ssl.sh  (activer SSL)"
echo ""
