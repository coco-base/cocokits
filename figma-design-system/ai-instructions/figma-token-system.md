# CocoKits Figma Design System — Complete AI Reference

> **Authoritative guide for AI agents.** Read this before modifying any token files or Figma variables.

---

## System Overview

CocoKits uses a **3-tier token hierarchy** managed as Figma Variable Collections.  
All values cascade: editing a Tier-1 raw value propagates to every Tier-2 alias that references it.

```
Tier 1 — Primitives (raw values, no aliases)
  Primitives / Color  ←  Semantic / Brand  ←  Semantic / Color
  Primitives / Size
  Primitives / Spacing  (3 density modes — Normal / Compact / Comfortable)
  Primitives / Radius
  Primitives / Opacity
  Primitives / Font Family    ←  Semantic / Typography
  Primitives / Typography     ←  (same)
  Primitives / Shadow  (Figma effect styles, not variables)

Tier 2 — Semantic (all values are aliases to Tier-1 tokens; shared across the entire system)
  Semantic / Brand
  Semantic / Color
  Semantic / Active Color  (7 modes = 7 color families, 6 tokens — bridges Semantic/Color to components)
  Semantic / Typography

Tier 3 — Component (component-level)
```

---

## Reference Syntax

| Context | Syntax | Example |
|---------|--------|---------|
| JSON token file | `{group.token}` | `{brand.base}` |
| Figma variable name | `group/token` | `brand/base` |
| Cross-collection alias | Same syntax, different collection | `{cobalt.50}` → Primitives / Color |

**Key rule:** The `.` in JSON becomes `/` in Figma. They are the same path, different separators.

---

## Figma Separator Collections — DO NOT TOUCH

The Figma file contains **3 empty collections** used purely as visual section dividers. They have no variables, no JSON files, and no functional role.

| Collection name | Purpose |
|----------------|---------|
| `----- TIER 1 ----------------` | Visual divider before Tier 1 collections |
| `----- TIER 2 ----------------` | Visual divider before Tier 2 collections |
| `----- TIER 3 ----------------` | Visual divider before Tier 3 collections |

> **AI RULE — ABSOLUTE:** Never rename, delete, reorder, or add variables to these three separator collections. They are permanent fixtures. Treat them as read-only infrastructure. If you see them while inspecting collections, skip over them.

---

## Collections Summary

_The Figma file also contains 3 empty separator collections (`----- TIER 1 ----------------` etc.) that are visual-only — they are not listed here because they have no tokens._

| # | Collection | Tier | Modes | Variables | References |
|---|-----------|------|-------|-----------|-----------|
| 1 | Primitives / Color | 1 | none | 694 COLOR | none (raw hex) |
| 2 | Primitives / Size | 1 | none | 31 FLOAT | none (raw px) |
| 3 | Primitives / Spacing | 1 | Normal · Compact · Comfortable | 13 FLOAT/mode | Size tokens |
| 4 | Primitives / Radius | 1 | none | 9 FLOAT | none (raw px) |
| 5 | Primitives / Opacity | 1 | none | 15 FLOAT | none (raw 0–1) |
| 6 | Primitives / Shadow | 1 | none | — effect styles | Color Palette black-alpha |
| 7 | Primitives / Font Family | 1 | Inter · Geist · Poppins | 2 STRING/mode | none (raw names) |
| 8 | Primitives / Typography | 1 | none | ~38 FLOAT/dimension | none (raw values) |
| 9 | Semantic / Brand | 2 | Iris · Fern · Rose · Dahlia · Marigold | 35 COLOR/mode | Primitives / Color |
| 10 | Semantic / Color | 2 | Light · Dark · Dim · Colorblind | 51 COLOR/mode | Semantic / Brand |
| 11 | Semantic / Typography | 2 | Inter · Geist · Poppins | 176 FLOAT+STRING/mode | Primitives / Font Family + Primitives / Typography |
| 12 | Semantic / Active Color | 3 | neutral · brand · info · success · warning · danger · contrast | 6 COLOR | Semantic / Color |

---

## Collection Details

