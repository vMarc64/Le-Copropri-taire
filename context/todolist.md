# Todolist — Le copropriétaire

## Légende
- ⬜ À faire
- 🔄 En cours
- ✅ Terminé
- ❌ Annulé / Bloqué

---

## Phase 1 : Setup & Infrastructure

| Statut | Tâche | Priorité | Notes | Issue |
|--------|-------|----------|-------|-------|
| ✅ | Setup projet Next.js (frontend + BFF) | 🔴 Haute | App Router, TypeScript | [#1](https://github.com/vMarc64/Le-Copropri-taire/issues/1) |
| ✅ | Setup projet NestJS (API métier) | 🔴 Haute | TypeScript, structure modulaire | [#2](https://github.com/vMarc64/Le-Copropri-taire/issues/2) |
| ✅ | Configurer Tailwind + shadcn/ui | 🔴 Haute | Design system tokens, thème Neutral | [#3](https://github.com/vMarc64/Le-Copropri-taire/issues/3) |
| ✅ | Configurer next-themes (dark mode) | 🟡 Moyenne | Dark par défaut + 8 couleurs d'accent | [#4](https://github.com/vMarc64/Le-Copropri-taire/issues/4) |
| ✅ | Setup PostgreSQL + Drizzle ORM | 🔴 Haute | Schema multi-tenant, Supabase | [#5](https://github.com/vMarc64/Le-Copropri-taire/issues/5) |
| ⬜ | Setup Redis + BullMQ | 🟡 Moyenne | Workers async (désactivé pour l'instant) | [#6](https://github.com/vMarc64/Le-Copropri-taire/issues/6) |
| ✅ | Configurer authentification | 🔴 Haute | JWT avec Passport | [#7](https://github.com/vMarc64/Le-Copropri-taire/issues/7) |
| ⬜ | Setup CI/CD | 🟢 Basse | GitHub Actions | [#8](https://github.com/vMarc64/Le-Copropri-taire/issues/8) |

---

## Phase 2 : Auth & Multi-tenant

| Statut | Tâche | Priorité | Notes | Issue |
|--------|-------|----------|-------|-------|
| ✅ | Page Login | 🔴 Haute | Formulaire fonctionnel | [#9](https://github.com/vMarc64/Le-Copropri-taire/issues/9) |
| ✅ | Page Register (Property Manager) | 🔴 Haute | Crée tenant + user en DB | [#10](https://github.com/vMarc64/Le-Copropri-taire/issues/10) |
| ✅ | Système RBAC (rôles) | 🔴 Haute | platform_admin, manager, owner, resident | [#11](https://github.com/vMarc64/Le-Copropri-taire/issues/11) |
| ✅ | Middleware multi-tenant | 🔴 Haute | Isolation par tenant_id (PR #82) | [#12](https://github.com/vMarc64/Le-Copropri-taire/issues/12) |
| ✅ | Guards par zone (/platform, /app, /portal, /resident) | 🔴 Haute | ZoneGuard implémenté | [#13](https://github.com/vMarc64/Le-Copropri-taire/issues/13) |

---

## Phase 3 : Platform Admin (Gestion des Syndics)

| Statut | Tâche | Priorité | Notes | Issue |
|--------|-------|----------|-------|-------|
| ⬜ | Dashboard Platform Admin | 🟡 Moyenne | KPIs globaux (nb syndics, users, copros) | [#14](https://github.com/vMarc64/Le-Copropri-taire/issues/14) |
| ⬜ | API CRUD Syndics | 🔴 Haute | GET/POST/PATCH/DELETE /platform/syndics | [#83](https://github.com/vMarc64/Le-Copropri-taire/issues/83) |
| ⬜ | API Gestion Managers | 🔴 Haute | CRUD managers d'un syndic | [#84](https://github.com/vMarc64/Le-Copropri-taire/issues/84) |
| ⬜ | Liste des Syndics (Frontend) | 🔴 Haute | /platform/syndics | [#15](https://github.com/vMarc64/Le-Copropri-taire/issues/15) |
| ⬜ | Création / édition Syndic | 🔴 Haute | Modal ou page dédiée | [#16](https://github.com/vMarc64/Le-Copropri-taire/issues/16) |
| ⬜ | Gestion Managers d'un Syndic | 🔴 Haute | /platform/syndics/[id]/managers | [#85](https://github.com/vMarc64/Le-Copropri-taire/issues/85) |

---

## Phase 4 : Backoffice Property Manager

| Statut | Tâche | Priorité | Notes | Issue |
|--------|-------|----------|-------|-------|
| ⬜ | Layout (Sidebar + Header) | 🔴 Haute | Composants réutilisables | [#17](https://github.com/vMarc64/Le-Copropri-taire/issues/17) |
| ⬜ | Dashboard Manager | 🔴 Haute | KPIs, impayés | [#18](https://github.com/vMarc64/Le-Copropri-taire/issues/18) |
| ⬜ | Liste des copropriétés | 🔴 Haute | | [#19](https://github.com/vMarc64/Le-Copropri-taire/issues/19) |
| ⬜ | Création copropriété (modal) | 🔴 Haute | | [#20](https://github.com/vMarc64/Le-Copropri-taire/issues/20) |
| ⬜ | Dashboard copropriété | 🔴 Haute | | [#21](https://github.com/vMarc64/Le-Copropri-taire/issues/21) |
| ⬜ | Liste des propriétaires (modal/panel) | 🔴 Haute | | [#22](https://github.com/vMarc64/Le-Copropri-taire/issues/22) |
| ⬜ | Profil propriétaire | 🔴 Haute | Tabs: overview, payments, documents, consumption | [#23](https://github.com/vMarc64/Le-Copropri-taire/issues/23) |
| ⬜ | Gestion des lots | 🟡 Moyenne | | [#24](https://github.com/vMarc64/Le-Copropri-taire/issues/24) |
| ⬜ | Transactions bancaires (modal) | 🟡 Moyenne | Vue open banking | [#25](https://github.com/vMarc64/Le-Copropri-taire/issues/25) |
| ⬜ | Rapprochement bancaire | 🟡 Moyenne | Matching transactions ↔ paiements | [#26](https://github.com/vMarc64/Le-Copropri-taire/issues/26) |
| ⬜ | Gestion documents | 🟢 Basse | Upload, catégories | [#27](https://github.com/vMarc64/Le-Copropri-taire/issues/27) |
| ⬜ | Paramètres copropriété | 🟢 Basse | | [#28](https://github.com/vMarc64/Le-Copropri-taire/issues/28) |

---

## Phase 5 : Portail Copropriétaire

| Statut | Tâche | Priorité | Notes | Issue |
|--------|-------|----------|-------|-------|
| ⬜ | Dashboard copropriétaire | 🔴 Haute | Balance, situation | [#29](https://github.com/vMarc64/Le-Copropri-taire/issues/29) |
| ⬜ | Historique des paiements | 🔴 Haute | | [#30](https://github.com/vMarc64/Le-Copropri-taire/issues/30) |
| ⬜ | Documents accessibles | 🟡 Moyenne | | [#31](https://github.com/vMarc64/Le-Copropri-taire/issues/31) |
| ⬜ | Mandat SEPA (signature) | 🟡 Moyenne | | [#32](https://github.com/vMarc64/Le-Copropri-taire/issues/32) |
| ⬜ | Paiement CB (rattrapage) | 🟢 Basse | | [#33](https://github.com/vMarc64/Le-Copropri-taire/issues/33) |
| ⬜ | Suivi consommations | 🟢 Basse | Eau, chauffage, etc. | [#34](https://github.com/vMarc64/Le-Copropri-taire/issues/34) |

---

## Phase 6 : Portail Résident (Locataire)

| Statut | Tâche | Priorité | Notes | Issue |
|--------|-------|----------|-------|-------|
| ⬜ | Dashboard résident | 🟢 Basse | Vue simplifiée | [#35](https://github.com/vMarc64/Le-Copropri-taire/issues/35) |
| ⬜ | Consommations | 🟢 Basse | | [#36](https://github.com/vMarc64/Le-Copropri-taire/issues/36) |

---

## Phase 7 : Intégrations

| Statut | Tâche | Priorité | Notes | Issue |
|--------|-------|----------|-------|-------|
| ⬜ | Intégration PSP (SEPA) | 🔴 Haute | Prélèvements automatiques - Stripe SEPA mock prêt | [#37](https://github.com/vMarc64/Le-Copropri-taire/issues/37) |
| ⬜ | Intégration PSP (CB) | 🟡 Moyenne | Paiement rattrapage | [#38](https://github.com/vMarc64/Le-Copropri-taire/issues/38) |
| ✅ | Intégration Open Banking | 🟡 Moyenne | Powens sandbox intégré, token exchange fonctionnel | [#39](https://github.com/vMarc64/Le-Copropri-taire/issues/39) |
| ⬜ | Webhooks PSP | 🔴 Haute | Notifications paiements | [#40](https://github.com/vMarc64/Le-Copropri-taire/issues/40) |
| ⬜ | Workers async (jobs critiques) | 🟡 Moyenne | SEPA batch, sync bank (BullMQ) | [#41](https://github.com/vMarc64/Le-Copropri-taire/issues/41) |
| ⬜ | Setup N8N + workflows IA | 🔴 Haute | Rapprochement IA, emails, OCR | [#48](https://github.com/vMarc64/Le-Copropri-taire/issues/48) |

---

## Phase 8 : Polish & Production

| Statut | Tâche | Priorité | Notes | Issue |
|--------|-------|----------|-------|-------|
| ⬜ | Tests unitaires | 🟡 Moyenne | | [#42](https://github.com/vMarc64/Le-Copropri-taire/issues/42) |
| ⬜ | Tests e2e | 🟢 Basse | | [#43](https://github.com/vMarc64/Le-Copropri-taire/issues/43) |
| ⬜ | Responsive mobile | 🟡 Moyenne | | [#44](https://github.com/vMarc64/Le-Copropri-taire/issues/44) |
| ⬜ | Performance / optimisation | 🟢 Basse | | [#45](https://github.com/vMarc64/Le-Copropri-taire/issues/45) |
| ⬜ | Déploiement production | 🔴 Haute | | [#46](https://github.com/vMarc64/Le-Copropri-taire/issues/46) |
| ⬜ | Monitoring / logs | 🟡 Moyenne | | [#47](https://github.com/vMarc64/Le-Copropri-taire/issues/47) |

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
