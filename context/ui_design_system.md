# UI & Design System — Le copropriétaire

## 1. Style général

| Propriété | Valeur |
|-----------|--------|
| Style | Fintech / Proptech, moderne, professionnel |
| Thème | Light + Dark (switch utilisateur ou système) |
| Layout | Sidebar gauche + Header top |
| Breakpoint principal | Desktop first (1440px) |
| Responsive | Tablet (1024px), Mobile (640px) — à adapter |

---

## 2. Couleurs

### 2.1 Palette principale

| Token | Light | Dark |
|-------|-------|------|
| `background` | Gray 50 `#F9FAFB` | Gray 950 `#030712` |
| `surface` | White `#FFFFFF` | Gray 900 `#111827` |
| `surface-elevated` | White `#FFFFFF` | Gray 800 `#1F2937` |
| `border` | Gray 200 `#E5E7EB` | Gray 700 `#374151` |
| `border-muted` | Gray 100 `#F3F4F6` | Gray 800 `#1F2937` |
| `text-primary` | Gray 900 `#111827` | Gray 50 `#F9FAFB` |
| `text-secondary` | Gray 500 `#6B7280` | Gray 400 `#9CA3AF` |
| `text-muted` | Gray 400 `#9CA3AF` | Gray 500 `#6B7280` |

### 2.2 Accent (Primary)

| Token | Light | Dark |
|-------|-------|------|
| `primary` | Blue 600 `#2563EB` | Blue 500 `#3B82F6` |
| `primary-hover` | Blue 700 `#1D4ED8` | Blue 400 `#60A5FA` |
| `primary-muted` | Blue 50 `#EFF6FF` | Blue 950 `#172554` |
| `primary-foreground` | White `#FFFFFF` | White `#FFFFFF` |

### 2.3 Couleurs sémantiques (statuts)

| Statut | Light bg | Light text | Dark bg | Dark text |
|--------|----------|------------|---------|-----------|
| `success` | Green 50 `#F0FDF4` | Green 600 `#16A34A` | Green 950 `#052E16` | Green 400 `#4ADE80` |
| `warning` | Amber 50 `#FFFBEB` | Amber 600 `#D97706` | Amber 950 `#451A03` | Amber 400 `#FBBF24` |
| `error` | Red 50 `#FEF2F2` | Red 600 `#DC2626` | Red 950 `#450A0A` | Red 400 `#F87171` |
| `info` | Blue 50 `#EFF6FF` | Blue 600 `#2563EB` | Blue 950 `#172554` | Blue 400 `#60A5FA` |

### 2.4 CSS Variables (Tailwind)

```css
/* globals.css */
@layer base {
  :root {
    --background: 249 250 251;        /* gray-50 */
    --surface: 255 255 255;           /* white */
    --surface-elevated: 255 255 255;
    --border: 229 231 235;            /* gray-200 */
    --text-primary: 17 24 39;         /* gray-900 */
    --text-secondary: 107 114 128;    /* gray-500 */
    --text-muted: 156 163 175;        /* gray-400 */
    
    --primary: 37 99 235;             /* blue-600 */
    --primary-hover: 29 78 216;       /* blue-700 */
    --primary-muted: 239 246 255;     /* blue-50 */
    --primary-foreground: 255 255 255;
    
    --success: 240 253 244;
    --success-foreground: 22 163 74;
    --warning: 255 251 235;
    --warning-foreground: 217 119 6;
    --error: 254 242 242;
    --error-foreground: 220 38 38;
    --info: 239 246 255;
    --info-foreground: 37 99 235;
  }

  .dark {
    --background: 3 7 18;             /* gray-950 */
    --surface: 17 24 39;              /* gray-900 */
    --surface-elevated: 31 41 55;     /* gray-800 */
    --border: 55 65 81;               /* gray-700 */
    --text-primary: 249 250 251;      /* gray-50 */
    --text-secondary: 156 163 175;    /* gray-400 */
    --text-muted: 107 114 128;        /* gray-500 */
    
    --primary: 59 130 246;            /* blue-500 */
    --primary-hover: 96 165 250;      /* blue-400 */
    --primary-muted: 23 37 84;        /* blue-950 */
    --primary-foreground: 255 255 255;
    
    --success: 5 46 22;
    --success-foreground: 74 222 128;
    --warning: 69 26 3;
    --warning-foreground: 251 191 36;
    --error: 69 10 10;
    --error-foreground: 248 113 113;
    --info: 23 37 84;
    --info-foreground: 96 165 250;
  }
}
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

| Propriété | Light | Dark |
|-----------|-------|------|
| Background | white | gray-900 |
| Border right | gray-200 | gray-800 |
| Item hover | gray-100 | gray-800 |
| Item active bg | primary/10 (blue-50) | primary/10 (blue-950) |
| Item active text | primary | primary |

```
- Width: 240px (expanded), 64px (collapsed)
- Logo: en haut, h-16
- Nav items:
  - Icon (20px) + Label
  - Padding: py-2 px-3
  - Border radius: rounded-md
```

Navigation Property Manager (`/app`) :
- Dashboard
- Copropriétés
- Banque (optionnel global)
- Documents (optionnel global)
- Paramètres

### 6.2 Header (Top bar)

| Propriété | Light | Dark |
|-----------|-------|------|
| Background | white | gray-900 |
| Border bottom | gray-200 | gray-800 |

```
- Height: 64px (h-16)
- Content:
  - Search bar (gauche ou centre)
  - Theme toggle (soleil/lune)
  - Notifications icon (optionnel)
  - User avatar + dropdown (droite)
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

### 7.1 Implémentation (next-themes)

```tsx
// providers/theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 7.2 Toggle Button

```tsx
// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="h-5 w-5 hidden dark:block" />
    </button>
  )
}
```

### 7.3 Options de thème

| Option | Comportement |
|--------|--------------|
| `light` | Thème clair forcé |
| `dark` | Thème sombre forcé |
| `system` | Suit les préférences OS (défaut) |

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
| Thème light | `Sun` |
| Thème dark | `Moon` |

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
- Configurer les design tokens dans `tailwind.config.ts`
- Créer un Storybook pour documenter les composants
- Définir les animations et transitions
- Ajouter des illustrations pour les empty states (adaptées au thème)