### 1. Primitives / Color
- **File:** `tokens/primitives/color-palette.tokens.json`
- **Figma collection:** `Primitives / Color`
- **Figma variables:** `cobalt/50`, `cobalt/100`, ..., `cobalt/950` (11 steps per palette)
- **Contents:** 61 named palettes (reds, oranges, yellows, greens, teals, blues, purples, neutrals) × 11 steps + `black`, `white` + `black-alpha/10` through `black-alpha/90` + `white-alpha/10` through `white-alpha/90`
- **Usage:** Referenced by `Semantic / Brand`. NEVER referenced directly by components.

### 2. Primitives / Size
- **File:** `tokens/primitives/size.tokens.json`
- **Figma collection:** `Primitives / Size`
- **Figma variables (flat names):** `size-1`=1px, `size-2`=2px, `size-3`=3px, `size-4`=4px, `size-5`=5px, `size-6`=6px, `size-8`=8px, `size-10`=10px, `size-12`=12px, `size-14`=14px, `size-16`=16px, `size-20`=20px, `size-24`=24px, `size-28`=28px, `size-32`=32px, `size-36`=36px, `size-40`=40px, `size-44`=44px, `size-48`=48px, `size-56`=56px, `size-64`=64px, `size-72`=72px, `size-80`=80px, `size-96`=96px, `size-112`=112px, `size-128`=128px, `size-160`=160px, `size-192`=192px, `size-224`=224px, `size-256`=256px, `size-512`=512px
- **Usage:** Use for component dimensions (width, height, icon-size, border-width). Referenced as aliases by Spacing tokens.
- **⚠️ NOT for margin/padding/gap** — use Spacing tokens for those.

### 3. Primitives / Spacing
- **Files:** `tokens/primitives/spacing.tokens.json` (Normal), `spacing.compact.tokens.json`, `spacing.comfortable.tokens.json`
- **Figma collection:** `Primitives / Spacing`
- **Variables:** `spacing-0` through `spacing-12` (13 steps). All non-zero values alias Size tokens.
- **Exclusive usage:** Spacing tokens are for `margin`, `padding`, and `gap` ONLY. Use Size for everything else.
- **Density modes:** Switch the Spacing collection mode to change whitespace density globally without touching any component code.

| Step | Normal (default) | Compact | Comfortable |
|------|-----------------|---------|-------------|
| `spacing-0`  | 0   | 0   | 0   |
| `spacing-1`  | 1   | 1   | 2   |
| `spacing-2`  | 2   | 2   | 4   |
| `spacing-3`  | 4   | 2   | 6   |
| `spacing-4`  | 8   | 4   | 10  |
| `spacing-5`  | 12  | 8   | 16  |
| `spacing-6`  | 16  | 12  | 20  |
| `spacing-7`  | 24  | 16  | 32  |
| `spacing-8`  | 32  | 24  | 40  |
| `spacing-9`  | 48  | 32  | 64  |
| `spacing-10` | 64  | 48  | 80  |
| `spacing-11` | 96  | 64  | 128 |
| `spacing-12` | 128 | 96  | 160 |

**When to use each mode:**
- **Normal** — Default for most product UIs. Balanced whitespace.
- **Compact** — Data-dense UIs: tables, dashboards, admin panels, mobile.
- **Comfortable** — Spacious UIs: marketing pages, landing pages, docs, reading apps.

### 3. Primitives / Radius
- **File:** `tokens/primitives/radius.tokens.json`
- **Figma collection:** `Primitives / Radius`
- **Figma variables:** `radius-none`=0, `radius-xs`=2, `radius-sm`=4, `radius-md`=6, `radius-lg`=8, `radius-xl`=12, `radius-2xl`=16, `radius-3xl`=24, `radius-full`=9999

### 4. Primitives / Opacity
- **File:** `tokens/primitives/opacity.tokens.json`
- **Figma collection:** `Primitives / Opacity`
- **Figma variables:** `opacity-0`=0.0, `opacity-5`=0.05, `opacity-10`=0.1, `opacity-20`=0.2, `opacity-25`=0.25, `opacity-30`=0.3, `opacity-40`=0.4, `opacity-50`=0.5, `opacity-60`=0.6, `opacity-70`=0.7, `opacity-75`=0.75, `opacity-80`=0.8, `opacity-90`=0.9, `opacity-95`=0.95, `opacity-100`=1.0

