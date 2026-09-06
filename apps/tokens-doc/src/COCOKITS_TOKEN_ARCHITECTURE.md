# CocoKits Design Token Architecture

> **Version:** 1.1  
> **Last Updated:** April 2026  
> **Audience:** Designers, Developers, Architects — all levels  
> **Purpose:** This document is the single source of truth for the CocoKits token system. It defines how every visual value (color, spacing, typography, radius, etc.) is structured, named, and consumed across Figma, Angular, React, and any future platform.

---

## Table of Contents

- [1. Why Design Tokens?](#1-why-design-tokens)
- [2. Glossary](#2-glossary)
- [3. Problems This Architecture Solves](#3-problems-this-architecture-solves)
- [4. Architecture Overview](#4-architecture-overview)
- [5. Tier 1 — Primitives](#5-tier-1--primitives)
- [6. Tier 2 — Semantic Tokens](#6-tier-2--semantic-tokens)
  - [6.1 Brand Palette](#61-brand-palette)
  - [6.2 Semantic Color](#62-semantic-color)
  - [6.3 Semantic Typography](#63-semantic-typography)
  - [6.4 Semantic Spacing & Radius](#64-semantic-spacing--radius)
- [7. Tier 3 — Component Tokens](#7-tier-3--component-tokens)
  - [7.1 Size Collection](#71-size-collection)
  - [7.2 Structure Collection](#72-structure-collection)
  - [7.3 Shared Color Collection](#73-shared-color-collection)
  - [7.4 Component Typography Tokens & Styles](#74-component-typography-tokens--styles)
  - [7.5 Token & Collection Anatomy](#75-token--collection-anatomy)
- [8. The Color System In Depth](#8-the-color-system-in-depth)
  - [8.1 Color Families](#81-color-families)
  - [8.2 The 6 Color Roles](#82-the-6-color-roles)
  - [8.3 How Color × Type Stay Independent](#83-how-color--type-stay-independent)
  - [8.4 Structural Colors vs Color-Family Colors](#84-structural-colors-vs-color-family-colors)
  - [8.5 Figma Styles — Typography & Color Styles](#85-figma-styles--typography--color-styles)
- [9. Collections & Modes Reference](#9-collections--modes-reference)
- [10. Token Reference Chain — Full Example](#10-token-reference-chain--full-example)
- [11. Component Examples](#11-component-examples)
  - [11.1 Button](#111-button)
  - [11.2 Toggle](#112-toggle)
  - [11.3 Checkbox](#113-checkbox)
  - [11.4 Tab](#114-tab)
- [12. For Designers — Figma Workflow](#12-for-designers--figma-workflow)
- [13. For Developers — CSS/SCSS Workflow](#13-for-developers--cssscss-workflow)
- [14. FAQ](#14-faq)

---

## 1. Why Design Tokens?

A **design token** is a named value that represents a visual design decision. Instead of writing `#2563EB` (a blue hex code) directly in your Figma file or CSS, you write `brand-color`. If the brand color changes tomorrow, you update it in **one place** and every button, badge, checkbox, and tab updates automatically.

Without tokens:
```css
/* Fragile — if blue changes, you search-and-replace across thousands of lines */
.button { background: #2563EB; }
.badge  { background: #2563EB; }
.tab    { border-color: #2563EB; }
```

With tokens:
```css
/* Resilient — change the token value once, everything updates */
.button { background: var(--brand-color); }
.badge  { background: var(--brand-color); }
.tab    { border-color: var(--brand-color); }
```

Tokens also let you support **dark mode**, **multiple brands**, and **different density scales** — all by swapping token values without touching component code.

---

## 2. Glossary

These terms are used throughout this document. Read this section first if anything feels unclear later.

| Term | Definition |
|------|-----------|
| **Token** | A named container that holds a single design value (color, size, font, etc.). Think of it as a variable. |
| **Primitive Token** | The lowest level. Raw, context-free values: hex colors, pixel numbers, font names. Example: `blue-500: #2563EB`. |
| **Semantic Token** | A token that conveys *meaning* or *intent*. It references a Primitive. Example: `brand-color → {blue-500}`. The name tells you *why* it's used, not *what* it looks like. |
| **Component Token** | A token scoped to a specific UI component. It references a Semantic token. Example: `button-height → {spacing-40}`. |
| **Alias / Reference** | When a token's value points to another token instead of a raw value. Written as `{other-token-name}`. This creates a chain. |
| **Collection** | A group of related tokens in Figma. Each collection can have multiple **modes**. In code, a collection maps to a CSS scope or class. |
| **Mode** | A variation within a collection. Example: the `Semantic / Color` collection has modes `Light` and `Dark`. Switching modes swaps all token values at once. |
| **Color Family** | A group of related color tokens that together represent a meaning. Example: `brand` is a color family containing `brand-color`, `brand-on-color`, `brand-container`, etc. |
| **Structural Color** | A color token that is **fixed** regardless of which color family (brand, info, danger) is active. It lives in the Structure collection. Example: a toggle's thumb is always white. |
| **Color-Family Color** | A color token that **changes** when the user switches color families. It comes from the shared `Color / Active` collection. Example: a toggle's active track changes from blue (brand) to red (danger). |
| **Type** (component property) | The visual variant/style of a component. Example: a button can be `primary`, `outline`, `basic`, or `light`. Each type has a different visual recipe. This is a **Figma variant property**. |
| **Color** (component property) | The color intent of a component. Example: a button can be `brand`, `info`, `success`, `warning`, `danger`, or `contrast`. Controlled via the `Color / Active` collection mode, **not** a Figma variant property. |
| **Size** (component property) | The density/dimension variant. Example: `sm`, `md`, `lg`. Controlled via the `{Component} / Size` collection mode, **not** a Figma variant property. |
| **State** (component property) | The interactive state. Example: `default`, `hover`, `pressed`, `focused`, `disabled`. This **is** a Figma variant property and a CSS pseudo-class in code. |
| **Structure Collection** | A component-scoped collection with a **single mode** that holds all fixed, non-varying visual tokens: structural colors, disabled colors, static radii, etc. Named `{Component} / Structure`. |
| **Component Text Style** | A Figma text style scoped to one typographic role within a component (e.g., `Button / Label`). Its `font-size` and `line-height` are bound to Size collection variables, so the style responds to size mode changes automatically. |
| **Child Size Token** | A Size collection token that controls a property of a **child element** (label text, icon, inner frame) rather than the root frame. Example: `button-font-size` controls the label's `fontSize`. |
| **CSS Custom Property** | A CSS variable written as `--name: value;` and consumed as `var(--name)`. This is how tokens appear in the browser. |
| **Tier** | One of the three levels of the token architecture: Primitive → Semantic → Component. Each tier adds more context and specificity. |

---

## 3. Problems This Architecture Solves

Most design systems run into the same token architecture problems as they scale. This architecture was specifically designed to solve each one:

### Problem 1: Mixed Concerns in One Collection
**The problem:** All component tokens (button heights, checkbox sizes, toggle colors) live in a single flat collection. Changing a button size mode inadvertently affects unrelated components. There's no way to independently switch one component's size without touching others.

**How this architecture solves it:** Each component gets its own **Size** and **Type** collection with independent modes. Changing button sizes doesn't affect checkbox sizes. Collections are scoped to exactly one concern.

### Problem 2: Hardcoded Values
**The problem:** Visual values are hardcoded directly in stylesheets — `border-radius: 4px`, `padding: 0 16px`, `height: 32px`. This makes it impossible for a theme to fully customize the look without overriding every rule.

**How this architecture solves it:** Every visual value is a token — no exceptions. If a value appears in component CSS, it must reference a token. This guarantees full theme control.

### Problem 3: Compound CSS Selectors (Type × Color)
**The problem:** Every combination of type and color requires its own CSS rule: `.button--primary.button--brand`, `.button--primary.button--info`, etc. Adding a new color means updating **every** component type. The number of rules grows multiplicatively: *T × C* rules per component.

**How this architecture solves it:** Color and Type are fully independent via CSS custom properties. Color classes set `--cck-*` variables, Type classes read them. No compound selectors. Adding a new color or type is O(1) — one class, and it works with all existing counterparts.

### Problem 4: No Multi-Brand Support
**The problem:** The color system is coupled to a single brand. Switching to a different brand (different hues, different neutral temperature) requires manually replacing color values everywhere.

**How this architecture solves it:** The **Brand Palette** collection has one mode per brand. Switch from Brand-A to Brand-B and every color — including neutrals, grays, and surface colors — updates in a single mode change.

### Problem 5: Inconsistent Naming
**The problem:** Token names follow no predictable pattern — `primary-height-sm`, `form-field-color-border`, `color-brand-default`. Developers guess at names and often get them wrong. Onboarding is slow.

**How this architecture solves it:** Strict, hierarchical naming: `{component}-{property}-{variant}` for component tokens, `{family}-{role}` for color tokens. Every name is predictable from the pattern.

### Problem 6: Typography Incompatible with Figma
**The problem:** Typography is output as CSS `font` shorthand (`600 72px/90px inter`). Figma cannot bind a variable to a font shorthand — it needs individual properties. This creates a gap between design and code.

**How this architecture solves it:** Typography tokens use individual properties (`font-size`, `font-weight`, `line-height`) so each can be a Figma variable. Design and code stay perfectly in sync.

---

## 4. Architecture Overview

The token system has **3 tiers**. Each tier adds more meaning and specificity. Tokens at higher tiers reference tokens at lower tiers — they never contain raw values.

> **📊 Diagram: [CocoKits Token Architecture — 3-Tier System](https://www.figma.com/design/1sGvnXlFCiCqz9wly65Zdq) → Page 1: Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│  TIER 1 — PRIMITIVES                                            │
│  Raw values. No context. No opinion.                            │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐ ┌───────────┐ │
│  │Color Palette │ │Spacing Scale │ │Typography │ │Radius     │ │
│  │blue-500: #.. │ │4, 8, 12, 16 │ │Scale      │ │Scale      │ │
│  │gray-100: #.. │ │20, 24, 32.. │ │inter, 14  │ │0, 2, 4, 8 │ │
│  └──────┬───────┘ └──────┬───────┘ └─────┬─────┘ └─────┬─────┘ │
├─────────┼────────────────┼───────────────┼─────────────┼────────┤
│  TIER 2 — SEMANTIC                       │             │        │
│  Meaning & intent. Light/Dark. Brands.   │             │        │
│  ┌──────┴───────┐ ┌──────┴───────┐ ┌─────┴─────┐      │        │
│  │Brand Palette │ │Semantic      │ │Semantic   │      │        │
│  │→ per brand   │ │Color         │ │Typography │      │        │
│  │              │ │→ Light/Dark  │ │           │      │        │
│  └──────┬───────┘ └──────┬───────┘ └─────┬─────┘      │        │
├─────────┼────────────────┼───────────────┼─────────────┼────────┤
│  TIER 3 — COMPONENT                                            │
│  Specific to each UI component.                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────────┐ │
│  │Size          │ │Type          │ │Shared Color Collection  │ │
│  │Collection    │ │Collection    │ │(1 for entire system)    │ │
│  │→ per comp    │ │→ per comp    │ │→ 7 modes (color fams)   │ │
│  └──────────────┘ └──────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**The golden rule:** Tokens flow downward only. Primitives never reference Semantic tokens. Semantic tokens never reference Component tokens.

---

## 5. Tier 1 — Primitives

Primitives are the **raw material**. They have no opinion about context, meaning, or usage. They are just values with systematic names.

### Color Palette

A complete set of hue families, each with a scale from `50` (lightest) to `950` (darkest).

```
blue-50:  #EFF6FF       ← lightest
blue-100: #DBEAFE
blue-200: #BFDBFE
blue-300: #93C5FD
blue-400: #60A5FA
blue-500: #3B82F6       ← base
blue-600: #2563EB
blue-700: #1D4ED8
blue-800: #1E40AF
blue-900: #1E3A8A       ← darkest
blue-950: #172554
```

Other hue families follow the same pattern: `red-*`, `green-*`, `amber-*`, `purple-*`, `gray-*`, `slate-*`, etc.

Special primitives:
```
black:   #000000
white:   #FFFFFF
```

### Spacing Scale

Fixed pixel values that form a consistent rhythm:
```
spacing-0:  0px
spacing-4:  4px
spacing-8:  8px
spacing-12: 12px
spacing-16: 16px
spacing-20: 20px
spacing-24: 24px
spacing-32: 32px
spacing-40: 40px
spacing-48: 48px
spacing-64: 64px
```

### Typography Scale

Raw font attributes — no binding to context yet:
```
font-family-sans:  "Inter", sans-serif
font-family-mono:  "JetBrains Mono", monospace
font-size-xs:      12px
font-size-sm:      14px
font-size-md:      16px
font-size-lg:      18px
font-size-xl:      20px
font-size-2xl:     24px
font-weight-regular:  400
font-weight-medium:   500
font-weight-semibold: 600
font-weight-bold:     700
line-height-tight:    1.25
line-height-normal:   1.5
line-height-relaxed:  1.75
```

### Radius Scale

```
radius-none: 0px
radius-sm:   2px
radius-md:   4px
radius-lg:   8px
radius-xl:   12px
radius-full: 9999px
```

> **Key point:** Primitives never appear directly in component styles. They are always consumed through Semantic or Component tokens. If you see a raw hex code or pixel value in component CSS, something is wrong.

---

## 6. Tier 2 — Semantic Tokens

Semantic tokens add **meaning**. They reference Primitives, but their names describe *intent*, not *appearance*.

### 6.1 Brand Palette

The Brand Palette is the first layer of meaning. It maps abstract color families (brand, info, success, etc.) to specific Primitive hues.

**Why it exists:** To support **multiple brands**. Brand-A might use purple as its brand color, Brand-B might use teal. By putting this mapping in a separate collection, switching brands is a single mode change.

| Figma Collection | `Brand Palette` |
|---|---|
| **Modes** | `Brand-A`, `Brand-B`, `Brand-C`, ... (one per brand) |
| **Purpose** | Map abstract color families → concrete primitive hues |

Example tokens (showing two brands):

| Token Name | Brand-A (Mode) | Brand-B (Mode) |
|---|---|---|
| `brand-base` | `{purple-600}` | `{teal-600}` |
| `brand-lighter` | `{purple-50}` | `{teal-50}` |
| `brand-light` | `{purple-100}` | `{teal-100}` |
| `brand-dark` | `{purple-900}` | `{teal-900}` |
| `brand-darker` | `{purple-950}` | `{teal-950}` |
| `info-base` | `{blue-600}` | `{blue-600}` |
| `info-lighter` | `{blue-50}` | `{blue-50}` |
| `info-light` | `{blue-100}` | `{blue-100}` |
| `info-dark` | `{blue-900}` | `{blue-900}` |
| `info-darker` | `{blue-950}` | `{blue-950}` |
| `success-base` | `{green-600}` | `{green-600}` |
| `warning-base` | `{amber-500}` | `{amber-500}` |
| `danger-base` | `{red-600}` | `{red-600}` |
| `contrast-base` | `{gray-900}` | `{slate-900}` |
| `neutral-base` | `{gray-500}` | `{slate-500}` |
| `neutral-lighter` | `{gray-50}` | `{slate-50}` |
| `neutral-light` | `{gray-100}` | `{slate-100}` |
| `neutral-dark` | `{gray-800}` | `{slate-800}` |
| `neutral-darker` | `{gray-950}` | `{slate-950}` |

> **`lighter` and `darker` are optional.** Add them only when a component requires more than 3 tonal steps — for example, a card with a header, body, and nested element that all use the same color family but at different intensities. Most simple components (button, toggle, checkbox) only need `base`, `light`, and `dark`.

**Critical design decision:** Neutrals and grays are **also brand-dependent**. This means switching brands can change the entire feel — warm grays vs cool grays, for example. This is intentional for maximum brand control.

### 6.2 Semantic Color

Semantic Color takes the Brand Palette and creates **context-specific** roles for light and dark appearance.

| Figma Collection | `Semantic Color` |
|---|---|
| **Modes** | `Light`, `Dark` |
| **References** | Brand Palette tokens |
| **Purpose** | Define role-based colors for each appearance mode |

For **each color family** (brand, info, success, warning, danger, contrast, neutral), we define 6 semantic roles:

| Role | Meaning | Light Mode Example (Brand) | Dark Mode Example (Brand) |
|------|---------|---------------------------|--------------------------|
| `{family}-color` | The primary accent color for this family | `{brand-base}` = purple-600 | `{brand-light}` = purple-300 |
| `{family}-on-color` | Text/icon color that sits ON the accent color | `{white}` | `{brand-dark}` = purple-900 |
| `{family}-container` | A softer background using this family | `{brand-light}` = purple-100 | `{brand-dark}` = purple-900 |
| `{family}-on-container` | Text/icon color on the container | `{brand-dark}` = purple-900 | `{brand-light}` = purple-100 |
| `{family}-outline` | Border/outline using this family | `{brand-base}` = purple-600 | `{brand-light}` = purple-300 |
| `{family}-focus` | Focus ring / alpha overlay | `{brand-light}` @ 60% opacity | `{brand-base}` @ 40% opacity |

Plus **global structural colors** (not tied to any family):

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `surface-default` | `{white}` | `{neutral-dark}` |
| `surface-muted` | `{neutral-light}` | `{neutral-base}` |
| `on-surface` | `{neutral-dark}` | `{white}` |
| `on-surface-muted` | `{neutral-base}` | `{neutral-light}` |
| `border-default` | `{neutral-light}` | `{neutral-base}` |
| `border-strong` | `{neutral-base}` | `{neutral-light}` |
| `disabled-surface` | `{neutral-light}` | `{neutral-dark}` |
| `disabled-on-surface` | `{neutral-base}` | `{neutral-base}` |
| `disabled-border` | `{neutral-light}` | `{neutral-base}` |

### 6.3 Semantic Typography

Semantic typography pairs a **size** with a **weight** to create named text styles.

| Figma Collection | `Semantic Typography` |
|---|---|
| **Modes** | `Default` (or per-brand if fonts differ) |
| **References** | Primitive Typography Scale |

| Token | Font Size | Font Weight | Line Height |
|-------|-----------|-------------|-------------|
| `text-xs-regular` | `{font-size-xs}` | `{font-weight-regular}` | `{line-height-normal}` |
| `text-xs-medium` | `{font-size-xs}` | `{font-weight-medium}` | `{line-height-normal}` |
| `text-sm-regular` | `{font-size-sm}` | `{font-weight-regular}` | `{line-height-normal}` |
| `text-sm-medium` | `{font-size-sm}` | `{font-weight-medium}` | `{line-height-normal}` |
| `text-sm-semibold` | `{font-size-sm}` | `{font-weight-semibold}` | `{line-height-normal}` |
| `text-md-regular` | `{font-size-md}` | `{font-weight-regular}` | `{line-height-normal}` |
| `text-md-medium` | `{font-size-md}` | `{font-weight-medium}` | `{line-height-normal}` |
| `text-lg-medium` | `{font-size-lg}` | `{font-weight-medium}` | `{line-height-normal}` |
| `display-sm-semibold` | `{font-size-xl}` | `{font-weight-semibold}` | `{line-height-tight}` |
| `display-md-semibold` | `{font-size-2xl}` | `{font-weight-semibold}` | `{line-height-tight}` |

> **Important for Figma:** Each property (size, weight, line-height) is a separate variable. We do NOT use CSS font shorthand (`600 14px/20px inter`) because Figma cannot bind a variable to a shorthand.

### 6.4 Semantic Spacing & Radius

| Token | References |
|-------|-----------|
| `space-xs` | `{spacing-4}` = 4px |
| `space-sm` | `{spacing-8}` = 8px |
| `space-md` | `{spacing-16}` = 16px |
| `space-lg` | `{spacing-24}` = 24px |
| `space-xl` | `{spacing-32}` = 32px |
| `radius-component` | `{radius-md}` = 4px |
| `radius-card` | `{radius-lg}` = 8px |
| `radius-pill` | `{radius-full}` = 9999px |

---

## 7. Tier 3 — Component Tokens

Component tokens are scoped to individual UI components. They reference Semantic tokens and define exactly how each component uses the design system.

Each component can have up to **3 token sources**:

| Source | Scope | Figma Collection | Modes |
|--------|-------|-------------------|-------|
| **Size Collection** | Per component | `Button / Size` | `sm`, `md`, `lg` |
| **Structure Collection** | Per component | `Button / Structure` | `Default` (single mode) |
| **Shared Color Collection** | Entire system (one collection) | `Color / Active` | `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `contrast` |

### Which collection owns which tokens?

This is a critical rule. Every token belongs to exactly one collection, and the collection is determined by what drives the token's value:

| If the token's value changes when… | It belongs to… |
|-------------------------------------|----------------|
| The **size** changes (sm/md/lg) | `{Component} / Size` |
| The **color family** changes (brand/danger/…) | `Color / Active` (shared) |
| **Neither** — it is always the same fixed value | `{Component} / Structure` |

> **No exceptions.** A token that "usually doesn't change" is still structural if it never changes per size or per color family. Put it in `Structure`.

### 7.1 Size Collection

Each component has its own Size collection. Modes correspond to the component's size variants (`sm`, `md`, `lg`).

**The Size collection owns ALL tokens that change with size** — including tokens for child elements such as label text, icons, and inner frames. Do not put these in the Structure collection because they are hardcoded there.

**Example: `Button / Size`**

| Token | Binds to | Mode: `sm` | Mode: `md` | Mode: `lg` |
|-------|----------|-----------|-----------|-----------|
| `button-height` | root `height` | `{spacing-32}` = 32px | `{spacing-40}` = 40px | `{spacing-48}` = 48px |
| `button-padding-x` | root `paddingLeft/Right` | `{space-sm}` = 8px | `{space-md}` = 16px | `{space-md}` = 16px |
| `button-padding-y` | root `paddingTop/Bottom` | `{space-xs}` = 4px | `{space-xs}` = 4px | `{space-sm}` = 8px |
| `button-gap` | root `itemSpacing` | `{space-xs}` = 4px | `{space-sm}` = 8px | `{space-sm}` = 8px |
| `button-radius` | root `cornerRadius` | `{radius-md}` | `{radius-md}` | `{radius-md}` |
| `button-font-size` | label `fontSize` (via Text Style) | `{font-size-sm}` | `{font-size-sm}` | `{font-size-md}` |
| `button-font-weight` | label `fontWeight` (via Text Style) | `{font-weight-medium}` | `{font-weight-medium}` | `{font-weight-medium}` |
| `button-icon-size` | icon frame `width/height` | `{spacing-16}` = 16px | `{spacing-20}` = 20px | `{spacing-20}` = 20px |

**Example: `Toggle / Size`**

| Token | Binds to | Mode: `sm` | Mode: `md` | Mode: `lg` |
|-------|----------|-----------|-----------|-----------|
| `toggle-width` | track `width` | 36px | 44px | 52px |
| `toggle-backdrop-height` | track `height` | 20px | 24px | 28px |
| `toggle-track-radius` | track `cornerRadius` | 10px | 12px | 14px |
| `toggle-thumb-size` | thumb `width/height` | 16px | 20px | 24px |
| `toggle-thumb-padding` | track `padding` (insets thumb) | 2px | 2px | 2px |
| `toggle-gap` | label spacing | `{space-sm}` | `{space-sm}` | `{space-md}` |

**Example: `Checkbox / Size`**

| Token | Binds to | Mode: `sm` | Mode: `md` | Mode: `lg` |
|-------|----------|-----------|-----------|-----------|
| `checkbox-size` | root `width/height` | 16px | 20px | 24px |
| `checkbox-radius` | root `cornerRadius` | 3px | 4px | 4px |
| `checkbox-border-width` | root `strokeWeight` | 1.5px | 2px | 2px |
| `checkbox-inner-padding` | root `padding` (insets checkmark) | 3px | 3px | 4px |

> **`checkbox-inner-padding`** is the pattern for scaling inner content: bind the root's padding to a Size token and set the checkmark frame to `FILL`. As padding decreases at `sm` and increases at `lg`, the checkmark scales automatically. No need to bind `width/height` on the vector itself (Figma does not support that).

### 7.2 Structure Collection

Each component has its own Structure collection with a **single mode** (`Default`). It holds all tokens that are **fixed** — they never change per size, per color family, or per brand. This collection is the component's structural recipe.

**What belongs here:**
- Structural colors (thumb background, unchecked track, unchecked border, disabled states)
- Static radii that don't change with size
- Any other value that is the same in every variant of the component

**What does NOT belong here:**
- Anything that changes with size → goes in `{Component} / Size`
- Anything that changes with color family → comes from `Color / Active`

**Example: `Button / Structure`**

| Token | Value | References |
|-------|-------|-----------|
| `button-disabled-bg` | fixed | `{disabled-surface}` |
| `button-disabled-text` | fixed | `{disabled-on-surface}` |
| `button-disabled-border` | fixed | `{disabled-border}` |

**Example: `Toggle / Structure`**

| Token | Value | References |
|-------|-------|-----------|
| `toggle-thumb` | always white | `{white}` |
| `toggle-thumb-border` | always medium gray | `{border-default}` |
| `toggle-track-off` | always gray | `{border-default}` |
| `toggle-track-disabled` | fixed | `{disabled-surface}` |
| `toggle-thumb-disabled` | fixed | `{disabled-border}` |

**Example: `Checkbox / Structure`**

| Token | Value | References |
|-------|-------|-----------|
| `checkbox-bg-off` | unchecked background | `{surface-default}` |
| `checkbox-border-off` | unchecked border | `{border-default}` |
| `checkbox-checkmark` | checkmark color (always white) | `{white}` |
| `checkbox-disabled-bg` | fixed | `{disabled-surface}` |
| `checkbox-disabled-border` | fixed | `{disabled-border}` |

Notice how `primary` uses `var(--cck-color)` for background (bold, filled), while `light` uses `var(--cck-container)` for background (subtle, soft). The **Type decides what goes where**. The **Color decides what shade**.

### 7.3 Shared Color Collection

This is the **key innovation** of this architecture. Instead of duplicating color definitions inside every component, we have **one shared collection** that bridges Semantic Colors to Component Types.

| Figma Collection | `Color / Active` |
|---|---|
| **Modes** | `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `contrast` |
| **Token count** | **6 tokens only** |
| **Purpose** | Bridge semantic colors to components via CSS custom properties |

> **📊 Diagram: [Shared Color Collection Bridge](https://www.figma.com/design/1sGvnXlFCiCqz9wly65Zdq) → Page 2: Color System**

**The 6 tokens:**

| Token | Meaning | Mode: `brand` | Mode: `danger` |
|-------|---------|--------------|----------------|
| `color` | Primary accent swatch | `{brand-color}` → purple | `{danger-color}` → red |
| `on-color` | Content on top of `color` | `{brand-on-color}` → white | `{danger-on-color}` → white |
| `container` | Soft/subtle background | `{brand-container}` → light purple | `{danger-container}` → light red |
| `on-container` | Content on top of `container` | `{brand-on-container}` → dark purple | `{danger-on-container}` → dark red |
| `outline` | Borders and outlines | `{brand-outline}` → purple | `{danger-outline}` → red |
| `focus` | Focus rings and highlights | `{brand-focus}` → purple alpha | `{danger-focus}` → red alpha |

**Why only 6?** Because we audited every component in the system:

| Component | Tokens Used | Which Ones |
|-----------|-------------|------------|
| Button (primary) | 4 | `color`, `on-color`, `focus`, `outline` |
| Button (outline) | 3 | `on-container`, `outline`, `focus` |
| Button (light) | 3 | `container`, `on-container`, `focus` |
| Button (basic) | 2 | `on-container`, `focus` |
| Toggle | 1–2 | `color`, (`focus`) |
| Checkbox | 2 | `color`, `focus` |
| Radio Button | 1 | `color` |
| Badge | 2 | `color`, `on-color` |
| Tab | 3–4 | `color`, `on-color`, `outline`, `focus` |
| Icon | 1 | `color` |

No component needs more than 6. Most need 1–3.

---

### 7.4 Component Typography Tokens & Styles

Typography in components has two linked parts: **tokens** (values) and **styles** (named text presets). Understanding both — and how they connect — is essential for designers and developers.

#### The Core Constraint: Variables vs. Styles in Figma

In Figma, applying a Text Style and binding a variable (e.g., `font-size`) to the same text node are **mutually exclusive for that property**. If you apply a style and also bind a variable, the style value wins and the variable binding is silently ignored.

The solution is to **bind the variable inside the style definition itself**. This means the style stays as the design abstraction, but its properties are secretly token-driven.

#### Where typography tokens live

Typography tokens that change with size belong in the **Size collection**:

```
Button / Size  (modes: sm | md | lg)
  button-font-size    → {font-size-sm} / {font-size-sm} / {font-size-md}
  button-font-weight  → {font-weight-medium} (all modes)
  button-line-height  → {line-height-normal} (all modes)
```

These tokens reference `Primitives / Typography` values. They are child-size tokens — they control the label text node inside the component, not the root frame.

#### Full chain: Primitive → Token → Style → Component

```
Primitives / Typography
  font-size-sm:  14px
  font-size-md:  16px
        ↓
Button / Size  (Size collection)
  button-font-size: {font-size-sm} ← sm mode
                    {font-size-sm} ← md mode
                    {font-size-md} ← lg mode
        ↓
Figma Text Style "Button / Label"
  font-family  → Inter              (static — never a variable)
  font-size    → $button-font-size  (bound to the Size token)
  font-weight  → $button-font-weight
  line-height  → $button-line-height
        ↓
Label text node inside Button component
  style = "Button / Label"          (no direct variable binding needed)
```

When a designer switches the size mode to `lg`, `button-font-size` resolves to `{font-size-md}` = 16px. The `Button / Label` style picks this up automatically. Every text node using that style updates.

#### One style per typographic role

A component can have multiple text elements with different visual roles. Each distinct role gets its own style. Examples:

| Component | Role | Style name | Why separate? |
|-----------|------|-----------|--------------|
| Button | main label | `Button / Label` | scales with size |
| Form Field | input label | `Form Field / Label` | different size + weight |
| Form Field | helper text | `Form Field / Helper` | smaller, muted |
| Form Field | error message | `Form Field / Error` | same size as helper, different color usage |
| Badge | text | `Badge / Label` | very small, caps |
| Tooltip | body | `Tooltip / Body` | small, single weight |

> **Rule:** If two text elements in a component should scale or style independently, they need separate styles and separate Size tokens.

#### Styles in code (CSS/SCSS)

In code, component typography tokens output as CSS custom properties on a size class. There is no concept of a "text style" in CSS — the equivalent is applying multiple properties at once:

```scss
// Size class applies all typographic properties together
.cck-button__size--md {
  height: var(--button-height);
  padding: var(--button-padding-y) var(--button-padding-x);
  gap: var(--button-gap);

  // Typography (equivalent to the Figma "Button / Label" style)
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  line-height: var(--button-line-height);
}
```

> **No CSS font shorthand.** Never write `font: 500 14px/1.5 Inter`. Figma cannot bind a variable to a shorthand. Always use individual properties. The code follows the same rule for consistency.

#### Multi-text components

Some components have more than one text element, potentially with different colors or sizes. Each text element gets its own Size tokens and its own Style:

**Example: Form Field**

```
Form Field has 3 text elements:
  ① Label       → "Form Field / Label"  style, color: on-surface
  ② Helper text → "Form Field / Helper" style, color: on-surface-muted
  ③ Error text  → "Form Field / Error"  style, color: danger-color (color-family)

Size tokens needed:
  form-field-label-font-size
  form-field-label-font-weight
  form-field-helper-font-size
  form-field-helper-font-weight
  form-field-error-font-size   (may equal helper — still a separate token)
```

In Figma, each text node has its own style applied. In code, each text element has its CSS class that references its own token variables.

---

### 7.5 Token & Collection Anatomy

Consistent naming is one of the most important aspects of a scalable token system. This section defines the exact naming rules for every token and collection in the project. **These rules are mandatory — no exceptions.**

#### Collection naming

Collections follow a two-part pattern: `{Scope} / {Concern}`.

| Pattern | Example | Explanation |
|---------|---------|-------------|
| `Primitives / {Category}` | `Primitives / Color` | Tier 1 — raw values |
| `{Family} Palette` | `Brand Palette` | Tier 2 — brand mapping |
| `Semantic / {Category}` | `Semantic / Color` | Tier 2 — semantic layer |
| `Color / Active` | `Color / Active` | Tier 3 — shared color bridge (one collection, system-wide) |
| `{Component} / Size` | `Button / Size` | Tier 3 — component size tokens |
| `{Component} / Structure` | `Button / Structure` | Tier 3 — component fixed tokens |

Component names use **Title Case** and match the component's display name exactly: `Button`, `Form Field`, `Toggle`, `Checkbox`, `Tab`, `Badge`, `Icon`.

#### Token naming

Tokens follow a flat, hyphenated, lowercase pattern: `{component}-{element}-{property}`.

| Segment | Rule | Example |
|---------|------|---------|
| `{component}` | Always the component name, lowercase, hyphenated | `button`, `form-field`, `toggle` |
| `{element}` | The child element if applicable, omit for root | `thumb`, `track`, `label`, `icon`, `border` |
| `{property}` | The CSS property or abstract property name | `size`, `color`, `radius`, `font-size`, `padding-x` |

Examples:

```
button-height           ← root property, no element segment
button-font-size        ← root-level typography (applies to the label text)
button-icon-size        ← child element (icon) + property
toggle-thumb-size       ← child element (thumb) + property
toggle-track-off        ← child element (track) + state (off)
checkbox-border-off     ← root border in unchecked (off) state
form-field-label-font-size   ← child element (label) + property
form-field-helper-font-size  ← child element (helper) + property
```

**Do not include the mode name in the token name.** The mode is handled by the collection, not the token name. `button-height` is correct; `button-height-md` is wrong — `md` is a mode, not part of the token's identity.

**Do not use abbreviations** unless they are universally understood (`bg` for background, `sm/md/lg` for sizes). Prefer full words: `padding` not `pad`, `radius` not `rad`, `disabled` not `dis`.

#### Figma Style naming

Figma styles (text styles, color styles, effect styles) follow a two-part pattern: `{Scope} / {Role}`.

**Global / Semantic styles** (not tied to a component):

```
Typography / display-sm-semibold   ← global text style from Semantic Typography
Typography / text-sm-medium        ← global text style
Color / surface-default            ← global color style from Semantic Color
Color / on-surface                 ← global color style
Color / brand-color                ← global color style
```

**Component styles** (scoped to one component's role):

```
Button / Label                     ← text style for button's label
Form Field / Label                 ← text style for form field's label text
Form Field / Helper                ← text style for helper/hint text
Form Field / Error                 ← text style for error message text
Badge / Label                      ← text style for badge text
Tooltip / Body                     ← text style for tooltip content
Tab / Label                        ← text style for tab label
```

> **Rule:** Global styles live under `Typography /` or `Color /`. Component-scoped styles live under `{ComponentName} /`. Never mix them — a button label style never lives under `Typography /`.

#### Summary: what goes where

```
A token's value changes when size changes       → {Component} / Size  collection
A token's value changes when color family changes → Color / Active    collection
A token's value never changes                   → {Component} / Structure  collection

A text element's visual recipe (family, weight, size, height)
  defined globally and reused                   → Typography / {name} Figma style
  scoped to one component role                  → {Component} / {Role} Figma style

A color's visual recipe defined globally        → Color / {semantic-name} Figma style
```

---

## 8. The Color System In Depth

### 8.1 Color Families

The system has **7 color families**. Each family represents a different user intent:

| Family | Purpose | Example Usage |
|--------|---------|---------------|
| `neutral` | Default, unaccented UI | Dividers, borders, muted backgrounds |
| `brand` | Primary brand identity | Primary buttons, active states, key CTAs |
| `info` | Informational / neutral-positive | Info banners, help icons, links |
| `success` | Positive confirmation | Success toasts, completed states |
| `warning` | Caution, needs attention | Warning alerts, approaching limits |
| `danger` | Destructive, error, critical | Delete buttons, error messages, validation |
| `contrast` | Maximum visual weight | High-contrast text, critical emphasis |

Each family has all 6 roles: `color`, `on-color`, `container`, `on-container`, `outline`, `focus`.

That means Semantic Color defines: 7 families × 6 roles = **42 color tokens** (plus structural globals like `surface-default`, `on-surface`, `disabled-*`, etc.).

### 8.2 The 6 Color Roles

These names are inspired by Material Design 3's color role system, adapted for CocoKits:

| Role | What It Represents | Visual Description |
|------|--------------------|--------------------|
| **`color`** | The primary accent swatch | The "loud" color. Bold, saturated. Used for filled backgrounds or key strokes. |
| **`on-color`** | Content that lives ON `color` | Usually white or very dark. Must have high contrast against `color`. |
| **`container`** | A softer, tinted background | The "quiet" version. Low saturation, tinted. Used for subtle backgrounds. |
| **`on-container`** | Content that lives ON `container` | Usually dark (light mode) or light (dark mode). Must read well on the tint. |
| **`outline`** | Borders, strokes, dividers | Typically the same hue as `color` but used explicitly for strokes. |
| **`focus`** | Focus rings and visual highlights | An alpha/transparent version, used for `box-shadow` focus indicators. |

**Visual example (brand family, light mode):**
```
┌─────────────────────────┐
│ color: ████ purple-600  │  ← Bold fill (primary button bg)
│ on-color: ████ white    │  ← Text on that fill
│ container: ████ pur-100 │  ← Subtle fill (light button bg)
│ on-container: ████ p900 │  ← Text on subtle fill
│ outline: ████ pur-600   │  ← Border (outline button)
│ focus: ████ pur-100@60% │  ← Focus ring shadow
└─────────────────────────┘
```

### 8.3 How Color × Type Stay Independent

This is the most important concept for developers. **Color and Type are orthogonal** — they never need to know about each other.

> **📊 Diagram: [Button Token Resolution Flow](https://www.figma.com/design/1sGvnXlFCiCqz9wly65Zdq) → Page 2: Color System (Color × Type Independence section)**

**Step 1 — The Color class sets CSS variables:**
```css
/* When color="brand", this class is applied */
.cck-button__color--brand {
  --cck-color: var(--brand-color);
  --cck-on-color: var(--brand-on-color);
  --cck-container: var(--brand-container);
  --cck-on-container: var(--brand-on-container);
  --cck-outline: var(--brand-outline);
  --cck-focus: var(--brand-focus);
}

/* When color="danger", this class is applied instead */
.cck-button__color--danger {
  --cck-color: var(--danger-color);
  --cck-on-color: var(--danger-on-color);
  /* ... same pattern ... */
}
```

**Step 2 — The Type class reads those variables:**
```css
/* Primary button: bold filled style */
.cck-button__type--primary {
  background-color: var(--cck-color);     /* reads whatever color was set */
  color: var(--cck-on-color);
  border-radius: var(--button-radius);
}

/* Outline button: bordered style */
.cck-button__type--outline {
  background-color: transparent;
  color: var(--cck-on-container);
  border: 1px solid var(--cck-outline);  /* reads whatever color was set */
}
```

**Result:** Adding a new color family (e.g., `custom`) requires only ONE new color class. All existing types (primary, outline, light, basic) automatically work with it. Adding a new type (e.g., `ghost`) requires only ONE new type class. All existing colors automatically work with it.

### 8.4 Structural Colors vs Color-Family Colors

Every component uses a mix of both. Understanding the difference prevents confusion.

**Structural colors** are fixed — they belong to the component's Type collection:
- Toggle thumb background (always white)
- Toggle track when unchecked (always gray)
- Checkbox unchecked border (always medium gray)
- Form field border (always neutral)
- Disabled states (fixed, never color-family-dependent)
- Label text color (always the default font color)

**Color-family colors** change when the user picks brand/info/danger — they come from the shared Color collection:
- Toggle track when checked (brand = purple, danger = red)
- Checkbox background when checked (changes per family)
- Button background/text/border (changes per family)
- Tab indicator (changes per family)
- Focus rings (change per family)

**Rule of thumb:** If the color changes when you switch `color="brand"` to `color="danger"` on the component, it's a **color-family color**. If it stays the same, it's a **structural color**.

---

### 8.5 Figma Styles — Typography & Color Styles

Figma Variables store **individual values** (a single number, a single color). Figma Styles bundle **multiple properties** into a reusable preset. Both are required — they serve different purposes and work together.

#### Variables vs. Styles — what each does

| | Figma Variable | Figma Style |
|--|----------------|-------------|
| **Stores** | One value (number, color, boolean) | A group of properties (font-family + size + weight + line-height) |
| **Used for** | Binding to a single node property | Applying a complete typographic or color preset |
| **Responds to mode changes** | Yes — switches with collection modes | Yes — if its properties are variable-bound |
| **Lives in** | Variables panel | Styles panel |

The two are linked: a Style's individual properties can be **bound to variables**. This is what makes styles respond to size mode changes.

#### Typography styles

Every named text style in Figma must have its `font-size` and `line-height` bound to variables. `font-family` is always static.

**Two categories of text styles:**

**1. Global styles** — not tied to any component, come from `Semantic / Typography` tokens:

| Style name | Font size token | Weight token | Usage |
|-----------|----------------|--------------|-------|
| `Typography / text-xs-regular` | `{font-size-xs}` | `{font-weight-regular}` | Captions, labels |
| `Typography / text-sm-medium` | `{font-size-sm}` | `{font-weight-medium}` | Body, helper text |
| `Typography / text-md-regular` | `{font-size-md}` | `{font-weight-regular}` | Body copy |
| `Typography / text-lg-medium` | `{font-size-lg}` | `{font-weight-medium}` | Section headings |
| `Typography / display-sm-semibold` | `{font-size-xl}` | `{font-weight-semibold}` | Display headings |
| `Typography / display-md-semibold` | `{font-size-2xl}` | `{font-weight-semibold}` | Hero headings |

**2. Component styles** — scoped to one component's typographic role, bound to that component's Size tokens:

| Style name | Font size token | Usage |
|-----------|----------------|-------|
| `Button / Label` | `{button-font-size}` | Button label text |
| `Badge / Label` | `{badge-font-size}` | Badge text |
| `Form Field / Label` | `{form-field-label-font-size}` | Input field label |
| `Form Field / Helper` | `{form-field-helper-font-size}` | Helper / hint text |
| `Form Field / Error` | `{form-field-error-font-size}` | Validation error text |
| `Tab / Label` | `{tab-font-size}` | Tab item label |
| `Tooltip / Body` | `{tooltip-font-size}` | Tooltip content |

> When a designer changes a button instance's size mode from `md` to `lg`, the `Button / Label` style's `font-size` variable resolves to `{font-size-md}` = 16px. Every text node using that style updates automatically — no manual resizing.

#### Color styles

Color styles in Figma represent semantic or component-level color values. Their fill is bound to a variable.

**Global color styles** (from `Semantic / Color`):

```
Color / surface-default     ← bound to {surface-default}
Color / on-surface          ← bound to {on-surface}
Color / brand-color         ← bound to {brand-color}
Color / danger-color        ← bound to {danger-color}
Color / disabled-surface    ← bound to {disabled-surface}
```

These respond to light/dark mode changes automatically because the underlying variables are in `Semantic / Color` (modes: Light, Dark).

#### The inheritance hierarchy in Figma

Variable modes in Figma cascade from parent frames to children. A child always uses the **closest ancestor** that has an explicit mode set, or falls back to the default mode.

```
Page (no mode set)
└── Section frame — mode: Color/Active = "brand"
    ├── Button instance — (inherits brand from parent)
    └── Badge instance  — mode: Color/Active = "danger"  ← overrides parent
        └── Badge text  — (inherits danger from Badge)
```

**This is powerful but can be confusing.** If you set a mode on a parent frame, all children inherit it unless they explicitly override it. Rules to follow:

- **Always set variable modes at the component instance level** (not on a grandparent frame you don't fully control).
- **When showcasing multiple variants**, use a wrapper frame per variant and set the mode on each wrapper — not on a shared parent.
- **To debug unexpected values**, walk up the layer tree checking which ancestor has the mode set. The lowest-level explicit override always wins.

> In code, this is equivalent to CSS cascade: a child element's CSS custom property value comes from the nearest ancestor that defines it. Set `--cck-color` on the button element itself, not on a distant container.

---

## 9. Collections & Modes Reference

Complete list of all Figma variable collections in the system:

### Tier 1 — Primitive Collections

| Collection | Modes | Token Examples |
|-----------|-------|----------------|
| `Primitives / Color` | `Default` | `blue-500`, `red-600`, `gray-100`, `white`, `black` |
| `Primitives / Spacing` | `Default` | `spacing-1` (4px), `spacing-4` (16px), `spacing-10` (40px) |
| `Primitives / Typography` | `Default` | `font-size-sm` (14px), `font-weight-medium` (500) |
| `Primitives / Radius` | `Default` | `radius-sm` (2px), `radius-md` (4px), `radius-full` (9999px) |

### Tier 2 — Semantic Collections

| Collection | Modes | Token Examples |
|-----------|-------|----------------|
| `Brand Palette` | `Brand-A`, `Brand-B`, ... | `brand-base`, `info-light`, `neutral-dark` |
| `Semantic / Color` | `Light`, `Dark` | `brand-color`, `on-surface`, `disabled-border` |
| `Semantic / Typography` | `Default` (or per-brand) | `text-sm-medium`, `display-lg-semibold` |

### Tier 3 — Component Collections (Per Component)

| Collection Pattern | Example Modes | Token Examples |
|-------------------|---------------|----------------|
| `{Component} / Size` | `sm`, `md`, `lg` | `button-height`, `button-font-size`, `toggle-thumb-size` |
| `{Component} / Structure` | `Default` (single mode) | `toggle-thumb`, `checkbox-border-off`, `button-disabled-bg` |

### Tier 3 — Shared Collection (System-wide)

| Collection | Modes | Tokens |
|-----------|-------|--------|
| `Color / Active` | `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `contrast` | `color`, `on-color`, `container`, `on-container`, `outline`, `focus` |

### Component Collection Index

| Component | Size Modes | Structure Collection? | Uses Color Collection? |
|-----------|-----------|----------------------|----------------------|
| **Button** | sm, md, lg | Yes | Yes — all 6 tokens |
| **Icon Button** | sm, md, lg | Yes | Yes — all 6 tokens |
| **Toggle** | sm, md, lg | Yes | Yes — `color`, `focus` |
| **Checkbox** | sm, md, lg | Yes | Yes — `color`, `focus` |
| **Radio Button** | sm, md, lg | Yes | Yes — `color` |
| **Tab** | sm, md, lg | Yes | Yes — `color`, `on-color`, `outline`, `focus` |
| **Badge** | sm, md, lg, xl | Yes | Yes — `color`, `on-color` |
| **Icon** | xs, sm, md, lg, xl, 2xl | No (no fixed structural colors) | Yes — `color` |
| **Form Field** | sm, md, lg | Yes | No — uses global semantic |
| **Divider** | *(via token)* | Yes | No |
| **Chip** | sm, md, lg | Yes | No — uses global semantic |
| **Accordion** | sm, md | Yes | No |
| **Avatar** | xs, sm, md, lg | Yes | No — uses global semantic |
| **Menu** | *(via token)* | Yes | No |
| **Select** | sm, md, lg | Yes | No |

---

## 10. Token Reference Chain — Full Example

Let's trace one value from raw hex through all 4 tiers to a rendered button.

> **📊 Diagram: [Token Reference Chain Example](https://www.figma.com/design/1sGvnXlFCiCqz9wly65Zdq) → Page 3: Token Reference Chain**

**Scenario:** A primary button with `color="brand"` in Brand-A, Light mode.

```
TIER 1 — PRIMITIVE
  purple-600: #9333EA                        ← raw hex value

TIER 2 — BRAND PALETTE (Mode: Brand-A)
  brand-base: {purple-600}                   ← alias to primitive

TIER 2 — SEMANTIC COLOR (Mode: Light)
  brand-color: {brand-base}                  ← alias to brand palette

TIER 3 — SHARED COLOR (Mode: Brand)
  color: {brand-color}                       ← alias to semantic

CSS OUTPUT
  --cck-color: var(--brand-color);           ← set by color class

COMPONENT CSS
  .cck-button__type--primary {
    background-color: var(--cck-color);      ← consumed by type class
  }

BROWSER RENDERING
  background-color: #9333EA                  ← final resolved value
```

**Now switch to Brand-B:** Only the Brand Palette mode changes.
```
TIER 2 — BRAND PALETTE (Mode: Brand-B)
  brand-base: {teal-600}                     ← now points to teal

Everything downstream automatically resolves to teal.
```

**Now switch to Dark mode:** Only the Semantic Color mode changes.
```
TIER 2 — SEMANTIC COLOR (Mode: Dark)
  brand-color: {brand-light}                 ← lighter shade for dark bg

Everything downstream automatically resolves to the dark-mode variant.
```

---

## 11. Component Examples

### 11.1 Button

The button is the **most complex** color consumer in the system. It has 4 types, each using different subsets of the 6 color roles.

**Props:** `type` (primary | outline | basic | light), `color` (7 families), `size` (sm | md | lg)  
**CSS Classes:** `.cck-button__type--{type}`, `.cck-button__color--{color}`, `.cck-button__size--{size}`

#### How each Type uses the 6 color tokens:

```
PRIMARY         OUTLINE          BASIC           LIGHT
┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
│ bg: color │   │ bg: transp│   │ bg: transp│   │ bg: contai│
│ text: on- │   │ text: on- │   │ text: on- │   │    ner    │
│   color   │   │  container│   │  container│   │ text: on- │
│ border: - │   │ bdr: outl │   │ border: - │   │  container│
│ focus: fcs│   │ focus: fcs│   │ focus: fcs│   │ focus: fcs│
└───────────┘   └───────────┘   └───────────┘   └───────────┘
 Uses: 3 of 6    Uses: 3 of 6    Uses: 2 of 6    Uses: 3 of 6
```

#### Size tokens (from `Button / Size` collection):

| Token | sm | md | lg |
|-------|-----|-----|-----|
| `button-height` | 32px | 40px | 48px |
| `button-padding-x` | 8px | 16px | 16px |
| `button-font-size` | 14px | 14px | 16px |
| `button-font-weight` | 500 | 500 | 500 |
| `button-icon-size` | 16px | 20px | 20px |
| `button-gap` | 4px | 8px | 8px |

#### SCSS implementation sketch:

```scss
// Color class — sets the palette (same class used by ALL components)
.cck-button__color--brand {
  --cck-color: var(--brand-color);
  --cck-on-color: var(--brand-on-color);
  --cck-container: var(--brand-container);
  --cck-on-container: var(--brand-on-container);
  --cck-outline: var(--brand-outline);
  --cck-focus: var(--brand-focus);
}

// Type class — structural recipe
.cck-button__type--primary:not(:disabled) {
  background-color: var(--cck-color);
  color: var(--cck-on-color);
  border: none;
  border-radius: var(--button-radius);

  &:focus-visible {
    box-shadow: 0 0 0 3px var(--cck-focus);
  }
}

.cck-button__type--primary:disabled {
  background-color: var(--button-disabled-bg);
  color: var(--button-disabled-text);
}

// Size class — dimensions
.cck-button__size--md {
  height: var(--button-height);
  padding: var(--button-padding-y) var(--button-padding-x);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  gap: var(--button-gap);
}
```

### 11.2 Toggle

The toggle is simpler — it has no `type` variants (just one visual style) but uses `color` and `size`.

**Props:** `color` (7 families), `size` (sm | md | lg)  
**CSS Classes:** `.cck-toggle__color--{color}`, `.cck-toggle__size--{size}`

#### Color usage (minimal — only 1–2 tokens from shared collection):

| Element | Unchecked (Structural) | Checked (Color-Family) | Disabled (Structural) |
|---------|----------------------|----------------------|---------------------|
| **Thumb bg** | `{toggle-thumb}` → white | `{toggle-thumb}` → white | `{toggle-thumb-disabled}` |
| **Thumb border** | `{toggle-thumb-border}` → gray | `var(--cck-color)` → brand/danger/etc | `{disabled-border}` |
| **Track bg** | `{toggle-track-unselected}` → gray | `var(--cck-color)` → brand/danger/etc | `{toggle-track-disabled}` |
| **Label** | `{on-surface}` | `{on-surface}` | `{disabled-on-surface}` |

The toggle only reads **`color`** from the shared collection (for checked track + hover border). Everything else is a structural token in the Type collection.

#### SCSS implementation sketch:

```scss
// Structural (from Type collection — single mode, no variants)
.cck-toggle__thumb {
  background-color: var(--toggle-thumb);
  border: 2px solid var(--toggle-thumb-border);
}

.cck-toggle__backdrop {
  background-color: var(--toggle-track-unselected);
}

// Color-family (checked state reads the shared color variable)
.cck-toggle--checked .cck-toggle__backdrop {
  background-color: var(--cck-color);
}

.cck-toggle:hover .cck-toggle__thumb {
  border-color: var(--cck-color);
}
```

### 11.3 Checkbox

**Props:** `color` (brand | info | warning | danger), `size` (sm | md | lg)  
**CSS Classes:** `.cck-checkbox__color--{color}`, `.cck-checkbox__size--{size}`

#### Color usage (2 tokens from shared collection):

| Element | Unchecked (Structural) | Checked (Color-Family) | Disabled (Structural) |
|---------|----------------------|----------------------|---------------------|
| **Border** | `{checkbox-border}` → gray | `var(--cck-color)` | `{disabled-border}` |
| **Background** | `transparent` | `var(--cck-color)` | `{disabled-surface}` |
| **Checkmark** | n/a | `{checkbox-checkmark}` → white | `{disabled-border}` |
| **Focus ring** | — | `var(--cck-focus)` | — |
| **Label** | `{on-surface}` | `{on-surface}` | `{disabled-on-surface}` |

Only **`color`** and **`focus`** come from the shared collection.

#### SCSS implementation sketch:

```scss
// Structural
.cck-checkbox__background {
  border: 1px solid var(--checkbox-border);
}

// Color-family (when checked)
.cck-checkbox--checked .cck-checkbox__background {
  background-color: var(--cck-color);
  border-color: var(--cck-color);
}

// Focus
.cck-checkbox__input:focus-visible ~ .cck-checkbox__background {
  box-shadow: 0 0 0 3px var(--cck-focus);
}
```

### 11.4 Tab

The tab is the second most complex component — it has 4 type variants and uses color for the indicator decoration.

**Props:** `type` (fill | border | basic | line), `color` (7 families + default), `size` (sm | md | lg)  
**CSS Classes:** `.cck-tabs__type--{type}`, `.cck-tabs__color--{color}`, `.cck-tabs__size--{size}`

#### How each Type uses color tokens:

| Type | Indicator Style | Selected Text | Color Tokens Used |
|------|----------------|---------------|-------------------|
| `fill` | Solid bg = `var(--cck-color)` | `var(--cck-on-color)` | `color`, `on-color` |
| `border` | Solid bg = `var(--cck-color)` | `var(--cck-on-color)` | `color`, `on-color` |
| `basic` | Solid bg = `var(--cck-color)` | `var(--cck-on-color)` | `color`, `on-color` |
| `line` | Bottom border = `var(--cck-outline)` | `{on-surface}` (structural) | `outline` |

Plus all types share: focus ring = `var(--cck-focus)`.

---

## 12. For Designers — Figma Workflow

### How Collections Map to Figma

Each collection in this document corresponds directly to a **Figma Variable Collection**. Each mode corresponds to a **Figma Variable Mode**.

```
Figma Variables Panel
├── Primitives / Color          [Default]
├── Primitives / Spacing        [Default]
├── Primitives / Typography     [Default]
├── Primitives / Radius         [Default]
├── Brand Palette               [Brand-A] [Brand-B]
├── Semantic / Color            [Light] [Dark]
├── Semantic / Typography       [Default]
├── Color / Active              [neutral] [brand] [info] [success] [warning] [danger] [contrast]
├── Button / Size               [sm] [md] [lg]
├── Button / Structure          [Default]
├── Toggle / Size               [sm] [md] [lg]
├── Toggle / Structure          [Default]
├── Checkbox / Size             [sm] [md] [lg]
├── Checkbox / Structure        [Default]
├── Tab / Size                  [sm] [md] [lg]
├── Tab / Structure             [Default]
├── Badge / Size                [sm] [md] [lg] [xl]
│   ... (one Size + one Structure per component)
└── Icon / Size                 [xs] [sm] [md] [lg] [xl] [2xl]
```

### Setting Up a Component in Figma

1. **Create the component** as a Figma component set with variant properties.
2. **Define variant properties correctly** — see the table below for what is and isn't a variant property.
3. **Bind size tokens** to dimension properties of the root frame AND all child elements that scale with size. Use the component's `/ Size` collection.
4. **Bind structural colors** to fills/strokes that don't change per color family. Use the component's `/ Structure` collection.
5. **Bind color-family colors** to fills/strokes that DO change per color family. Use `Color / Active`.
6. **Apply a Component Text Style** to every text node. Never set `font-size` directly on a text node — always go through a style.

### What is and isn't a Figma variant property

This is the most important concept for keeping components clean. **Only properties that require structurally different node arrangements should be Figma variant properties.**

| Property | Figma variant property? | How it's controlled |
|----------|------------------------|---------------------|
| **Type** (primary / outline / basic / light) | ✅ Yes — different layouts may have different node structures | Variant property in component set |
| **State** (default / hover / pressed / focused / disabled) | ✅ Yes — different states may show/hide elements, change layout | Variant property in component set |
| **Checked / Selected** (for toggle, checkbox, radio) | ✅ Yes — nodes may appear or disappear (e.g., checkmark) | Variant property in component set |
| **Color** (brand / info / danger / …) | ❌ No — same node structure, only token values change | Controlled via `Color / Active` mode in the Appearance panel |
| **Size** (sm / md / lg) | ❌ No — same node structure, only token values change | Controlled via `{Component} / Size` mode in the Appearance panel |

> **Why this matters:** If Color and Size are variant properties, a button with 4 types × 7 colors × 3 sizes × 5 states = **420 variants**. With only Type and State as variant properties: **4 × 5 = 20 variants**. Color and Size are set per instance via the Appearance panel.

### How Mode Switching Works for a Button

A Figma button instance has variable scopes applied via the Appearance panel:

| Property | Bound To | Collection | Controlled By |
|----------|----------|------------|---------------|
| Height | `button-height` | `Button / Size` | Size mode (Appearance panel) |
| Padding | `button-padding-x/y` | `Button / Size` | Size mode (Appearance panel) |
| Label font-size | via `Button / Label` style → `button-font-size` | `Button / Size` | Size mode (Appearance panel) |
| Background | `button-bg` → reads `--cck-color` | `Button / Structure` + `Color / Active` | Type variant + Color mode (Appearance panel) |
| Text color | `button-text` → reads `--cck-on-color` | `Button / Structure` + `Color / Active` | Type variant + Color mode (Appearance panel) |
| Thumb color | `toggle-thumb` | `Toggle / Structure` | Fixed — never changes |

When a designer changes the color mode from `brand` to `danger`:
- Figma switches the `Color / Active` collection mode on that instance from `brand` to `danger`
- All variables bound to that collection (`color`, `on-color`, etc.) update
- The button's fill, text, and focus ring all change — automatically, without touching any other instance

### Variable mode inheritance

Variable modes cascade from parent frames to child elements. The nearest explicit mode override always wins:

```
Wrapper frame (Color/Active = "brand")         ← all children default to brand
  ├── Button instance (no override)             ← inherits brand
  ├── Toggle instance (Color/Active = "danger") ← overrides to danger
  │    └── Track (inherits danger from Toggle)
  └── Checkbox instance (no override)           ← inherits brand from wrapper
```

> **Always set modes at the instance level** when you want per-component control. Setting a mode on a shared parent frame means ALL children inside it inherit that mode unless explicitly overridden.

### States in Figma

States are **Figma variant properties** (not collection modes). Use these variant property names consistently:

| State | Variant value | CSS equivalent |
|-------|--------------|----------------|
| Normal/idle | `state=default` | *(no pseudo-class)* |
| Mouse over | `state=hover` | `:hover` |
| Pressed/active | `state=pressed` | `:active` |
| Keyboard focus | `state=focused` | `:focus-visible` |
| Disabled | `state=disabled` | `:disabled` |
| Loading | `state=loading` | *(custom class)* |

For boolean states (toggle on/off, checkbox checked), use a separate boolean variant property:
- `Checked=true/false` for checkbox and radio
- `Checked=true/false` for toggle (represents the on/off state)

---

## 13. For Developers — CSS/SCSS Workflow

### CSS Custom Property Architecture

The token system outputs CSS custom properties at multiple scopes:

```css
/* Tier 2 — Semantic Colors (applied to :root or [data-theme]) */
:root,
[data-cck-theme="light"] {
  --brand-color: #9333EA;
  --brand-on-color: #FFFFFF;
  --brand-container: #F3E8FF;
  --brand-on-container: #581C87;
  --brand-outline: #9333EA;
  --brand-focus: rgba(243, 232, 255, 0.6);
  /* ... all 7 families × 6 roles ... */
  --surface-default: #FFFFFF;
  --on-surface: #1F2937;
  --disabled-surface: #F3F4F6;
  /* ... etc ... */
}

[data-cck-theme="dark"] {
  --brand-color: #C084FC;
  --brand-on-color: #3B0764;
  /* ... overrides for dark mode ... */
}
```

```css
/* Tier 3 — Color class (sets intermediate variables) */
.cck-button__color--brand,
.cck-toggle__color--brand,
.cck-checkbox__color--brand,
.cck-tab__color--brand,
.cck-badge__color--brand {
  --cck-color: var(--brand-color);
  --cck-on-color: var(--brand-on-color);
  --cck-container: var(--brand-container);
  --cck-on-container: var(--brand-on-container);
  --cck-outline: var(--brand-outline);
  --cck-focus: var(--brand-focus);
}
```

```css
/* Tier 3 — Type class (consumes intermediate variables) */
.cck-button__type--primary:not(:disabled) {
  background-color: var(--cck-color);
  color: var(--cck-on-color);
}
```

### CSS Class Naming Convention

All CSS classes follow this pattern:

```
.cck-{component}__{prop}--{value}
```

Examples:
- `.cck-button__type--primary` — button type = primary
- `.cck-button__color--brand` — button color = brand
- `.cck-button__size--md` — button size = medium
- `.cck-toggle__size--lg` — toggle size = large
- `.cck-tabs__type--line` — tabs type = line

Special state classes:
- `.cck-toggle--checked` — toggle is on
- `.cck-toggle--disabled` — toggle is disabled
- `.cck-checkbox--checked` — checkbox is checked
- `.cck-checkbox--indeterminate` — checkbox is mixed

### Token Generator Output

The token generator reads JSON token definitions and outputs:

| Output | Path | Use |
|--------|------|-----|
| SCSS Variables | `src/token/scss/` | `$button-height: var(--button-height)` |
| CSS Mixins | `src/token/core/` | `@mixin brand-color-light { --brand-color: #9333EA; }` |
| CSS File | `src/token/css/tokens.css` | Pre-compiled CSS for non-SCSS projects |
| TypeScript Dictionary | `src/token/dictionary/` | Token metadata for runtime use |

### Adding a New Color Family

To add a new color family (e.g., `accent`):

1. **Brand Palette:** Add `accent-base`, `accent-light`, `accent-dark` tokens with values per brand mode.
2. **Semantic Color:** Add `accent-color`, `accent-on-color`, `accent-container`, `accent-on-container`, `accent-outline`, `accent-focus` with values for Light and Dark modes.
3. **Shared Color Collection:** Add a new mode `accent` that aliases the semantic tokens.
4. **No component code changes needed.** The color class pattern already handles any mode.

### Adding a New Component

1. Create `{Component} / Size` collection with appropriate modes.
2. Create `{Component} / Type` collection if the component has visual variants.
3. Decide which of the 6 shared color tokens the component needs (probably 1–3).
4. Write the component SCSS following the color-class → type-class pattern.

---

## 14. FAQ

### "Why not put everything in one big collection?"
Figma has a limit of 4 modes per collection on non-Enterprise plans. More importantly, a single collection makes it impossible to independently switch size, color, and type. You'd need every combination as a separate mode (sm-primary-brand, md-primary-brand, lg-primary-brand, sm-outline-brand...) → exponential explosion.

### "Why is the Color collection shared instead of per-component?"
Because the 6 tokens (`color`, `on-color`, `container`, `on-container`, `outline`, `focus`) mean the same thing across all components. A per-component collection would duplicate the same aliases 30+ times and add maintenance burden with no benefit.

### "What if a component needs a color token that doesn't fit the 6 roles?"
First, check if it's really a **color-family** token (changes per brand/info/danger) or a **structural** token (fixed). If it's structural, it belongs in the Structure collection and references Semantic globals directly. If it genuinely needs a new color role (very unlikely — we audited all 30+ components), we can add a 7th token to the shared collection.

### "Why are neutrals brand-dependent?"
Different brands often have different "gray temperatures." A tech brand might use cool blue-grays; a luxury brand might use warm beige-grays. Making neutrals part of the Brand Palette gives maximum control.

### "Where do states (hover, pressed, focus) live?"
States are **Figma variant properties** and **CSS pseudo-classes** — not collection modes. Each state is a variant of the component (e.g., `state=hover`) in Figma, and `:hover` / `:focus-visible` / `:disabled` in CSS. State-specific token values (e.g., a hover overlay opacity) live in the **Structure collection**, since they are fixed regardless of color family.

### "Why are Color and Size NOT Figma variant properties?"
Because they don't change the component's node structure — only the token values change. Making them variants would create hundreds of redundant variants (4 types × 7 colors × 3 sizes × 5 states = 420). Instead, Color and Size are controlled via variable mode overrides in the Appearance panel per instance. Only Type and State (and boolean states like Checked) are variant properties.

### "How does typography scale with component size?"
Typography tokens (`button-font-size`, `button-font-weight`, `button-line-height`) live in the `{Component} / Size` collection alongside all other size tokens. A Figma text style (e.g., `Button / Label`) has its `font-size` property bound to the `button-font-size` variable. When the size mode changes, the variable resolves to a new value and the style updates automatically — no manual resizing of text nodes needed. See §7.4 for the full chain.

### "Can I use these tokens without Figma?"
Yes. The token generator outputs platform-agnostic CSS custom properties, SCSS variables, and a TypeScript dictionary. Figma is the design tool, but the token architecture works independently in code.

### "How do I switch from Light to Dark mode in code?"
Apply a data attribute to the root element:
```html
<body data-cck-theme="dark">
```
This triggers the dark mode CSS custom properties, and every component updates automatically.

### "How do disabled states work?"
Disabled colors are **structural** — they don't change per color family. They come from Semantic globals: `disabled-surface`, `disabled-on-surface`, `disabled-border`. Each component's Structure collection references these for its disabled state tokens.

### "A child element inside my component isn't responding to the size mode. Why?"
The child element's property (e.g., `font-size` on a text node, `width` on an icon frame) is probably hardcoded or not bound to any variable. Every measurable child property that should change with size must have its own token in the `{Component} / Size` collection, bound directly to that node's property. See §7.1 for the full Size collection pattern.

### "I changed a mode on a parent frame but one child isn't updating. Why?"
That child has an **explicit mode override** set on itself (or on a closer ancestor). In Figma, the nearest explicit mode always wins. Check the child's Appearance panel — if it has a mode set, it will ignore the parent's mode. See §8.5 for the full inheritance rules.

---

## Appendix: Figma Architecture Diagrams

All diagrams are in a single Figma design file with multiple pages. Open the file and navigate to the relevant page:

> **[Open Figma File — CocoKits Token Architecture](https://www.figma.com/design/1sGvnXlFCiCqz9wly65Zdq)**

| Page | Description |
|------|-------------|
| **1. Architecture Overview** | 3-tier system overview, key concepts (structural vs color-family colors, collections & modes, alias chains), and a full collections table |
| **2. Color System** | 7 color families, 6 color roles, Brand Palette mapping, shared collection mode table, Color × Type independence, and component usage matrix |
| **3. Token Reference Chain** | Step-by-step trace from `purple-600` through all tiers to a rendered button. Plus "What If" scenarios (switch brand, dark mode, color family) |
| **4. Component Examples** | Button (4 types × 3 colors), Toggle (5 states), Checkbox (6 states), Tab (fill vs line). Token annotation mockups and summary comparison table |
