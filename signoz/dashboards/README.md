# Dashboards SigNoz pour LeCopro API

Ce dossier contient les définitions JSON des dashboards SigNoz pour monitorer l'API LeCopro.

## Dashboards disponibles

| Fichier | Description |
|---------|-------------|
| [api-overview.json](api-overview.json) | Vue d'ensemble de l'API (requêtes/min, latences, erreurs, top endpoints) |
| [api-modules.json](api-modules.json) | Métriques par module (Auth, Owners, Condos, Payments, Bank, Documents) |
| [api-errors.json](api-errors.json) | Suivi détaillé des erreurs HTTP 4xx/5xx et exceptions |
| [api-database.json](api-database.json) | Monitoring des opérations base de données (Drizzle/PostgreSQL) |
| [api-auth.json](api-auth.json) | Authentification : logins, tokens, sessions, erreurs 401 |
| [api-business.json](api-business.json) | Métriques métier : créations d'entités, paiements, synchros bancaires |

## Configuration requise

Ces dashboards utilisent les traces OpenTelemetry envoyées par l'API NestJS avec le service name `lecopro-api`.

### Variables d'environnement API

```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://signoz-otel-collector:4318
OTEL_SERVICE_NAME=lecopro-api
```

## Import des dashboards

### Via l'UI SigNoz

1. Aller sur SigNoz → **Dashboards** → **New Dashboard** → **Import JSON**
2. Coller le contenu du fichier JSON
3. Cliquer sur **Import**

### Via l'API SigNoz

```bash
# Exemple avec curl
curl -X POST "https://signoz.uat.lecopro.fr/api/v1/dashboards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API_KEY>" \
  -d @api-overview.json
```

## Structure des dashboards

Chaque dashboard contient :

- **title** : Nom du dashboard
- **description** : Description
- **tags** : Tags pour le filtrage
- **layout** : Positionnement des widgets (grille 12 colonnes)
- **widgets** : Liste des panels avec leurs requêtes
- **variables** : Variables de dashboard (optionnel)

## Widgets types

| Type | Description |
|------|-------------|
| `value` | Valeur unique (métrique instantanée) |
| `graph` | Graphique timeline |
| `bar` | Graphique en barres |
| `pie` | Camembert |
| `table` | Tableau de données |

## Attributs OpenTelemetry utilisés

### Traces HTTP

- `service.name` : Nom du service (`lecopro-api`)
- `http.method` : Méthode HTTP (GET, POST, etc.)
- `http.route` : Route de l'endpoint
- `http.status_code` : Code HTTP de réponse
- `hasError` : Booléen indiquant une erreur
- `durationNano` : Durée en nanosecondes

### Traces Database

- `db.system` : Système de BDD (postgresql)
- `db.operation` : Type d'opération (SELECT, INSERT, etc.)
- `db.statement` : Requête SQL
- `db.sql.table` : Table concernée

### Exceptions

- `exception.type` : Type d'exception
- `exception.message` : Message d'erreur

## Thresholds

Les dashboards incluent des seuils colorés pour alerter visuellement :

- 🟢 **Vert** : Normal
- 🟡 **Jaune** : Attention
- 🔴 **Rouge** : Critique

### Exemples de seuils

| Métrique | Jaune | Rouge |
|----------|-------|-------|
| Taux d'erreur | > 1% | > 5% |
| Latence P95 | > 500ms | > 2s |
| Erreurs DB | > 0 | - |
| Erreurs 5xx | > 1 | > 10 |

## Personnalisation

Pour ajouter de nouveaux widgets :

1. Copier un widget existant similaire
2. Modifier l'`id` (unique)
3. Adapter les `filters` pour cibler les bonnes traces
4. Ajuster le `layout` pour le positionnement
5. Mettre à jour les `thresholds` si nécessaire
