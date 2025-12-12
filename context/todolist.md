# Todolist — Le copropriétaire

## Légende
- ⬜ À faire
- 🔄 En cours
- ✅ Terminé
- ❌ Annulé / Bloqué

---

## Phase 1 : Setup & Infrastructure

| Statut | Tâche | Priorité | Notes |
|--------|-------|----------|-------|
| ⬜ | Setup projet Next.js (frontend + BFF) | 🔴 Haute | App Router, TypeScript |
| ⬜ | Setup projet NestJS (API métier) | 🔴 Haute | TypeScript, structure modulaire |
| ⬜ | Configurer Tailwind + shadcn/ui | 🔴 Haute | Design system tokens |
| ⬜ | Configurer next-themes (dark mode) | 🟡 Moyenne | |
| ⬜ | Setup PostgreSQL + Prisma | 🔴 Haute | Schema multi-tenant |
| ⬜ | Setup Redis + BullMQ | 🟡 Moyenne | Workers async |
| ⬜ | Configurer authentification | 🔴 Haute | JWT / Sessions |
| ⬜ | Setup CI/CD | 🟢 Basse | GitHub Actions |

---

## Phase 2 : Auth & Multi-tenant

| Statut | Tâche | Priorité | Notes |
|--------|-------|----------|-------|
| ⬜ | Page Login | 🔴 Haute | |
| ⬜ | Page Register (Property Manager) | 🔴 Haute | |
| ⬜ | Système RBAC (rôles) | 🔴 Haute | platform_admin, manager, owner, tenant |
| ⬜ | Middleware multi-tenant | 🔴 Haute | Isolation par tenant_id |
| ⬜ | Guards par zone (/platform, /app, /portal, /tenant) | 🔴 Haute | |

---

## Phase 3 : Platform Admin

| Statut | Tâche | Priorité | Notes |
|--------|-------|----------|-------|
| ⬜ | Dashboard Platform Admin | 🟡 Moyenne | KPIs globaux |
| ⬜ | Liste des Property Managers | 🟡 Moyenne | |
| ⬜ | Création / édition Property Manager | 🟡 Moyenne | |

---

## Phase 4 : Backoffice Property Manager

| Statut | Tâche | Priorité | Notes |
|--------|-------|----------|-------|
| ⬜ | Layout (Sidebar + Header) | 🔴 Haute | Composants réutilisables |
| ⬜ | Dashboard Manager | 🔴 Haute | KPIs, impayés |
| ⬜ | Liste des copropriétés | 🔴 Haute | |
| ⬜ | Création copropriété (modal) | 🔴 Haute | |
| ⬜ | Dashboard copropriété | 🔴 Haute | |
| ⬜ | Liste des propriétaires (modal/panel) | 🔴 Haute | |
| ⬜ | Profil propriétaire | 🔴 Haute | Tabs: overview, payments, documents, consumption |
| ⬜ | Gestion des lots | 🟡 Moyenne | |
| ⬜ | Transactions bancaires (modal) | 🟡 Moyenne | Vue open banking |
| ⬜ | Rapprochement bancaire | 🟡 Moyenne | Matching transactions ↔ paiements |
| ⬜ | Gestion documents | 🟢 Basse | Upload, catégories |
| ⬜ | Paramètres copropriété | 🟢 Basse | |

---

## Phase 5 : Portail Copropriétaire

| Statut | Tâche | Priorité | Notes |
|--------|-------|----------|-------|
| ⬜ | Dashboard copropriétaire | 🔴 Haute | Balance, situation |
| ⬜ | Historique des paiements | 🔴 Haute | |
| ⬜ | Documents accessibles | 🟡 Moyenne | |
| ⬜ | Mandat SEPA (signature) | 🟡 Moyenne | |
| ⬜ | Paiement CB (rattrapage) | 🟢 Basse | |
| ⬜ | Suivi consommations | 🟢 Basse | Eau, chauffage, etc. |

---

## Phase 6 : Portail Locataire

| Statut | Tâche | Priorité | Notes |
|--------|-------|----------|-------|
| ⬜ | Dashboard locataire | 🟢 Basse | Vue simplifiée |
| ⬜ | Consommations | 🟢 Basse | |

---

## Phase 7 : Intégrations

| Statut | Tâche | Priorité | Notes |
|--------|-------|----------|-------|
| ⬜ | Intégration PSP (SEPA) | 🔴 Haute | Prélèvements automatiques |
| ⬜ | Intégration PSP (CB) | 🟡 Moyenne | Paiement rattrapage |
| ⬜ | Intégration Open Banking | 🟡 Moyenne | Sync comptes bancaires |
| ⬜ | Webhooks PSP | 🔴 Haute | Notifications paiements |
| ⬜ | Workers async (jobs) | 🟡 Moyenne | SEPA batch, sync bank, notifs |

---

## Phase 8 : Polish & Production

| Statut | Tâche | Priorité | Notes |
|--------|-------|----------|-------|
| ⬜ | Tests unitaires | 🟡 Moyenne | |
| ⬜ | Tests e2e | 🟢 Basse | |
| ⬜ | Responsive mobile | 🟡 Moyenne | |
| ⬜ | Performance / optimisation | 🟢 Basse | |
| ⬜ | Déploiement production | 🔴 Haute | |
| ⬜ | Monitoring / logs | 🟡 Moyenne | |

---

## Backlog (idées futures)

| Tâche | Notes |
|-------|-------|
| Notifications push | |
| Export PDF relevés | |
| Multi-langue (i18n) | |
| App mobile (React Native) | |
| Tableau de bord analytics avancé | |

---

## Notes

- Mettre à jour ce fichier au fur et à mesure de l'avancement
- Priorités : 🔴 Haute | 🟡 Moyenne | 🟢 Basse
