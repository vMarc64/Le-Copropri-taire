# UI & Design System — Le copropriétaire

## 1. Style général

| Propriété | Valeur |
|-----------|--------|
| Style | Fintech / Proptech, moderne, professionnel |
| Thème de base | **Dark mode** (Neutral) par défaut |
| Couleurs d'accent | 8 options (Neutral, Blue, Green, Orange, Red, Rose, Violet, Yellow) |
| Mode | Light / Dark (switch utilisateur) |
| Layout | Sidebar gauche + Header top |
| Breakpoint principal | Desktop first (1440px) |
| Responsive | Tablet (1024px), Mobile (640px) — à adapter |

---

## 2. Système de thème

### 2.1 Architecture

Le système utilise **shadcn/ui** avec le thème **Neutral** comme base. Les utilisateurs peuvent :
1. Choisir le mode (Light/Dark) - **Dark par défaut**
2. Choisir la couleur d'accent (8 options)

### 2.2 Couleurs d'accent disponibles

| Couleur | Valeur oklch (Dark) | Aperçu |
|---------|---------------------|--------|
| Neutral | `oklch(0.922 0 0)` | Gris clair |
| Blue | `oklch(0.546 0.245 262.881)` | 🔵 |
| Green | `oklch(0.723 0.219 149.579)` | 🟢 |
| Orange | `oklch(0.792 0.17 70.67)` | 🟠 |
| Red | `oklch(0.704 0.191 22.216)` | 🔴 |
| Rose | `oklch(0.76 0.175 11.844)` | 🌸 |
| Violet | `oklch(0.702 0.183 293.541)` | 🟣 |
| Yellow | `oklch(0.879 0.169 91.605)` | 🟡 |

### 2.3 Couleurs sémantiques (fixes)

Ces couleurs ne changent **jamais** avec le thème car elles ont une signification universelle :

| Statut | Usage | Couleur |
|--------|-------|---------|
| Success | Paiement OK, solde positif | `emerald-500/600` |
| Destructive | Erreurs, retards, impayés | Variable `--destructive` |
| Warning | Alertes, attente | `amber-500/600` |

### 2.4 Variables CSS (globals.css)

```css
/* Mode Dark par défaut (Neutral) */
:root {
  --radius: 0.625rem;
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

/* Mode Light */
.light {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... */
}

/* Couleurs d'accent (exemple Blue) */
[data-theme="blue"] {
  --primary: oklch(0.546 0.245 262.881);
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.546 0.245 262.881);
  --sidebar-primary: oklch(0.546 0.245 262.881);
}
```

### 2.5 Implémentation du sélecteur de thème

```tsx
// components/theme-toggle.tsx
const themeColors = [
  { name: "Neutral", value: "neutral", color: "#737373" },
  { name: "Blue", value: "blue", color: "#3b82f6" },
  { name: "Green", value: "green", color: "#22c55e" },
  { name: "Orange", value: "orange", color: "#f97316" },
  { name: "Red", value: "red", color: "#ef4444" },
  { name: "Rose", value: "rose", color: "#f43f5e" },
  { name: "Violet", value: "violet", color: "#8b5cf6" },
  { name: "Yellow", value: "yellow", color: "#eab308" },
];

// Le choix est persisté dans localStorage
// L'attribut data-theme est appliqué sur <html>
```

### 2.6 Usage dans les composants

```tsx
// ✅ Utiliser les variables de thème
<div className="bg-primary text-primary-foreground" />
<div className="bg-primary/10 text-primary" />
<Button>Texte</Button> // Utilise automatiquement --primary

// ✅ Couleurs sémantiques (fixes)
<span className="text-emerald-500">Paiement reçu</span>
<span className="text-destructive">En retard</span>

// ❌ NE PAS utiliser de couleurs hardcodées pour l'accent
<div className="bg-blue-600" /> // Mauvais
<div className="text-blue-500" /> // Mauvais
```

---

## 3. Typographie

| Élément | Font | Taille | Poids |
|---------|------|--------|-------|
| Font family | Inter (ou system-ui) | — | — |
| H1 (titre page) | Inter | 30px / 1.875rem | 700 (bold) |
| H2 (titre section) | Inter | 24px / 1.5rem | 600 (semibold) |
| H3 (titre card) | Inter | 18px / 1.125rem | 600 (semibold) |
| Body | Inter | 14px / 0.875rem | 400 (normal) |
| Body small | Inter | 12px / 0.75rem | 400 (normal) |
| Label | Inter | 14px / 0.875rem | 500 (medium) |
| Button | Inter | 14px / 0.875rem | 500 (medium) |

---

## 4. Espacements (Spacing)

Basé sur une échelle de 4px :

| Token | Valeur | Usage |
|-------|--------|-------|
| `xs` | 4px | Padding interne dense |
| `sm` | 8px | Gap entre éléments proches |
| `md` | 16px | Padding cards, espacement standard |
| `lg` | 24px | Sections, marges principales |
| `xl` | 32px | Espacement entre blocs |
| `2xl` | 48px | Marges de page |

