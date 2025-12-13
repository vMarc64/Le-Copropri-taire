# Todolist ‚Äî Le copropri√©taire

## L√©gende
- ‚¨ú √Ä faire
- Ì¥Ñ En cours
- ‚úÖ Termin√©
- ‚ùå Annul√© / Bloqu√©

---

## Ì¥ê Auth & Users

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚úÖ | Configurer authentification | Ì¥¥ Haute | JWT avec Passport | [#7](https://github.com/vMarc64/Le-Copropri-taire/issues/7) |
| ‚úÖ | Page Login | Ì¥¥ Haute | Formulaire fonctionnel | [#9](https://github.com/vMarc64/Le-Copropri-taire/issues/9) |
| ‚úÖ | Page Register (Property Manager) | Ì¥¥ Haute | Cr√©e tenant + user en DB | [#10](https://github.com/vMarc64/Le-Copropri-taire/issues/10) |
| ‚úÖ | Syst√®me RBAC (r√¥les) | Ì¥¥ Haute | platform_admin, manager, owner, resident | [#11](https://github.com/vMarc64/Le-Copropri-taire/issues/11) |
| ‚úÖ | Middleware multi-tenant | Ì¥¥ Haute | Isolation par tenant_id (PR #82) | [#12](https://github.com/vMarc64/Le-Copropri-taire/issues/12) |
| ‚úÖ | Guards par zone (/platform, /app, /portal, /resident) | Ì¥¥ Haute | ZoneGuard impl√©ment√© | [#13](https://github.com/vMarc64/Le-Copropri-taire/issues/13) |

---

## Ìø¢ Platform Admin

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚¨ú | Dashboard Platform Admin | Ìø° Moyenne | KPIs globaux (nb syndics, users, copros) | [#14](https://github.com/vMarc64/Le-Copropri-taire/issues/14) |
| ‚¨ú | Liste des Syndics (Frontend) | Ì¥¥ Haute | /platform/syndics | [#15](https://github.com/vMarc64/Le-Copropri-taire/issues/15) |
| ‚¨ú | Cr√©ation / √©dition Syndic | Ì¥¥ Haute | Modal ou page d√©di√©e | [#16](https://github.com/vMarc64/Le-Copropri-taire/issues/16) |
| ‚¨ú | API CRUD Syndics | Ì¥¥ Haute | GET/POST/PATCH/DELETE /platform/syndics | [#83](https://github.com/vMarc64/Le-Copropri-taire/issues/83) |
| ‚¨ú | API Gestion Managers | Ì¥¥ Haute | CRUD managers d'un syndic | [#84](https://github.com/vMarc64/Le-Copropri-taire/issues/84) |
| ‚¨ú | Gestion Managers d'un Syndic | Ì¥¥ Haute | /platform/syndics/[id]/managers | [#85](https://github.com/vMarc64/Le-Copropri-taire/issues/85) |

---

## Ì±î Manager Backoffice

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚¨ú | Layout (Sidebar + Header) | Ì¥¥ Haute | Composants r√©utilisables | [#17](https://github.com/vMarc64/Le-Copropri-taire/issues/17) |
| ‚¨ú | Dashboard Manager | Ì¥¥ Haute | KPIs, impay√©s | [#18](https://github.com/vMarc64/Le-Copropri-taire/issues/18) |
| ‚¨ú | Liste des copropri√©t√©s | Ì¥¥ Haute | | [#19](https://github.com/vMarc64/Le-Copropri-taire/issues/19) |
| ‚¨ú | Cr√©ation copropri√©t√© (modal) | Ì¥¥ Haute | | [#20](https://github.com/vMarc64/Le-Copropri-taire/issues/20) |
| ‚¨ú | Dashboard copropri√©t√© | Ì¥¥ Haute | | [#21](https://github.com/vMarc64/Le-Copropri-taire/issues/21) |
| ‚¨ú | Liste des propri√©taires (modal/panel) | Ì¥¥ Haute | | [#22](https://github.com/vMarc64/Le-Copropri-taire/issues/22) |
| ‚¨ú | Profil propri√©taire | Ì¥¥ Haute | Tabs: overview, payments, documents, consumption | [#23](https://github.com/vMarc64/Le-Copropri-taire/issues/23) |
| ‚¨ú | Gestion des lots | Ìø° Moyenne | | [#24](https://github.com/vMarc64/Le-Copropri-taire/issues/24) |
| ‚¨ú | Transactions bancaires (modal) | ÔøΩÔøΩ Moyenne | Vue open banking | [#25](https://github.com/vMarc64/Le-Copropri-taire/issues/25) |
| ‚¨ú | Rapprochement bancaire | Ìø° Moyenne | Matching transactions ‚Üî paiements | [#26](https://github.com/vMarc64/Le-Copropri-taire/issues/26) |
| ‚¨ú | Gestion documents | Ìø¢ Basse | Upload, cat√©gories | [#27](https://github.com/vMarc64/Le-Copropri-taire/issues/27) |
| ‚¨ú | Param√®tres copropri√©t√© | Ìø¢ Basse | | [#28](https://github.com/vMarc64/Le-Copropri-taire/issues/28) |
| ‚¨ú | Refonte design backoffice (sidebar, header, dashboard) | Ìø° Moyenne | | [#80](https://github.com/vMarc64/Le-Copropri-taire/issues/80) |

---

## Ìø† Portail Copropri√©taire

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚¨ú | Dashboard copropri√©taire | Ì¥¥ Haute | Balance, situation | [#29](https://github.com/vMarc64/Le-Copropri-taire/issues/29) |
| ‚¨ú | Historique des paiements | Ì¥¥ Haute | | [#30](https://github.com/vMarc64/Le-Copropri-taire/issues/30) |
| ‚¨ú | Documents accessibles | Ìø° Moyenne | | [#31](https://github.com/vMarc64/Le-Copropri-taire/issues/31) |
| ‚¨ú | Mandat SEPA (signature) | Ìø° Moyenne | | [#32](https://github.com/vMarc64/Le-Copropri-taire/issues/32) |
| ‚¨ú | Paiement CB (rattrapage) | Ìø¢ Basse | | [#33](https://github.com/vMarc64/Le-Copropri-taire/issues/33) |
| ‚¨ú | Suivi consommations | Ìø¢ Basse | Eau, chauffage, etc. | [#34](https://github.com/vMarc64/Le-Copropri-taire/issues/34) |
| ‚¨ú | Inscription automatique des copropri√©taires | Ìø° Moyenne | | [#79](https://github.com/vMarc64/Le-Copropri-taire/issues/79) |

---

## Ì¥ë Portail Locataire

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚¨ú | Dashboard locataire | Ìø¢ Basse | Vue simplifi√©e | [#35](https://github.com/vMarc64/Le-Copropri-taire/issues/35) |
| ‚¨ú | Consommations | Ìø¢ Basse | | [#36](https://github.com/vMarc64/Le-Copropri-taire/issues/36) |

---

## Ìø¶ Bank & Payments

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚¨ú | Int√©gration PSP (SEPA) | Ì¥¥ Haute | Pr√©l√®vements automatiques - Stripe SEPA mock pr√™t | [#37](https://github.com/vMarc64/Le-Copropri-taire/issues/37) |
| ‚¨ú | Int√©gration PSP (CB) | Ìø° Moyenne | Paiement rattrapage | [#38](https://github.com/vMarc64/Le-Copropri-taire/issues/38) |
| ‚úÖ | Int√©gration Open Banking | Ìø° Moyenne | Powens sandbox int√©gr√©, token exchange fonctionnel | [#39](https://github.com/vMarc64/Le-Copropri-taire/issues/39) |
| ‚¨ú | Webhooks PSP | Ì¥¥ Haute | Notifications paiements | [#40](https://github.com/vMarc64/Le-Copropri-taire/issues/40) |

---

## Ì≥Ñ Documents

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚¨ú | Gestion documents (Manager) | Ìø¢ Basse | Upload, cat√©gories | [#27](https://github.com/vMarc64/Le-Copropri-taire/issues/27) |
| ‚¨ú | Documents accessibles (Portail) | Ìø° Moyenne | | [#31](https://github.com/vMarc64/Le-Copropri-taire/issues/31) |

---

## Ì¥ñ IA & Automation

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚¨ú | Workers async (jobs critiques) | Ìø° Moyenne | SEPA batch, sync bank (BullMQ) | [#41](https://github.com/vMarc64/Le-Copropri-taire/issues/41) |
| ‚¨ú | Setup N8N + workflows IA | Ì¥¥ Haute | Rapprochement IA, emails, OCR | [#48](https://github.com/vMarc64/Le-Copropri-taire/issues/48) |

---

## ‚öôÔ∏è Infrastructure

| Statut | T√¢che | Priorit√© | Notes | Issue |
|--------|-------|----------|-------|-------|
| ‚úÖ | Setup projet Next.js (frontend + BFF) | Ì¥¥ Haute | App Router, TypeScript | [#1](https://github.com/vMarc64/Le-Copropri-taire/issues/1) |
| ‚úÖ | Setup projet NestJS (API m√©tier) | Ì¥¥ Haute | TypeScript, structure modulaire | [#2](https://github.com/vMarc64/Le-Copropri-taire/issues/2) |
| ‚úÖ | Configurer Tailwind + shadcn/ui | Ì¥¥ Haute | Design system tokens, th√®me Neutral | [#3](https://github.com/vMarc64/Le-Copropri-taire/issues/3) |
| ‚úÖ | Configurer next-themes (dark mode) | Ìø° Moyenne | Dark par d√©faut + 8 couleurs d'accent | [#4](https://github.com/vMarc64/Le-Copropri-taire/issues/4) |
| ‚úÖ | Setup PostgreSQL + Drizzle ORM | Ì¥¥ Haute | Schema multi-tenant, Supabase | [#5](https://github.com/vMarc64/Le-Copropri-taire/issues/5) |
| ‚¨ú | Setup Redis + BullMQ | Ìø° Moyenne | Workers async (d√©sactiv√© pour l'instant) | [#6](https://github.com/vMarc64/Le-Copropri-taire/issues/6) |
| ‚¨ú | Setup CI/CD | Ìø¢ Basse | GitHub Actions | [#8](https://github.com/vMarc64/Le-Copropri-taire/issues/8) |
| ‚¨ú | Tests unitaires | Ìø° Moyenne | | [#42](https://github.com/vMarc64/Le-Copropri-taire/issues/42) |
| ‚¨ú | Tests e2e | Ìø¢ Basse | | [#43](https://github.com/vMarc64/Le-Copropri-taire/issues/43) |
| ‚¨ú | Responsive mobile | Ìø° Moyenne | | [#44](https://github.com/vMarc64/Le-Copropri-taire/issues/44) |
| ‚¨ú | Performance / optimisation | Ìø¢ Basse | | [#45](https://github.com/vMarc64/Le-Copropri-taire/issues/45) |
| ‚¨ú | D√©ploiement production | Ì¥¥ Haute | | [#46](https://github.com/vMarc64/Le-Copropri-taire/issues/46) |
| ‚¨ú | Monitoring / logs | Ìø° Moyenne | | [#47](https://github.com/vMarc64/Le-Copropri-taire/issues/47) |
| ‚¨ú | Connecter les pages Frontend aux APIs Backend | Ì¥¥ Haute | | [#87](https://github.com/vMarc64/Le-Copropri-taire/issues/87) |

---

## Backlog (id√©es futures)

| T√¢che | Notes |
|-------|-------|
| Notifications push | |
| Export PDF relev√©s | |
| Multi-langue (i18n) | |
| App mobile (React Native) | |
| Tableau de bord analytics avanc√© | |

---

## Notes

- Mettre √† jour ce fichier au fur et √† mesure de l'avancement
- Priorit√©s : Ì¥¥ Haute | Ìø° Moyenne | Ìø¢ Basse
- Les milestones GitHub correspondent maintenant aux sections ci-dessus