### 5. Primitives / Font Family
- **Files:** `tokens/primitives/font-family.inter.tokens.json`, `.geist.`, `.poppins.`
- **Figma collection:** `Primitives / Font Family`
- **Variables:** 2 STRING per mode
  - `font-family-sans` / `font-family-mono`
  - Inter mode: "Inter" / "JetBrains Mono"
  - Geist mode: "Geist" / "Fira Code"
  - Poppins mode: "Poppins" / "Source Code Pro"

### 6. Primitives / Typography
- **File:** `tokens/primitives/typography.tokens.json`
- **Figma collection:** `Primitives / Typography`
- **Figma variable groups and values:**
  - `font-size/2xs`=10, `xs`=12, `sm`=14, `md`=16, `lg`=18, `xl`=20, `2xl`=24, `3xl`=30, `4xl`=36, `5xl`=48, `6xl`=60, `7xl`=72
  - `font-weight/thin`=100, `extralight`=200, `light`=300, `regular`=400, `medium`=500, `semibold`=600, `bold`=700, `extrabold`=800, `black`=900
  - `line-height/none`=1.0, `tight`=1.25, `snug`=1.375, `normal`=1.5, `relaxed`=1.625, `loose`=2.0
  - `letter-spacing/tighter`=-0.05em, `tight`=-0.025em, `normal`=0em, `wide`=0.025em, `wider`=0.05em, `widest`=0.1em
  - `paragraph-spacing/none`=0px, `sm`=8px, `md`=16px, `lg`=24px

### 7. Semantic / Brand
- **Files:** `tokens/brand-palette/{mode}.tokens.json` (5 files)
- **Figma collection:** `Semantic / Brand`
- **Purpose:** Maps 7 semantic roles to specific Color Palette palettes. Switching modes changes which palettes are used.
- **Variable groups:** `brand/`, `info/`, `success/`, `warning/`, `danger/`, `contrast/`, `neutral/`
- **Steps per group:** `lighter`, `light`, `base`, `dark`, `darker`
- **Mode → palette mapping:**
  | Role | Iris | Fern | Rose | Dahlia | Marigold |
  |------|------|------|------|--------|----------|
  | brand | cobalt | jade | crimson | iris | marigold |
  | info | cerulean | cerulean | cerulean | cerulean | cerulean |
  | success | jade | emerald | jade | jade | jade |
  | warning | amber | amber | amber | amber | amber |
  | danger | crimson | crimson | rose | crimson | crimson |
  | contrast | charcoal | charcoal | charcoal | charcoal | charcoal |
  | neutral | ash | ash | ash | ash | ash |

### 8. Semantic / Color
- **Files:** `tokens/semantic/color.{mode}.tokens.json` (4 files)
- **Figma collection:** `Semantic / Color`
- **Variables (51 total):**
  - `color/{role}` — 7 roles (brand, info, success, warning, danger, contrast, neutral) — main fill color
  - `on-color/{role}` — text/icon on top of color fills
  - `container/{role}` — lighter tinted backgrounds
  - `on-container/{role}` — text on container backgrounds
  - `outline/{role}` — border for outlined variants
  - `focus/{role}` — focus ring color
  - `surface/default`, `surface/muted` — page/card backgrounds
  - `on-surface/default`, `on-surface/muted` — primary/secondary text on surfaces
  - `border/default`, `border/strong` — dividers and borders
  - `disabled/surface`, `disabled/on-surface`, `disabled/border` — disabled state

**Modes — when to use each:**

| Mode | Surface | On-surface | Best for |
|------|---------|------------|----------|
| **Light** | white | charcoal/dark | Default light theme |
| **Dark** | charcoal/darker | neutral/lighter | Full dark theme |
| **Dim** | charcoal/dark | neutral/light | Night reading, Twitter-style |
| **Colorblind** | white | charcoal/dark | Mild protanopia/deuteranopia |

**Colorblind mode specifics:** Keeps the correct palette semantics (green=success, red=danger) but shifts their tone to maximize luminance distinction. `color/success` uses `success/light` (lighter, cooler green) while `color/danger` uses `danger/dark` (darker, warmer red). `container/success` is extra pale while `container/danger` uses `danger/light`. This allows people with red-green color blindness to still distinguish success and danger states by luminance, without changing the meaning or palette.