---

## 5. Composants

### 5.1 Cards

| Propriété | Light | Dark |
|-----------|-------|------|
| Background | `surface` (white) | `surface` (gray-900) |
| Border | `border` (gray-200) | `border` (gray-700) |
| Shadow | `shadow-sm` | `shadow-md` (plus visible) |

```
- Border radius: 12px (rounded-xl)
- Padding: 16px (md) ou 24px (lg)
```

### 5.2 Boutons

| Variante | Light | Dark |
|----------|-------|------|
| **Primary** | bg-primary, text-white | bg-primary, text-white |
| **Secondary** | bg-white, border-gray-200, text-gray-700 | bg-gray-800, border-gray-700, text-gray-200 |
| **Ghost** | bg-transparent, text-gray-600, hover:bg-gray-100 | bg-transparent, text-gray-400, hover:bg-gray-800 |
| **Destructive** | bg-red-500, text-white | bg-red-600, text-white |

Tailles :
- `sm`: h-8, px-3, text-sm
- `md`: h-10, px-4, text-sm (défaut)
- `lg`: h-12, px-6, text-base

### 5.3 Badges (statuts)

| Statut | Light | Dark |
|--------|-------|------|
| OK / Payé / Actif | bg-green-50 text-green-600 | bg-green-950 text-green-400 |
| En attente / Pending | bg-amber-50 text-amber-600 | bg-amber-950 text-amber-400 |
| Impayé / Échec / Late | bg-red-50 text-red-600 | bg-red-950 text-red-400 |
| Info / SEPA | bg-blue-50 text-blue-600 | bg-blue-950 text-blue-400 |
| Neutre / None | bg-gray-100 text-gray-600 | bg-gray-800 text-gray-400 |

```
- Padding: px-2 py-1
- Border radius: rounded-full ou rounded-md
- Font size: text-xs
- Font weight: medium (500)
```

### 5.4 Tables

| Propriété | Light | Dark |
|-----------|-------|------|
| Header bg | gray-50 | gray-800 |
| Row bg | white | gray-900 |
| Row hover | gray-50 | gray-800 |
| Border | gray-100 | gray-700 |

```
- Header: font-medium, uppercase text-xs, text-secondary
- Cell padding: py-3 px-4
- Alignement: texte à gauche, montants à droite
```

### 5.5 Inputs / Forms

| Propriété | Light | Dark |
|-----------|-------|------|
| Background | white | gray-900 |
| Border | gray-300 | gray-600 |
| Border focus | primary | primary |
| Placeholder | gray-400 | gray-500 |

```
- Height: h-10
- Border radius: rounded-md
- Focus: ring-2 ring-primary/20, border-primary
- Label: au-dessus, font-medium, mb-1.5
```

### 5.6 Modals (Dialog)

| Propriété | Light | Dark |
|-----------|-------|------|
| Overlay | black/50 | black/70 |
| Container bg | white | gray-900 |
| Border | — | gray-700 (optionnel) |

```
- Border radius: rounded-xl
- Shadow: shadow-xl
- Width: sm (400px), md (500px), lg (600px), xl (800px)
- Padding: p-6
- Header: titre H3 + bouton close (X)
- Footer: boutons alignés à droite, gap-3
```

### 5.7 Side Panels (Sheet)

```
- Position: right
- Width: 480px (ou 50% selon le contenu)
- Animation: slide-in from right
- Background: surface (adapté au thème)
- Border-left: border (adapté au thème)
```

---

## 6. Layout

### 6.1 Sidebar (Navigation gauche)

| Propriété | Valeur |
|-----------|--------|
| Background | `bg-card` |
| Border right | `border-border` |
| Item hover | `hover:bg-muted` |
| Item active bg | `bg-primary/10` |
| Item active text | `text-primary` |

```
- Width: 260px (expanded), 72px (collapsed)
- Logo: en haut, h-16, bg-primary avec icon en text-primary-foreground
- Nav items:
  - Icon (20px) + Label
  - Padding: py-2.5 px-3
  - Border radius: rounded-xl
```

Navigation Property Manager (`/app`) :
- Dashboard
- Copropriétés
- Banque (optionnel global)
- Documents (optionnel global)
- Paramètres

### 6.2 Header (Top bar)

| Propriété | Valeur |
|-----------|--------|
| Background | `bg-card` |
| Border bottom | `border-border` |

```
- Height: 64px (h-16)
- Content:
  - Search bar (gauche ou centre) - bg-muted
  - Theme toggle (icône palette 🎨)
  - Notifications icon (optionnel)
  - User avatar (bg-primary/10, text-primary) + dropdown
```

### 6.3 Page content

