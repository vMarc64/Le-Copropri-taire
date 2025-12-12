| Paiements (SEPA) | ~840 € |# Business plan – Plateforme de gestion de copropriété

## 1. Résumé exécutif

Le projet consiste à créer une **plateforme numérique de gestion des flux financiers de copropriété**, destinée aux **syndics / entreprises de gestion** et aux **copropriétés / copropriétaires**.

L’objectif est de résoudre un problème très répandu en France :
- paiements manuels (virements trimestriels),
- acomptes mal ajustés,
- manque de visibilité sur les comptes,
- difficultés de suivi des charges variables (eau, chauffage, gaz, eau chaude, électricité),
- impayés détectés trop tard.

La plateforme apporte :
- des **acomptes mensuels automatisés par prélèvement SEPA**,
- un **portail copropriétaire** clair et transparent,
- une **vue bancaire en temps quasi réel** via Open Banking,
- un **suivi précis des charges variables** (eau, chauffage, gaz, eau chaude, électricité),
- une réduction des impayés et des conflits.

Le modèle économique repose sur une **double facturation équilibrée** :
- une part faible et acceptable facturée à la copropriété,
- une part facturée à l’entreprise de gestion pour l’outil métier.

---

## 2. Problème identifié

### Côté copropriétaires
- Peu de visibilité sur les dépenses réelles
- Régularisations tardives et mal comprises
- Paiements peu flexibles
- Sentiment d’injustice sur les charges variables (eau, chauffage, etc.)

### Côté syndics / gestionnaires
- Suivi manuel chronophage
- Difficulté à savoir rapidement qui est à jour
- Rapprochement bancaire long et source d’erreurs
- Peu ou pas d’outils modernes

---

## 3. Solution proposée

Une application web unique, utilisée par le gestionnaire, avec un accès portail pour les copropriétaires.

### Fonctionnalités clés
- Prélèvements automatiques SEPA (acomptes mensuels)
- Paiement CB uniquement en rattrapage (optionnel)
- Portail copropriétaire (acomptes, paiements, historique)
- Connexion bancaire automatique (Open Banking)
- Vue temps réel des comptes par copropriété
- Rapprochement bancaire assisté
- Suivi des charges variables (eau, chauffage, gaz, eau chaude, électricité)

---

## 4. Clients cibles

### 1. Copropriétés
- Bénéficient de la transparence et du suivi
- Coût faible intégré aux charges

### 2. Entreprises de gestion / syndics
- Utilisent l’outil au quotidien
- Gagnent du temps et réduisent les impayés
- Améliorent la qualité de service

---

## 5. Modèle économique

### A. Facturation aux copropriétés

La copropriété finance le **service rendu aux copropriétaires** : portail, transparence, suivi des charges, accès aux comptes et paiements simplifiés.

#### Proposition de tarification

La facturation à la copropriété est **proportionnelle au nombre de lots (unités de facturation)** afin de rester équitable et alignée sur les coûts réels (mandats SEPA, paiements, support).

**Définition d’un lot** : appartement, parking, cave ou tout lot générant des appels de fonds.

**Grille proposée** :
- **3 € / mois / lot** (facturation trimestrielle)
  - soit **9 € / trimestre / lot**
  - soit **36 € / an / lot**

**Exemples** :
- Copro de 10 lots → **90 € / trimestre** (360 € / an)
- Copro de 30 lots → **270 € / trimestre** (1 080 € / an)
- Copro de 100 lots → **900 € / trimestre** (3 600 € / an)

👉 Ce modèle est équitable : plus il y a de lots (mandats SEPA, paiements, volumes), plus la contribution est proportionnée.

⚠️ Les frais de paiement par carte bancaire (CB) sont **refacturés uniquement aux copropriétaires qui utilisent ce moyen**.

⚠️ Les frais de paiement par carte bancaire (CB) sont **refacturés uniquement aux copropriétaires qui utilisent ce moyen**.

---

### B. Facturation aux entreprises de gestion

Modèle par paliers, scalable :

| Nombre de copropriétés | Prix mensuel |
|----------------------|--------------|
| Jusqu’à 10 | 49 € |
| Jusqu’à 25 | 89 € |
| Jusqu’à 50 | 149 € |
| Jusqu’à 100 | 249 € |

---

## 6. Modèle financier – logique simplifiée (facturation & coûts éditeur)

### Hypothèses de base
- 1 copropriété = **10 lots**
- 1 syndic = **20 copropriétés** (soit **200 lots**)
- Facturation copropriétaires : **3 € / mois / lot**
- Abonnement syndic : **89 € / mois** (palier ≤25 copro)

---

## 7. Coûts facturés (ce que paient réellement les clients)

⚠️ **Cadre TVA** :
- L’éditeur est une société **basée en Andorre**.
- Les clients sont **en France**.
- Les services numériques sont soumis aux règles de TVA européennes.

👉 Hypothèses retenues :
- **Copropriétaires / copropriétés (B2C)** : prix **TTC**, TVA française **20 % incluse**.
- **Syndic / entreprise de gestion (B2B)** : prix **HT**, TVA autoliquidée par le client (reverse charge).

---

### A. Coût réel par copropriétaire (1 lot – B2C)

- **3 € / mois / lot TTC**
  - soit **2,50 € HT**
  - **0,50 € de TVA (20 %)**

| Période | TTC | HT | TVA |
|--------|-----|----|-----|
| Mensuel | 3 € | 2,50 € | 0,50 € |
| Trimestriel | 9 € | 7,50 € | 1,50 € |
| Annuel | 36 € | 30 € | 6 € |

👉 Le prix affiché et voté en AG est **TTC**.

---

### B. Coût réel pour une copropriété (10 lots – B2C)