### 9. Semantic / Active Color  _(Tier 2 — Shared Color Bridge)_
- **Files:** `tokens/shared/color-active.{mode}.tokens.json` (7 files)
- **Figma collection:** `Semantic / Active Color`
- **Modes:** `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `contrast`
- **Variables (6 total — same 6 in every mode):**

| Variable | CSS custom property | Meaning |
|----------|--------------------|-|
| `color` | `--cck-color` | Primary accent fill (bold, saturated) |
| `on-color` | `--cck-on-color` | Text/icon drawn ON top of `color` |
| `container` | `--cck-container` | Soft tinted background |
| `on-container` | `--cck-on-container` | Text/icon drawn inside `container` |
| `outline` | `--cck-outline` | Border / stroke color |
| `focus` | `--cck-focus` | Focus ring (alpha overlay) |

- **How it works:** Each variable is an alias to the matching `Semantic / Color` variable for the active family. Example for `brand` mode: `color` → `color/brand`, `on-color` → `on-color/brand`, etc.
- **Component usage:** Components bind to `--cck-color` etc., not to `--brand-color` directly. Switching the frame's `Color / Active` mode changes which color family all 6 variables resolve to — without touching the component markup.
- **Token ownership rule:** Any component token whose value changes when the user switches color families (`brand` → `danger`) belongs in `Color / Active`, NOT in the component's Structure collection.

**Why only 6 tokens?** After auditing all components: Button (4), Toggle (1–2), Checkbox (2), Radio (1), Badge (2), Tab (3–4). No component needs more than 6.


### 10. Semantic / Typography
- **Files:** `tokens/semantic/typography.{mode}.tokens.json` (3 files — Inter, Geist, Poppins)
- **Figma collection:** `Semantic / Typography`
- **Variable structure:** `{style}/{weight}/{property}`
  - Example: `text-sm/regular/font-size`, `heading-md/bold/font-weight`
- **Styles and weights:**
  - `text-2xs`, `text-xs`: regular, medium, semibold
  - `text-sm`, `text-md`, `text-lg`: regular, medium, semibold, bold
  - `heading-xs`, `heading-sm`, `heading-md`: regular, medium, semibold, bold
  - `heading-lg`, `display-sm`, `display-md`, `display-lg`: regular, semibold, bold
  - `code/xs`, `code/sm`, `code/md` (uses font-family-mono)
- **Properties per style:** font-family (STRING), font-size (FLOAT), font-weight (FLOAT), line-height (FLOAT)
- **Total:** 44 styles × 4 properties = 176 variables per mode

---

## Mode Switching Behavior

Switching a collection mode changes all variables in that collection simultaneously. Because collections alias each other, a single mode switch can cascade:

**Switching Brand Palette mode (Iris → Fern):**
→ All `Semantic / Brand` COLOR variables resolve to different `Primitives / Color` palettes
→ All 51 `Semantic / Color` variables automatically pick up the new palette values
→ Every component using Semantic Color tokens now uses the Fern brand colors

**Switching Semantic / Color mode (Light → Dark):**
→ Surfaces, backgrounds, text, borders all swap to dark-mode values
→ Brand colors also adjust (e.g. `color/brand` uses `brand/light` in dark mode vs `brand/base` in light mode)
→ Available modes: Light, Dark, Dim, Colorblind

**Switching Semantic / Active Color mode (neutral → brand):**
→ The 6 bridge variables (`color`, `on-color`, `container`, `on-container`, `outline`, `focus`) resolve to the brand family
→ All components inside the scoped frame instantly adopt brand colors
→ Available modes: neutral, brand, info, success, warning, danger, contrast

**Switching Primitives / Spacing mode (Normal → Compact):**
→ All spacing-0 through spacing-12 variables resolve to smaller pixel values
→ All components using spacing tokens automatically become more compact
→ Only affects properties that use spacing tokens (margin, padding, gap)
→ Available modes: Normal, Compact, Comfortable

**Switching Semantic / Typography or Primitives / Font Family mode (Inter → Geist):**
→ Both must be set to the same mode for consistency
→ font-family-sans/mono resolve to Geist/Fira Code strings
→ Text styles bound to fontFamily variables automatically update to the new font

---

## Figma File

- **File Key:** `ngKefGWUtYd9gA8thdhZgk`
- **Team:** "Mili" (`team::1357079822603732696`)
- **URL:** https://figma.com/design/ngKefGWUtYd9gA8thdhZgk

---

## JSON File Index

```
figma-design-system/tokens/
  manifest.json                           ← collection registry
  primitives/
    color-palette.tokens.json             ← 694 raw color vars  (Primitives / Color)
    size.tokens.json                      ← 31 size steps       (Primitives / Size)
    spacing.tokens.json                   ← Spacing Normal mode  (Primitives / Spacing)
    spacing.compact.tokens.json           ← Spacing Compact mode
    spacing.comfortable.tokens.json       ← Spacing Comfortable mode
    radius.tokens.json                    ← 9 radius values     (Primitives / Radius)
    opacity.tokens.json                   ← 15 opacity values   (Primitives / Opacity)
    shadow.tokens.json                    ← shadow effect styles (not Figma variables)
    font-family.inter.tokens.json         ← Inter/JetBrains Mono  (Primitives / Font Family)
    font-family.geist.tokens.json         ← Geist/Fira Code
    font-family.poppins.tokens.json       ← Poppins/Source Code Pro
    typography.tokens.json                ← font-size, weight, line-height, letter-spacing, paragraph-spacing (Primitives / Typography)
  brand-palette/
      iris.tokens.json                      ← Blue brand          (Semantic / Brand)
    fern.tokens.json                      ← Green brand
    rose.tokens.json                      ← Red brand
    dahlia.tokens.json                    ← Purple brand
    marigold.tokens.json                  ← Orange brand
  semantic/
    color.light.tokens.json               ← Light mode          (Semantic / Color)
    color.dark.tokens.json                ← Dark mode
    color.dim.tokens.json                 ← Dim mode (softer dark)
    color.colorblind.tokens.json          ← Colorblind mode (tone-adjusted)
    typography.inter.tokens.json          ← Inter               (Semantic / Typography)
    typography.geist.tokens.json          ← Geist
    typography.poppins.tokens.json        ← Poppins
  shared/
    color-active.neutral.tokens.json      ← neutral mode        (Color / Active)
    color-active.brand.tokens.json        ← brand mode
    color-active.info.tokens.json         ← info mode
    color-active.success.tokens.json      ← success mode
    color-active.warning.tokens.json      ← warning mode
    color-active.danger.tokens.json       ← danger mode
    color-active.contrast.tokens.json     ← contrast mode
