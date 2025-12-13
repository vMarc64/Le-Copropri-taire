# Déploiement Le Copropriétaire

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                            │
├─────────────────────────────────────────────────────────────────┤
│  Push main ──► Build ──► Push GHCR ──► Deploy UAT (VPS)        │
│  Tag v*    ──► Build ──► Push GHCR ──► Deploy Prod (GCP)       │
└─────────────────────────────────────────────────────────────────┘

Environnements:
┌─────────┬────────────────────┬─────────────────────────────────┐
│ Env     │ Infra              │ URL                             │
├─────────┼────────────────────┼─────────────────────────────────┤
│ Dev     │ Local              │ localhost:3000/3002             │
│ UAT     │ VPS (Docker)       │ uat.lecopro.fr                  │
│ Prod    │ GCP Cloud Run      │ lecopro.fr                      │
└─────────┴────────────────────┴─────────────────────────────────┘
```

## Prérequis VPS (UAT)

### 1. Installation Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Installer Docker Compose plugin
sudo apt-get install docker-compose-plugin

# Vérifier
docker --version
docker compose version
```

### 2. Structure sur le VPS

```bash
# Créer le répertoire
sudo mkdir -p /opt/lecopro
sudo chown $USER:$USER /opt/lecopro
cd /opt/lecopro

# Créer le fichier .env
nano .env
# Copier le contenu de .env.example et remplir les valeurs

# Créer docker-compose.yml
nano docker-compose.yml
# Copier le contenu du fichier docker-compose.yml
```

### 3. Configuration SSH pour GitHub Actions

```bash
# Sur le VPS, ajouter la clé SSH de déploiement
mkdir -p ~/.ssh
echo "VOTRE_CLE_PUBLIQUE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 4. Premier déploiement manuel

```bash
cd /opt/lecopro

# Se connecter au registry GitHub
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Démarrer les services
docker compose up -d

# Voir les logs
docker compose logs -f
```

## Secrets GitHub à configurer

Dans Settings > Secrets and variables > Actions :

### Environnement UAT
| Secret | Description |
|--------|-------------|
| `UAT_HOST` | IP ou domaine du VPS |
| `UAT_USERNAME` | Utilisateur SSH |
| `UAT_SSH_KEY` | Clé SSH privée |
| `UAT_API_URL` | https://api.uat.lecopro.fr |

### Environnement Production
| Secret | Description |
|--------|-------------|
| `GCP_SA_KEY` | Service Account JSON |
| `PROD_API_URL` | https://api.lecopro.fr |

## Commandes utiles

### Déployer manuellement sur UAT

```bash
# Sur le VPS
cd /opt/lecopro
docker compose pull
docker compose up -d
```

### Créer une release production

```bash
# Localement
git tag v1.0.0
git push origin v1.0.0

# Ou via GitHub CLI
gh release create v1.0.0 --title "v1.0.0" --notes "First release"
```

### Voir les logs

```bash
# Sur le VPS
docker compose logs -f api
docker compose logs -f web
```

### Rollback

```bash
# Sur le VPS - revenir à une version spécifique
docker compose pull ghcr.io/vmarc64/le-copropri-taire/api:v1.0.0
docker compose up -d
```

## Configuration Nginx (optionnel)

Pour SSL avec Let's Encrypt :

```bash
# Créer le répertoire nginx
mkdir -p /opt/lecopro/nginx

# Installer certbot
sudo apt install certbot

# Obtenir le certificat
sudo certbot certonly --standalone -d uat.lecopro.fr -d api.uat.lecopro.fr

# Copier les certificats
sudo cp /etc/letsencrypt/live/uat.lecopro.fr/* /opt/lecopro/nginx/ssl/
```

## Monitoring

### Vérifier le statut

```bash
docker compose ps
docker compose stats
```

### Health checks

```bash
curl http://localhost:3002/  # API
curl http://localhost:3000/  # Web
```