| Période | TTC | HT | TVA |
|--------|-----|----|-----|
| Mensuel | 30 € | 25 € | 5 € |
| Trimestriel | 90 € | 75 € | 15 € |
| Annuel | 360 € | 300 € | 60 € |

---

### C. Coût réel pour le syndic (B2B)

- **Abonnement logiciel : 89 € / mois HT**
- TVA : **autoliquidation (reverse charge)**

| Période | Montant |
|--------|---------|
| Mensuel | 89 € HT |
| Annuel | 1 068 € HT |

--------|-----------------|
| Mensuel | **3 €** |
| Trimestriel | **9 €** |
| Annuel | **36 €** |

👉 Inclut : portail, paiements SEPA, suivi bancaire, suivi des charges variables.

---

### B. Coût réel pour une copropriété (10 lots)

| Période | Montant facturé |
|--------|-----------------|
| Mensuel | **30 €** |
| Trimestriel | **90 €** |
| Annuel | **360 €** |

---

### C. Coût réel pour le syndic

| Poste | Montant |
|-----|---------|
| Abonnement logiciel | **89 € / mois** |
| **Total annuel** | **1 068 € / an** |

👉 Le syndic paie **uniquement l’outil métier**, pas les coûts SEPA / bancaires.

---

## 8. Recettes de l’éditeur (hors TVA)

👉 Les recettes ci-dessous sont exprimées **HT**, la TVA collectée étant reversée à l’administration fiscale.

### A. Recettes issues des copropriétaires (B2C)

- 200 lots × **30 € HT / an** = **6 000 € HT / an**

(TVA collectée : 1 200 €)

---

### B. Recettes issues du syndic (B2B)

- Abonnement : **1 068 € HT / an**

---

👉 **Recettes totales éditeur : 7 068 € HT / an**

---

## 9. Coûts réels de l’éditeur (internes)

### A. Coûts variables liés à l’usage

#### Prélèvements SEPA
- 0,35 € / prélèvement
- 12 prélèvements / an / lot
- **4,20 € / an / lot**
- Pour 200 lots : **840 € / an**

#### Open Banking
- 1 compte bancaire / copropriété
- 3 € / mois / compte
- Pour 20 copropriétés : **720 € / an**

---

### B. Coûts fixes d’administration

| Poste | Annuel |
|-----|--------|
| Hébergement / infra | 300 € |
| **Total coûts fixes** | **300 €** |

---

### C. Coût total éditeur

| Poste | Annuel |
|-----|--------|
| Coûts variables (SEPA + banking) | 1 560 € |
| Coûts fixes | 300 € |
| **Total** | **1 860 € / an** |

---

## 10. Rentabilité de l’éditeur (hors TVA)

| Période | Résultat |
|--------|----------|
| Mensuel | **~435 €** |
| Trimestriel | **~1 305 €** |
| Annuel | **~5 208 €** |

Calcul :
- Recettes HT : 7 068 €
- Coûts éditeur : 1 860 €
- **Résultat net avant impôt : ~5 200 € / an**

---

## 11. Fiscalité – Société en Andorre

### Structure juridique
- Société éditrice basée en **Andorre**
- Activité : édition de logiciel / services numériques

### Impôt sur les sociétés
- Taux d’imposition : **10 %**

Sur la base du résultat net avant impôt :
- Résultat : **5 208 €**
- IS Andorre (10 %) : **~520 €**

👉 **Résultat distribuable : ~4 688 € / an**

### Dividendes
- Dirigeant et associé unique **résident fiscal andorran**
- Dividendes : **0 % d’imposition personnelle**

👉 **Revenu net personnel : ~4 700 € / an**

⚠️ Hypothèse clé : respect de la substance économique et de la résidence fiscale en Andorre.

---

## 12. Scénarios de montée en charge

### Scénario A – 50 copropriétés (500 lots)

**Recettes**
- Copropriétaires : 500 × 30 € HT = **15 000 €**
- Syndic : abonnement palier ≤50 copro = **149 € / mois** → **1 788 € / an**

👉 **Total recettes : 16 788 € HT / an**

**Coûts éditeur**
- SEPA : 500 × 4,20 € = **2 100 €**
- Open Banking : 50 × 36 € = **1 800 €**
- Infrastructure : **400 €**

👉 **Total coûts : 4 300 € / an**

**Résultat avant IS** : **~12 488 €**
- IS Andorre (10 %) : **~1 249 €**
- **Net distribué : ~11 239 € / an**

---

### Scénario B – 100 copropriétés (1 000 lots)

**Recettes**
- Copropriétaires : 1 000 × 30 € HT = **30 000 €**
- Syndic : abonnement palier ≤100 copro = **249 € / mois** → **2 988 € / an**

👉 **Total recettes : 32 988 € HT / an**

**Coûts éditeur**
- SEPA : 1 000 × 4,20 € = **4 200 €**
- Open Banking : 100 × 36 € = **3 600 €**
- Infrastructure : **600 €**

👉 **Total coûts : 8 400 € / an**

**Résultat avant IS** : **~24 588 €**
- IS Andorre (10 %) : **~2 459 €**
- **Net distribué : ~22 129 € / an**

---

## 13. Lecture globale de cohérence

- Le modèle est **rentable dès 20 copropriétés**
- Les coûts sont **strictement proportionnels à l’usage**
- La marge augmente avec l’échelle
- La fiscalité andorrane renforce la viabilité long terme
- Le pricing reste acceptable pour les copropriétés

---

## 14. Conclusion générale

Le projet présente :
- un problème réel et identifié
- une solution simple et moderne
- un modèle économique équitable
- une rentabilité progressive et maîtrisée
- une structure fiscale légale et optimisée

La plateforme peut être lancée progressivement, avec une montée en charge sécurisée et sans effet de seuil dangereux.

---