```

---

## Common Tasks for AI Agents

**Add a new brand color role (e.g. "promo"):**
1. Add `promo.lighter/light/base/dark/darker` to all 5 brand-palette JSON files, aliasing `Primitives / Color` palettes
2. Add `color/promo`, `on-color/promo`, `container/promo`, etc. to all 4 `semantic/color.*.tokens.json` files
3. In Figma: add the variables to `Brand Palette` (all 5 modes) then `Semantic / Color` (all 4 modes)
4. Add `color-active.{mode}.tokens.json` entries aren't needed — `Color / Active` only has 6 fixed roles

**Add a new text style (e.g. "text-xl"):**
1. Add `text-xl.regular/medium/semibold/bold` with 4 properties to all 3 `semantic/typography.*.tokens.json` files
2. In Figma: add the 4 variables per mode to `Semantic / Typography` collection (3 modes)
3. Create a Figma Text Style named `text-xl/regular` etc.

**Change the primary brand color:**
1. Change the alias target in brand-palette JSON files (e.g. change iris from cobalt to sapphire)
2. Update Figma `Semantic / Brand` collection Iris mode variable aliases

**Add a new component color family (e.g. component with color="warn"):**
- `Color / Active` already has `warning` mode — point the component's color tokens at `color`, `on-color`, etc. from `Color / Active`
- No new collection needed; just apply the `warning` mode on the component frame using `Semantic / Active Color`

**NEVER:**
- Add component-specific tokens (button-padding, card-radius) to Tier 1 or Tier 2 collections
- Reference `Semantic / Color` tokens from within `Semantic / Color` (no circular aliases)
- Create a new Figma collection outside this hierarchy without updating `manifest.json`
- Put color-family-varying tokens in a component's Structure collection — they belong in `Color / Active`- **Rename, delete, reorder, or modify the 3 separator collections** (`----- TIER 1 ----------------`, `----- TIER 2 ----------------`, `----- TIER 3 ----------------`) — they are permanent visual fixtures