#!/bin/bash
# =============================================================================
# Script d'initialisation SSL pour Le Copropriétaire UAT
# =============================================================================
# Usage: ./init-ssl.sh (en tant que root)

set -e

DOMAIN="uat.lecopro.mneto.fr"
API_DOMAIN="api.uat.lecopro.mneto.fr"
EMAIL="admin@mneto.fr"  # Changez cette adresse email
LECOPRO_DIR="/opt/lecopro"

echo "=============================================="
echo "  Initialisation SSL pour Le Copropriétaire  "
echo "=============================================="

# Vérifier qu'on est root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ce script doit être exécuté en tant que root"
    exit 1
fi

# Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p $LECOPRO_DIR/nginx/ssl
mkdir -p $LECOPRO_DIR/certbot/www

# Arrêter nginx si en cours
echo "🛑 Arrêt de nginx (si en cours)..."
docker stop lecopro-nginx 2>/dev/null || true

# Générer un certificat auto-signé temporaire (pour que nginx puisse démarrer)
echo "🔐 Génération d'un certificat temporaire..."
openssl req -x509 -nodes -newkey rsa:4096 \
    -keyout $LECOPRO_DIR/nginx/ssl/privkey.pem \
    -out $LECOPRO_DIR/nginx/ssl/fullchain.pem \
    -days 1 \
    -subj "/CN=$DOMAIN"

# Démarrer nginx avec le certificat temporaire
echo "🚀 Démarrage de nginx..."
cd $LECOPRO_DIR
docker compose up -d nginx

# Attendre que nginx soit prêt
sleep 5

# Obtenir le vrai certificat avec certbot
echo "🔒 Obtention du certificat Let's Encrypt..."
docker run --rm \
    -v $LECOPRO_DIR/nginx/ssl:/etc/letsencrypt \
    -v $LECOPRO_DIR/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d $API_DOMAIN

# Copier les certificats au bon endroit
echo "📋 Configuration des certificats..."
cp /opt/lecopro/nginx/ssl/live/$DOMAIN/fullchain.pem $LECOPRO_DIR/nginx/ssl/fullchain.pem
cp /opt/lecopro/nginx/ssl/live/$DOMAIN/privkey.pem $LECOPRO_DIR/nginx/ssl/privkey.pem

# Redémarrer nginx avec le vrai certificat
echo "🔄 Redémarrage de nginx..."
docker compose restart nginx

echo ""
echo "✅ SSL configuré avec succès!"
echo ""
echo "🌐 Vos sites sont maintenant accessibles en HTTPS:"
echo "   - https://$DOMAIN"
echo "   - https://$API_DOMAIN"
echo ""
echo "📅 Le certificat sera renouvelé automatiquement."
echo "   Pour renouveler manuellement: docker compose --profile with-certbot up certbot"