```
- Background: background (adapté au thème)
- Padding: p-6 ou p-8
- Max-width: 1280px (optionnel, centré)
- Structure typique:
  1. Page header (titre + actions)
  2. KPI cards (grid)
  3. Table ou liste principale
```

---

## 7. Theme Switching

### 7.1 Implémentation (next-themes + custom)

```tsx
// app/layout.tsx
<ThemeProvider
  attribute="class"
  defaultTheme="dark"        // Dark mode par défaut
  enableSystem={false}       // Pas de détection système
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

### 7.2 Sélecteur de thème (ThemeToggle)

Le composant `ThemeToggle` permet de :
1. Changer le mode (Light/Dark)
2. Changer la couleur d'accent (8 options)

```tsx
// components/theme-toggle.tsx
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Mode selection */}
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Color selection */}
        {themeColors.map((color) => (
          <DropdownMenuItem onClick={() => setThemeColor(color.value)}>
            <span style={{ backgroundColor: color.color }} />
            {color.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 7.3 Hook useThemeColor

```tsx
export function useThemeColor() {
  const [themeColor, setThemeColorState] = useState<ThemeColor>("neutral");

  useEffect(() => {
    const stored = localStorage.getItem("theme-color");
    if (stored) {
      setThemeColorState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("theme-color", color);
    document.documentElement.setAttribute("data-theme", color === "neutral" ? "" : color);
  };

  return { themeColor, setThemeColor };
}
```

### 7.4 Persistance

| Donnée | Stockage | Clé |
|--------|----------|-----|
| Mode (light/dark) | localStorage | `theme` (géré par next-themes) |
| Couleur d'accent | localStorage | `theme-color` |

### 7.5 Attributs HTML

```html
<!-- Dark mode avec couleur Blue -->
<html class="dark" data-theme="blue">

<!-- Light mode avec Neutral (défaut) -->
<html class="light" data-theme="">
```

---

## 8. Patterns UX

### 8.1 Navigation

- **Changement de copropriété** → Navigation dans la sidebar ou breadcrumb
- **Actions secondaires** (settings, bank, documents) → Modals ou Side Panels
- **URLs toujours présentes** → Même si modal, l'URL change (shareable)

### 8.2 Modals vs Panels

| Type | Quand l'utiliser |
|------|-----------------|
| **Modal (Dialog)** | Formulaires courts, confirmations, création rapide |
| **Side Panel (Sheet)** | Listes, détails, contenu scrollable |
| **Pleine page** | Dashboard, profils complexes, vues principales |

### 8.3 Feedback utilisateur

- **Loading** : Skeleton loaders (adaptés au thème)
- **Empty states** : Illustration + message + CTA
- **Errors** : Toast notifications (coin supérieur droit)
- **Success** : Toast ou changement visuel immédiat

### 8.4 États visuels

| État | Indicateur |
|------|------------|
| Chargement | Skeleton (pulse) ou spinner dans le bouton |
| Désactivé | Opacity 50%, cursor not-allowed |
| Hover | Background change selon thème |
| Focus | Ring autour de l'élément |
| Sélectionné | Background primary-muted, border primary |

---

## 9. Icônes

- **Librairie** : Lucide Icons
- **Taille standard** : 20px (w-5 h-5)
- **Taille petite** : 16px (w-4 h-4)
- **Couleur** : currentColor (hérite du texte)

Icônes clés :
| Usage | Icône |
|-------|-------|
| Dashboard | `LayoutDashboard` |
| Copropriétés | `Building2` |
| Propriétaires | `Users` |
| Banque | `Landmark` |
| Documents | `FileText` |
| Paramètres | `Settings` |
| Paiements | `Receipt` |
| Recherche | `Search` |
| Notifications | `Bell` |
| Utilisateur | `CircleUser` |
| Thème/Couleurs | `Palette` |
| Mode light | `Sun` |
| Mode dark | `Moon` |

---

## 10. Responsive

| Breakpoint | Comportement |
|------------|--------------|
| Desktop (≥1280px) | Layout complet, sidebar expanded |
| Laptop (≥1024px) | Sidebar collapsed (icons only) |
| Tablet (≥768px) | Sidebar en drawer (hidden by default) |
| Mobile (<768px) | Header simplifié, bottom nav optionnel |

---

## 11. Stack technique

| Outil | Usage |
|-------|-------|
| **Tailwind CSS** | Styling utility-first |
| **shadcn/ui** | Composants accessibles (Radix-based) |
| **next-themes** | Gestion du thème light/dark |
| **Lucide Icons** | Icônes |
| **class-variance-authority** | Variants de composants |
| **tailwind-merge** | Merge des classes |

---

## TODO (optionnel)
- ~~Configurer les design tokens dans `tailwind.config.ts`~~ ✅ Fait via CSS variables
- ~~Implémenter le système de thème avec couleurs d'accent~~ ✅ Fait
- Créer un Storybook pour documenter les composants
- Définir les animations et transitions
- Ajouter des illustrations pour les empty states (adaptées au thème)
