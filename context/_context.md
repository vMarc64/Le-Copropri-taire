# Project Context Index — Le copropriétaire

Ce dossier contient les documents de référence du projet.  
Objectif : permettre à un agent IA (ou un nouveau dev) de comprendre rapidement **le produit**, **les rôles**, **les écrans**, **les routes** et **l’architecture**, et surtout **où trouver l’information** quand il en a besoin.

---

## Source of Truth (ordre de priorité)

1) **business_plan_plateforme_de_gestion_de_copropriete_paiements_suivi_bancaire.md**  
   - Vision produit + problématique + objectifs  
   - Périmètre fonctionnel (paiements SEPA/CB, open banking, rapprochement, charges variables)  
   - Sert à vérifier qu’une feature est cohérente avec le produit

2) **use_case.md**  
   - Liste des rôles + use cases par rôle  
   - Sert à valider qu’une page / route / feature répond à un besoin utilisateur réel  
   - À consulter avant de créer de nouvelles features

3) **routes.md**  
   - Routage applicatif par rôle (platform admin / manager / owner / tenant)  
   - Sert à décider “où ça vit” dans l’URL et comment structurer la navigation

4) **pages.md**  
   - Description des pages (écrans) + contenu UI attendu  
   - Sert à générer des maquettes (Figma) et à cadrer les composants UI

5) **architecture_project.md**  
   - Architecture technique (Option A SaaS multi-tenant)  
   - Stack choisie : Next.js (Front + BFF) + NestJS (API métier) + workers + DB + queue  
   - Sert à prendre des décisions techniques (où mettre la logique, comment scaler, multi-tenant)

6) **ui_design_system.md**  
   - Design system complet (couleurs, typo, espacements, composants)  
   - Support Light + Dark mode  
   - Stack UI : Tailwind + shadcn/ui + next-themes + Lucide Icons  
   - Sert à coder l'UI de manière cohérente

7) **todolist.md**  
   - Liste des tâches par domaine fonctionnel (Auth, Platform Admin, Manager, Portails, Bank, Documents, IA, Infrastructure)  
   - Suivi de l'avancement du projet  
   - Correspond aux milestones GitHub — vérifier la liste courante sur GitHub. Exemples de milestones actuellement utilisés :
     - Phase 1: Setup & Infrastructure
     - Phase 7: Integrations
     - Infrastructure
     - Auth & Users
     - Bank & Payments
     - IA & Automation
     - Manager Backoffice
     - Platform Admin
     - Portail Copropriétaire
     - Portail Locataire
     - No Milestone
   - À mettre à jour régulièrement

---

## Comment utiliser ces fichiers (guide IA / dev)

### Si tu dois…
- **Ajouter une nouvelle feature**
  1. Vérifie le besoin dans `use_case.md`
  2. Ajoute/ajuste la route dans `routes.md`
  3. Décris/ajuste l’écran dans `pages.md`
  4. Vérifie l’impact technique dans `architecture_project.md`

- **Créer des maquettes / UI**
  - Utilise `pages.md` en source principale
  - Utilise `routes.md` pour le nommage et la navigation
  - Utilise `use_case.md` pour les actions clés / CTA

- **Décider où vit une logique (BFF vs API)**
  - Règle d’or (voir `architecture_project.md`) :
    - Next (BFF) = orchestration / session / mapping UI
    - Nest (API) = logique métier + sécurité multi-tenant + DB + webhooks + workers

- **Clarifier un rôle ou une permission**
  - `use_case.md` est la référence
  - `routes.md` montre les zones accessibles (ex: `/platform`, `/app`, `/portal`, `/tenant`)

---

## Conventions importantes du projet

### Multi-tenant
- `tenant = property manager (gestionnaire)`
- Toute donnée métier est isolée par `tenant_id`
- Les rôles (RBAC) déterminent l’accès à chaque zone

### Zones de l’app
- `/platform/*` : Platform Admin (gestion des Property Managers uniquement)
- `/app/*` : Backoffice Property Manager
- `/portal/*` : Portail Copropriétaire
- `/tenant/*` : Portail Locataire

### Modals / Panels
- Certaines sous-pages de copro peuvent être rendues en modal/panel
- La route existe quand même (URL partageable), même si l’UI l’affiche en overlay

---

## Quand mettre à jour quoi ?

- Un nouveau parcours utilisateur → `use_case.md`
- Un nouvel écran → `pages.md`
- Une nouvelle URL / navigation → `routes.md`
- Un choix technique / infra / séparation des responsabilités → `architecture_project.md`
- Un changement de vision / scope produit → `business_plan_*.md`

---

## TODO (optionnel)
- Ajouter un fichier `glossary.md` (termes métier : copro, lot, tantièmes, appel de fonds, acompte, mandat SEPA, rapprochement…)
- Ajouter un fichier `data_model.md` (tables clés et relations + tenant_id)
