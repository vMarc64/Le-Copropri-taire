# Le Copropriétaire

Plateforme SaaS de gestion des flux financiers de copropriété.

## 🏗️ Architecture

```
lecopro/
├── apps/
│   ├── web/          # Next.js (Frontend + BFF)
│   └── api/          # NestJS (API métier)
├── packages/         # Packages partagés (à venir)
└── context/          # Documentation projet
```

## 🚀 Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend + BFF | Next.js 14 (App Router) + TypeScript |
| API métier | NestJS + TypeScript |
| Base de données | PostgreSQL + Prisma |
| Queue / Workers | Redis + BullMQ |
| UI | Tailwind CSS + shadcn/ui |

## 📦 Prérequis

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL
- Redis (optionnel pour le dev initial)

## 🛠️ Installation

```bash
# Installer pnpm si nécessaire
npm install -g pnpm

# Installer les dépendances
pnpm install

# Lancer en développement
pnpm dev
```

## 📁 Documentation

Voir le dossier `/context` pour :
- Business plan et vision produit
- Use cases et rôles utilisateurs
- Routes et pages
- Architecture technique
- Design system UI

## 🔐 Rôles utilisateurs

| Rôle | Zone | Description |
|------|------|-------------|
| Platform Admin | `/platform/*` | Gestion des Property Managers |
| Property Manager | `/app/*` | Backoffice complet |
| Owner (Copropriétaire) | `/portal/*` | Portail propriétaire |
| Tenant (Locataire) | `/tenant/*` | Portail simplifié |

## 📄 License

Propriétaire - Tous droits réservés
