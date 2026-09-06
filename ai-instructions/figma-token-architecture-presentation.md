# AI Prompt: Generate CocoKits Token Architecture Figma Presentation

> **Purpose:** Give this entire file to any AI (Copilot, Claude, Cursor, etc.) as a single prompt.  
> It contains everything needed to regenerate the multi-page Figma presentation for the  
> CocoKits Design Token Architecture — colors, layout, frame content, and working plugin JS code.

---

## 1 — TASK OVERVIEW

You will build a **multi-page Figma presentation** documenting the CocoKits 3-tier design token architecture using the Figma MCP plugin (`mcp_figma_use_figma`).

| Property | Value |
|---|---|
| **Figma file key** | `1sGvnXlFCiCqz9wly65Zdq` |
| **Pages to build** | Page 9 "Midnight Indigo" · Page 10 "Ember Dark" · Page 11 "Arctic Light" |
| **Frames per page** | 11 frames |
| **Frame canvas size** | 1440 × 900 px |
| **Frame grid** | 3 columns, 80 px gap between frames |

**Frame grid coordinates formula:**
```js
var fi = 0; // frame index 0–10
var x = (fi % 3) * (1440 + 80);
var y = Math.floor(fi / 3) * (900 + 80);
```

---

## 2 — CRITICAL TECHNICAL CONSTRAINTS

Read every rule. Violating any one will break the build.

### 2.1 One call, all code

**ALL frames for ALL pages must be built inside a single `mcp_figma_use_figma` call.**  
Nodes created in one call are destroyed the moment you make a second call — even if you  
save IDs. Do not split work across calls. Open the target page, build every frame, done.

### 2.2 No arrow destructuring in forEach

**FORBIDDEN — causes silent ReferenceError:**
```js
// ❌ Never do this
items.forEach(([a, b]) => { ... });
items.forEach(({ key, value }) => { ... });
```

**CORRECT — always use traditional function body:**
```js
// ✅ Always do this
items.forEach(function(item, i) {
  var a = item[0];
  var b = item[1];
  // ...
});
```

### 2.3 Font loading

Load **every** font family+style combination you will use **before** any text node is created.  
Failing to load a font causes a runtime error that aborts the entire run.

```js
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
await figma.loadFontAsync({ family: 'Inter', style: 'SemiBold' });
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Regular' });
await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Medium' });
```

### 2.4 Page switching

Switch to the correct page before adding frames:
```js
var pages = figma.root.children;
var targetPage;
for (var pi = 0; pi < pages.length; pi++) {
  if (pages[pi].name === '9. Midnight Indigo') {
    targetPage = pages[pi];
    break;
  }
}
await figma.setCurrentPageAsync(targetPage);
```

### 2.5 Variable declaration

Use `var` everywhere (not `let`/`const`) inside async plugin functions to avoid scope bugs  
in older Figma plugin runtimes.

### 2.6 Frame filling

Every frame must have **exactly one fill** (the page background color). Frames must fill  
their full 1440 × 900 px. Do not leave white/empty areas at the bottom.

### 2.7 No CocoKits imports

Code examples shown inside frames (for illustration) must NOT import from CocoKits packages.  
Show raw CSS/HTML/SCSS snippets instead.

---

## 3 — COMPLETE HELPER FUNCTION LIBRARY

Copy this entire block verbatim into the top of your plugin code.

```js
// ─── Color conversion ───────────────────────────────────────────────────────
function hx(h) {
  h = h.replace('#', '');
  return { r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255 };
}

// ─── Solid fill helper ───────────────────────────────────────────────────────
function sf(colorHex, opacity) {
  return [{ type: 'SOLID', color: hx(colorHex), opacity: opacity != null ? opacity : 1 }];
}

// ─── Rectangle ───────────────────────────────────────────────────────────────
// R(w, h, colorHex, opts{cornerRadius, opacity, name, strokeHex, strokeWeight})
function R(w, h, colorHex, opts) {
  var r = figma.createRectangle();
  r.resize(w, h);
  r.fills = colorHex ? sf(colorHex, opts && opts.opacity) : [];
  if (opts && opts.cornerRadius) r.cornerRadius = opts.cornerRadius;
  if (opts && opts.strokeHex) {
    r.strokes = [{ type: 'SOLID', color: hx(opts.strokeHex) }];
    r.strokeWeight = opts.strokeWeight || 1;
    r.strokeAlign = 'INSIDE';
  }
  if (opts && opts.name) r.name = opts.name;
  return r;
}

// ─── Text node ───────────────────────────────────────────────────────────────
// TX(chars, size, colorHex, opts{style, mono, width, lineHeight, letterSpacing, name, align, opacity})
function TX(chars, size, colorHex, opts) {
  var t = figma.createText();
  var fam = (opts && opts.mono) ? 'JetBrains Mono' : 'Inter';
  var sty = (opts && opts.style) ? opts.style : 'Regular';
  t.fontName = { family: fam, style: sty };
  t.fontSize = size;
  t.characters = String(chars);
  t.fills = sf(colorHex, opts && opts.opacity);
  if (opts && opts.width) {
    t.textAutoResize = 'HEIGHT';
    t.resize(opts.width, 20);
  } else {
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
  }
  if (opts && opts.lineHeight) t.lineHeight = { value: opts.lineHeight, unit: 'PIXELS' };
  if (opts && opts.letterSpacing) t.letterSpacing = { value: opts.letterSpacing, unit: 'PERCENT' };
  if (opts && opts.align) t.textAlignHorizontal = opts.align;
  if (opts && opts.name) t.name = opts.name;
  return t;
}

// ─── Auto-layout frame ────────────────────────────────────────────────────────
// AF(dir, gap, padH, padV, colorHex, opts{cornerRadius, name, strokeHex, strokeWeight, w, h})
function AF(dir, gap, padH, padV, colorHex, opts) {
  var f = figma.createFrame();
  f.layoutMode = dir || 'VERTICAL';
  f.itemSpacing = gap || 0;
  f.paddingLeft = padH || 0;
  f.paddingRight = padH || 0;
  f.paddingTop = padV || 0;
  f.paddingBottom = padV || 0;
  f.counterAxisSizingMode = 'AUTO';
  f.primaryAxisSizingMode = 'AUTO';
  f.fills = colorHex ? sf(colorHex) : [];
  if (opts && opts.cornerRadius) f.cornerRadius = opts.cornerRadius;
  if (opts && opts.name) f.name = opts.name;
  if (opts && opts.strokeHex) {
    f.strokes = [{ type: 'SOLID', color: hx(opts.strokeHex) }];
    f.strokeWeight = opts.strokeWeight || 1;
    f.strokeAlign = 'INSIDE';
  }
  if (opts && opts.w) { f.counterAxisSizingMode = 'FIXED'; f.resize(opts.w, 10); }
  return f;
}

// ─── Pill / badge ─────────────────────────────────────────────────────────────
// PILL(label, bgHex, textHex, opts{mono, style})
function PILL(label, bgHex, textHex, opts) {
  var f = AF('HORIZONTAL', 0, 10, 4, bgHex, { cornerRadius: 999 });
  var t = TX(label, 12, textHex || '#ffffff', { style: (opts && opts.style) || 'Medium', mono: opts && opts.mono });
  f.appendChild(t);
  return f;
}

// ─── Inline code span ─────────────────────────────────────────────────────────
// CODE(text, bgHex, textHex)
function CODE(text, bgHex, textHex) {
  var f = AF('HORIZONTAL', 0, 6, 2, bgHex || '#1e293b', { cornerRadius: 4 });
  var t = TX(text, 11, textHex || '#7dd3fc', { style: 'Regular', mono: true });
  f.appendChild(t);
  return f;
}

// ─── Horizontal divider line ──────────────────────────────────────────────────
// DIVIDER(w, colorHex, opacity)
function DIVIDER(w, colorHex, opacity) {
  var r = R(w, 1, colorHex || '#ffffff', { opacity: opacity || 0.12 });
  return r;
}

// ─── Dot bullet ───────────────────────────────────────────────────────────────
function DOT(colorHex) {
  var e = figma.createEllipse();
  e.resize(6, 6);
  e.fills = sf(colorHex || '#94a3b8');
  return e;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
// STAT(value, label, bgHex, accent, textHex)
function STAT(value, label, bgHex, accent, textHex) {
  var f = AF('VERTICAL', 6, 20, 16, bgHex, { cornerRadius: 12 });
  f.counterAxisSizingMode = 'FIXED';
  f.resize(160, 10);
  f.primaryAxisSizingMode = 'AUTO';
  var vt = TX(value, 32, accent || '#7c6fea', { style: 'Bold' });
  var lt = TX(label, 12, textHex || '#94a3b8', { style: 'Regular', width: 120 });
  lt.textAutoResize = 'HEIGHT';
  lt.resize(120, 20);
  f.appendChild(vt);
  f.appendChild(lt);
  return f;
}

// ─── Tag / chip row builder ───────────────────────────────────────────────────
function TAG_ROW(labels, bgHex, textHex) {
  var row = AF('HORIZONTAL', 8, 0, 0, null);
  labels.forEach(function(lbl) {
    row.appendChild(PILL(lbl, bgHex || '#1e293b', textHex || '#94a3b8'));
  });
  return row;
}

// ─── Two-column code block (before / after) ──────────────────────────────────
// CODE_BLOCK(lines, bgHex, textHex, opts{width, monoSize})
function CODE_BLOCK(lines, bgHex, textHex, opts) {
  var w = (opts && opts.width) || 500;
  var sz = (opts && opts.monoSize) || 11;
  var outer = AF('VERTICAL', 0, 0, 0, bgHex || '#0d1117', { cornerRadius: 8 });
  outer.counterAxisSizingMode = 'FIXED';
  outer.resize(w, 10);
  outer.primaryAxisSizingMode = 'AUTO';
  // header bar
  var hdr = AF('HORIZONTAL', 6, 12, 8, null);
  hdr.counterAxisSizingMode = 'FIXED';
  hdr.resize(w, 10);
  hdr.primaryAxisSizingMode = 'AUTO';
  var dots = ['#ff5f57','#febc2e','#28c840'];
  dots.forEach(function(dc) {
    var e = figma.createEllipse();
    e.resize(10, 10);
    e.fills = sf(dc);
    hdr.appendChild(e);
  });
  // code lines
  var body = AF('VERTICAL', 3, 16, 12, null);
  body.counterAxisSizingMode = 'FIXED';
  body.resize(w - 32, 10);
  body.primaryAxisSizingMode = 'AUTO';
  lines.forEach(function(line) {
    var t = TX(line, sz, textHex || '#94a3b8', { style: 'Regular', mono: true, width: w - 32 });
    t.textAutoResize = 'HEIGHT';
    body.appendChild(t);
  });
  outer.appendChild(hdr);
  outer.appendChild(body);
  return outer;
}

// ─── Section heading factory ──────────────────────────────────────────────────
// SECTION_HEAD(n, title, subtitle, theme)
// theme = { a1, tx1, tx2, bg }
function SECTION_HEAD(n, title, subtitle, theme) {
  var g = AF('VERTICAL', 8, 0, 0, null);
  var num = TX('0' + n, 11, theme.a1, { style: 'SemiBold', letterSpacing: 15 });
  var ttl = TX(title, 36, theme.tx1, { style: 'Bold' });
  var sub = TX(subtitle, 15, theme.tx2, { style: 'Regular', width: 600 });
  sub.textAutoResize = 'HEIGHT';
  g.appendChild(num);
  g.appendChild(ttl);
  if (subtitle) g.appendChild(sub);
  return g;
}

// ─── TOC footer ────────────────────────────────────────────────────────────────
// TOC_FOOTER(labels, activeIdx, theme)
// theme = { bg, a1, tx2 }
function TOC_FOOTER(labels, activeIdx, theme) {
  var strip = AF('HORIZONTAL', 0, 40, 0, theme.bgFooter || theme.bg);
  strip.counterAxisSizingMode = 'FIXED';
  strip.resize(1440, 10);
  strip.primaryAxisSizingMode = 'AUTO';
  strip.paddingTop = 20;
  strip.paddingBottom = 20;
  strip.itemSpacing = 0;

  labels.forEach(function(lbl, i) {
    var isActive = (i === activeIdx);
    var item = AF('VERTICAL', 4, 0, 0, null);
    item.counterAxisSizingMode = 'FIXED';
    item.resize(1440 / labels.length, 10);
    item.primaryAxisSizingMode = 'AUTO';
    item.paddingLeft = 16;
    item.paddingRight = 16;

    if (isActive) {
      var bar = R(1440 / labels.length, 2, theme.a1);
      item.appendChild(bar);
    }
    var t = TX(lbl, 10, isActive ? theme.a1 : (theme.tx2 || '#64748b'), {
      style: isActive ? 'SemiBold' : 'Regular',
      align: 'CENTER',
      width: (1440 / labels.length) - 32
    });
    t.textAutoResize = 'HEIGHT';
    item.appendChild(t);
    strip.appendChild(item);
  });
  return strip;
}

// ─── Main frame factory ──────────────────────────────────────────────────────
// FRAME(name, fi, bgHex)  — creates 1440×900 canvas frame at grid position fi
function FRAME(name, fi, bgHex) {
  var f = figma.createFrame();
  f.name = name;
  f.resize(1440, 900);
  f.x = (fi % 3) * (1440 + 80);
  f.y = Math.floor(fi / 3) * (900 + 80);
  f.fills = sf(bgHex);
  figma.currentPage.appendChild(f);
  return f;
}
```

---

## 4 — PAGE COLOR THEMES

### Theme A: Midnight Indigo (Page 9)

```js
var themeA = {
  bg:         '#060812',   // deep navy background
  bgCard:     '#0d1120',   // card background
  bgCode:     '#0a0f1e',   // code block background
  bgFooter:   '#030508',   // TOC footer background
  a1:         '#7c6fea',   // primary violet accent
  a2:         '#22d3ee',   // cyan accent
  a3:         '#f472b6',   // pink accent
  tx1:        '#e2e8f0',   // primary text
  tx2:        '#94a3b8',   // muted text
  grn:        '#4ade80',   // success green
  red:        '#f87171',   // error red
  amb:        '#fbbf24',   // amber/warning
  border:     '#1e293b',   // subtle border
};
```

### Theme B: Ember Dark (Page 10)

```js
var themeB = {
  bg:         '#0f0a06',   // deep charcoal background
  bgCard:     '#1a1008',   // warm dark card
  bgCode:     '#120c05',   // code block background
  bgFooter:   '#080603',   // TOC footer background
  a1:         '#f59e0b',   // amber primary
  a2:         '#fb923c',   // orange secondary
  a3:         '#fcd34d',   // gold accent
  tx1:        '#fef3c7',   // warm white text
  tx2:        '#d97706',   // warm muted text
  grn:        '#86efac',   // success green
  red:        '#fca5a5',   // error rose
  amb:        '#fde68a',   // amber highlight
  border:     '#292009',   // warm border
};
```

### Theme C: Arctic Light (Page 11)

```js
var themeC = {
  bg:         '#f8fafc',   // light gray background
  bgCard:     '#ffffff',   // white card
  bgCode:     '#1e293b',   // dark code block (inverted)
  bgFooter:   '#e2e8f0',   // light footer
  a1:         '#0891b2',   // cyan primary
  a2:         '#0369a1',   // blue secondary
  a3:         '#7c3aed',   // purple accent
  tx1:        '#0f172a',   // near-black text
  tx2:        '#475569',   // muted dark text
  grn:        '#16a34a',   // success green
  red:        '#dc2626',   // error red
  amb:        '#d97706',   // amber
  border:     '#cbd5e1',   // light border
};
```

---

## 5 — TOC FOOTER LABELS (same for all pages)

The footer runs across every frame and acts as a presentation nav indicator.

```js
var TOC = [
  'Cover',
  'Why Tokens',
  'Three Tiers',
  'Primitives',
  'Semantic',
  'Component',
  'Color Matrix',
  'Token Chain',
  'Designers',
  'Developers',
  'FAQ'
];
```

Use `TOC_FOOTER(TOC, frameIndex, theme)` at the bottom of every frame.

---

## 6 — FRAME-BY-FRAME CONTENT SPECIFICATION

### Frame 0 — Cover

**Purpose:** Presentation title card.

**Layout** (all centered, stacked vertically):
- Overline pill: `"TOKEN ARCHITECTURE"` using `PILL()` with `a1` background
- Title: `"Design Token\nArchitecture"`, 72px, Bold, `tx1`
- Subtitle: `"A 3-tier system for scalable, themeable, brand-agnostic UI"`, 20px, `tx2`
- Divider: 120px wide, 2px tall, `a1`
- Version row: `"v3.0"` + `"CocoKits Design System"` side by side, 14px, `tx2`
- Three stat cards using `STAT()`:
  - `"3"` / `"Token Tiers"` 
  - `"42"` / `"Semantic Colors"`
  - `"6"` / `"Color Roles"`
- Bottom-left: small `"cocokits.io"` logomark text in `a1`

**No TOC footer needed on cover** (or use `activeIdx = 0`).

---

### Frame 1 — Why Tokens

**Purpose:** Explain the problem design tokens solve.

**Layout:** Two-column — left column has heading + problems list, right column has before/after code panels.

**Left column content:**
- Section head: `SECTION_HEAD(1, 'Why Design\nTokens?', '', theme)`
- Subtitle: `"Without tokens, maintaining consistent UI across multiple brands, themes, and component states is nearly impossible."`, 14px, `tx2`
- Problem bullets (using `DOT() + TX()`):
  - `"Hardcoded hex values scattered across 200+ component files"`
  - `"One brand color change requires touching every CSS file"`
  - `"Light/dark mode doubles all color declarations"`
  - `"New brand = fork the entire codebase"`

**Right column content — two code blocks stacked:**

*Before block (bad):*
```
// ❌ Before: Hardcoded values
.button-primary {
  background: #9333EA;
  color: #FFFFFF;
  border-radius: 4px;
}
.button-primary:hover {
  background: #7E22CE;
}
.icon { color: #9333EA; }
.badge { background: #9333EA; }
```

*After block (good):*
```
// ✅ After: Token-driven
.button-primary {
  background: var(--cck-color);
  color: var(--cck-on-color);
  border-radius: var(--button-radius);
}
.button-primary:hover {
  background: var(--cck-color);
  opacity: 0.9;
}
.icon { color: var(--cck-color); }
.badge { background: var(--cck-color); }
```

**TOC footer:** active tab = 1 (`'Why Tokens'`)

---

### Frame 2 — Three Tiers

**Purpose:** Explain the 3-tier architecture with a visual hierarchy diagram.

**Layout:** Center-focused vertical diagram with connectors.

**Content:**

Tier boxes stacked vertically with arrows between them:

**Tier 1 — Primitives** (card with `a1` left border accent):
- Label: `"TIER 1"` pill in `a1`
- Title: `"Primitive Tokens"`, 20px, Bold
- Description: `"Raw design values. Named constants mapped to fundamental decisions."`, 13px, `tx2`  
- Tag row: `blue-600` · `spacing-4` · `font-size-sm` · `radius-md`

**Arrow indicator** (↓ icon, 20px, `tx2`)

**Tier 2 — Semantic** (card with `a2` left border accent):
- Label: `"TIER 2"` pill in `a2`
- Title: `"Semantic Tokens"`, 20px, Bold
- Description: `"Named by intent, not value. References Primitives. Brand/theme-dependent."`, 13px, `tx2`
- Tag row: `brand-color` · `surface-default` · `on-surface` · `disabled-border`

**Arrow indicator** (↓ icon, 20px, `tx2`)

**Tier 3 — Component** (card with `a3` left border accent):
- Label: `"TIER 3"` pill in `a3`
- Title: `"Component Tokens"`, 20px, Bold
- Description: `"Scoped to one component. References Semantics. Consumed by CSS."`, 13px, `tx2`
- Tag row: `button-height` · `button-bg` · `button-radius` · `cck-color`

**Golden Rule banner** at bottom:
- Background: `a1` at 10% opacity, border `a1` at 30% opacity
- Text: `"Golden Rule: Tokens flow downward only. Tier 3 → Tier 2 → Tier 1. Never skip tiers."`, 13px, `a1`

**TOC footer:** active tab = 2

---

### Frame 3 — Primitives

**Purpose:** Show all 4 primitive token categories with actual values.

**Layout:** 2×2 grid of category cards.

**Card A — Color Palette** (top-left):
- Title: `"Color Palette"` + subtitle `"Named color scales, 11 steps each"`
- Visual: A row of 11 color swatches for `blue` scale — circles or rectangles, label below each step
  - `blue-50` `#eff6ff` → `blue-950` `#172554`
- Below: pill tags for other scales: `red` · `green` · `amber` · `purple` · `gray` · `slate`

**Card B — Spacing Scale** (top-right):
- Title: `"Spacing Scale"` + subtitle `"4-point grid system"`
- Visual: horizontal bars of increasing width, labeled:
  - `spacing-1` = 4px · `spacing-2` = 8px · `spacing-4` = 16px · `spacing-6` = 24px · `spacing-8` = 32px · `spacing-10` = 40px · `spacing-12` = 48px

**Card C — Typography** (bottom-left):
- Title: `"Typography Scale"` + subtitle `"Inter + JetBrains Mono"`
- List of text styles at actual sizes:
  - `text-xs` — 12px sample text
  - `text-sm` — 14px sample text
  - `text-md` — 16px sample text
  - `text-lg` — 18px sample text
  - `text-xl` — 20px sample text
  - `display-sm` — 22px **SemiBold** sample
  - `display-md` — 24px **SemiBold** sample
  - Monospace line: `code-font` — 13px JetBrains Mono

**Card D — Border Radius** (bottom-right):
- Title: `"Radius Scale"` + subtitle `"From sharp to pill"`
- Row of squares with increasing corner radius:
  - `none` 0px · `xs` 2px · `sm` 4px · `md` 8px · `lg` 12px · `xl` 16px · `full` 9999px

**TOC footer:** active tab = 3

---

### Frame 4 — Semantic Tokens

**Purpose:** Show the 7 color families × 6 roles grid for both light and dark modes.

**Layout:** Main grid + mode toggle indicator.

**Mode panels: Light Mode | Dark Mode** (two side-by-side panels or tabs at top)

**Main grid — 7 families × 6 roles:**

Rows = families: `neutral` · `brand` · `info` · `success` · `warning` · `danger` · `contrast`  
Columns = roles: `color` · `on-color` · `container` · `on-container` · `outline` · `focus`

For each (family, role) cell show a colored swatch rectangle + the hex value below it.  
Use representative hex values (light mode):

| family | color | on-color | container | on-container | outline | focus |
|---|---|---|---|---|---|---|
| neutral | `#6b7280` | `#ffffff` | `#f3f4f6` | `#111827` | `#9ca3af` | `rgba(107,114,128,0.2)` |
| brand | `#9333ea` | `#ffffff` | `#f3e8ff` | `#581c87` | `#9333ea` | `rgba(243,232,255,0.6)` |
| info | `#2563eb` | `#ffffff` | `#dbeafe` | `#1e3a8a` | `#2563eb` | `rgba(219,234,254,0.6)` |
| success | `#16a34a` | `#ffffff` | `#dcfce7` | `#14532d` | `#16a34a` | `rgba(220,252,231,0.6)` |
| warning | `#d97706` | `#ffffff` | `#fef3c7` | `#78350f` | `#d97706` | `rgba(254,243,199,0.6)` |
| danger | `#dc2626` | `#ffffff` | `#fee2e2` | `#7f1d1d` | `#dc2626` | `rgba(254,226,226,0.6)` |
| contrast | `#0f172a` | `#ffffff` | `#1e293b` | `#f8fafc` | `#334155` | `rgba(15,23,42,0.4)` |

Structural tokens section below the grid (single row, smaller):
- `surface-default` · `surface-muted` · `on-surface` · `on-surface-muted` · `border-default` · `disabled-surface`

**TOC footer:** active tab = 4

---

### Frame 5 — Component Tokens

**Purpose:** Explain the 3-source component token model — Size / Type / Shared Color.

**Layout:** Three-column explanation + component index table.

**Left column — Size Collection:**
- Title: `"Size Collection"` with `a1` accent
- Subtitle: `"Dimensions per variant (sm/md/lg)"`
- Table showing Button/Size tokens:
  ```
  Token              sm    md    lg
  button-height      32    40    48
  button-padding-x    8    16    16
  button-font-size   14    14    16
  button-icon-size   16    20    20
  button-gap          4     8     8
  ```

**Center column — Type Collection:**
- Title: `"Type Collection"` with `a2` accent
- Subtitle: `"Visual recipe per style variant"`
- Table showing Button/Type structure:
  ```
  Token           primary   outline   light
  button-bg       color     transp.   container
  button-text     on-color  on-cont.  on-cont.
  button-border   none      outline   none
  button-focus    focus     focus     focus
  ```

**Right column — Shared Color Collection:**
- Title: `"Shared Color Collection"` with `a3` accent
- Subtitle: `"One collection — 6 tokens — 7 modes"`
- Key insight: `"Modes = color families: neutral · brand · info · success · warning · danger · contrast"`
- The 6 tokens listed as pills: `color` · `on-color` · `container` · `on-container` · `outline` · `focus`
- Formula: `"7 families × 6 roles = 42 semantic colors"` (using `a1` large number = `"42"`)

**Component index table** (bottom, full width):
- Condensed table: Component · Size Modes · Type Modes · Color Tokens Used
- Show: Button, Toggle, Checkbox, Tab, Badge, Icon, Divider, Form Field

**TOC footer:** active tab = 5

---

### Frame 6 — Color Matrix

**Purpose:** Visual matrix showing all components × all 7 color families.

**Layout:** Dense grid visualization — colored button/badge swatches in each cell.

**Columns** = color families: `neutral` · `brand` · `info` · `success` · `warning` · `danger` · `contrast`  
**Rows** = component types: `Button (primary)` · `Button (outline)` · `Button (light)` · `Toggle` · `Checkbox` · `Badge` · `Icon`

For each cell, render a small colored rectangle using the family's `color` hex (see Frame 4 values).  
Label each row and column with the name using `TX()`.

**Accent box on the right:**
- Title: `"Why only 6 roles?"`
- Content: audit table showing which tokens each component actually uses:
  ```
  Component           Tokens used   Which ones
  Button (primary)    3             color · on-color · focus
  Button (outline)    3             on-container · outline · focus
  Toggle              2             color · focus
  Checkbox            2             color · focus
  Badge               2             color · on-color
  Icon                1             color
  ```
- Callout: `"No component needs all 6. Most need 1–3."`, 13px, `a1`

**TOC footer:** active tab = 6

---

### Frame 7 — Token Chain

**Purpose:** Show the full reference chain from raw hex to a rendered button.

**Layout:** Vertical chain diagram spanning full frame height.

**Chain steps (each as a card with left-border accent color):**

```
TIER 1 — PRIMITIVE  (a1 border)
  purple-600: #9333EA
  ↓ (value defined here)

TIER 2 — BRAND PALETTE  (a2 border)
  Mode: Brand-A
  brand-base: {purple-600}
  ↓ (alias to primitive)

TIER 2 — SEMANTIC COLOR  (a2 border)
  Mode: Light
  brand-color: {brand-base}
  ↓ (alias to brand palette)

TIER 3 — SHARED COLOR  (a3 border)
  Mode: brand
  color: {brand-color}
  ↓ (alias to semantic)

CSS OUTPUT
  --cck-color: var(--brand-color);
  ↓ (set by color class)

COMPONENT CSS
  .cck-button__type--primary {
    background-color: var(--cck-color);
  }
  ↓ (consumed by type class)

BROWSER
  background-color: #9333EA
```

**"What If" panel** on the right (3 small cards):
- Card 1: `"Switch to Brand-B"` → only Brand Palette mode changes → `brand-base: {teal-600}` → everything turns teal
- Card 2: `"Switch to Dark Mode"` → only Semantic Color mode changes → `brand-color: {brand-light}` → lighter shade
- Card 3: `"Switch color to danger"` → only Shared Color mode changes → `color: {danger-color}` → turns red

**TOC footer:** active tab = 7

---

### Frame 8 — For Designers

**Purpose:** How to use these tokens inside Figma.

**Layout:** Left column text flow + right column Figma variable panel mockup.

**Left column:**
- Section head: `SECTION_HEAD(9, 'For\nDesigners', 'Figma variable workflow', theme)`
- Numbered steps:
  1. `"Create component as a Figma component set with variants"`
  2. `"Bind Size tokens to dimension properties using Button/Size collection"`
  3. `"Bind structural colors to Type collection tokens"`
  4. `"Bind color-family fills to Color/Active collection"`
  5. `"Set variant property per type, color, size — each maps to a mode"`
- Key insight: `"States (hover/focus/disabled) are Figma variants, NOT separate modes — avoids 420-mode explosion"`
- Mode switch table:
  ```
  Property          Collection       Mode set by
  Height            Button/Size      size variant
  Background        Button/Type +    type + color
                    Color/Active     variants
  Border radius     Button/Type      type variant
  ```

**Right column — Figma variable panel mockup:**
- Dark card with monospaced text showing the variable collection tree:
  ```
  Variables
  ├── Primitives / Color        [Default]
  ├── Primitives / Spacing      [Default]
  ├── Brand Palette             [Brand-A] [Brand-B]
  ├── Semantic / Color          [Light] [Dark]
  ├── Color / Active            [neutral] [brand] [info] ...
  ├── Button / Size             [sm] [md] [lg]
  ├── Button / Type             [primary] [outline] [basic] [light]
  ├── Toggle / Size             [sm] [md] [lg]
  └── Tab / Type                [fill] [border] [basic] [line]
  ```

**TOC footer:** active tab = 8

---

### Frame 9 — For Developers

**Purpose:** Show the CSS architecture and class naming convention.

**Layout:** Full-width code-heavy layout with 3 code blocks stacked.

**Top section:** Section head + class naming explanation
- Pattern: `.cck-{component}__{prop}--{value}`
- Examples via pills:
  - `.cck-button__type--primary`
  - `.cck-button__color--brand`
  - `.cck-button__size--md`
  - `.cck-toggle--checked`

**Code Block 1 — Tier 2 CSS output (Semantic):**
```css
/* Tier 2 — applied to :root */
[data-cck-theme="light"] {
  --brand-color: #9333EA;
  --brand-on-color: #FFFFFF;
  --brand-container: #F3E8FF;
  --brand-on-container: #581C87;
  --brand-outline: #9333EA;
  --brand-focus: rgba(243,232,255,0.6);
  --surface-default: #FFFFFF;
  --on-surface: #1F2937;
}
```

**Code Block 2 — Tier 3 Color class:**
```css
/* Tier 3 — Color class sets CSS variables */
.cck-button__color--brand {
  --cck-color: var(--brand-color);
  --cck-on-color: var(--brand-on-color);
  --cck-container: var(--brand-container);
  --cck-on-container: var(--brand-on-container);
  --cck-outline: var(--brand-outline);
  --cck-focus: var(--brand-focus);
}
```

**Code Block 3 — Tier 3 Type class reads variables:**
```css
/* Tier 3 — Type class reads the variables */
.cck-button__type--primary:not(:disabled) {
  background-color: var(--cck-color);
  color: var(--cck-on-color);
  border-radius: var(--button-radius);
}
.cck-button__type--outline:not(:disabled) {
  background-color: transparent;
  border: 1px solid var(--cck-outline);
  color: var(--cck-on-container);
}
```

**Adding new color/type callout:**
- `"Adding a new color: 1 new Color class. Zero type changes."` (green checkmark)
- `"Adding a new type: 1 new Type class. Zero color changes."` (green checkmark)

**TOC footer:** active tab = 9

---

### Frame 10 — FAQ

**Purpose:** Address common questions and misconceptions.

**Layout:** Two-column FAQ grid — questions as cards.

**6 Q&A cards (3 per column):**

**Column 1:**

1. **"Why not one big collection?"**  
   `"Figma limits 4 modes per collection. More importantly: separate collections let you switch size, color, and type independently. Combined = exponential mode explosion (sm-primary-brand = one mode, etc.)"`

2. **"Why is Color shared, not per-component?"**  
   `"The 6 roles (color, on-color, container…) mean identical things across all components. Per-component would duplicate the same aliases 30+ times."`

3. **"What if a component needs a 7th color role?"**  
   `"First check: is it structural (Type collection) or color-family-dependent (Shared Color)? Structural = Type collection. Genuinely new role = audit all 30+ components first. We audited and confirmed 6 is sufficient."`

**Column 2:**

4. **"Where do hover/focus/disabled states live?"**  
   `"States are Figma component variants (design) and CSS pseudo-classes (code). NOT collection modes. This prevents 420-mode explosions."`

5. **"Why are neutrals brand-dependent?"**  
   `"Different brands have different 'gray temperatures.' Tech brands use cool blue-grays; luxury brands use warm beige-grays. Brand Palette gives full control."`

6. **"How do I switch dark mode in code?"**  
   Code block:
   ```html
   <body data-cck-theme="dark">
   ```
   `"Apply a data attribute to :root. Every component updates automatically."`

**TOC footer:** active tab = 10

---

## 7 — BOILERPLATE: COMPLETE PLUGIN ENTRY POINT

Use this structure as the outer shell of your plugin code:

```js
(async function() {

  // ─── 1. Load all fonts first ──────────────────────────────────────────────
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'SemiBold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Regular' });
  await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Medium' });

  // ─── 2. Paste ALL helper functions here ──────────────────────────────────
  // [ hx, sf, R, TX, AF, PILL, CODE, DIVIDER, DOT, STAT, TAG_ROW,
  //   CODE_BLOCK, SECTION_HEAD, TOC_FOOTER, FRAME ]

  // ─── 3. Define themes ────────────────────────────────────────────────────
  var themeA = { /* midnight indigo */ };
  var TOC = ['Cover','Why Tokens','Three Tiers','Primitives','Semantic',
             'Component','Color Matrix','Token Chain','Designers','Developers','FAQ'];

  // ─── 4. Switch to the target page ────────────────────────────────────────
  var pages = figma.root.children;
  var targetPage = null;
  for (var pi = 0; pi < pages.length; pi++) {
    if (pages[pi].name === '9. Midnight Indigo') {
      targetPage = pages[pi];
      break;
    }
  }
  if (!targetPage) { figma.closePlugin('Page not found'); return; }
  await figma.setCurrentPageAsync(targetPage);

  // ─── 5. Build all 11 frames ───────────────────────────────────────────────
  // Frame 0: Cover
  var f0 = FRAME('01 — Cover', 0, themeA.bg);
  // ... build content, then:
  f0.appendChild(TOC_FOOTER(TOC, 0, themeA));

  // Frame 1: Why Tokens
  var f1 = FRAME('02 — Why Tokens', 1, themeA.bg);
  // ... build content, then:
  f1.appendChild(TOC_FOOTER(TOC, 1, themeA));

  // ... repeat for frames 2–10 ...

  figma.closePlugin('Done — 11 frames built');
})();
```

---

## 8 — DESIGN QUALITY CHECKLIST

Before calling the plugin complete, verify every item:

- [ ] All 11 frames are exactly 1440 × 900 px  
- [ ] Frames fill their full height — no empty white space at the bottom  
- [ ] TOC footer is present on every frame with the correct active tab highlighted  
- [ ] No circular glow effects, gradients, or soft radial fills  
- [ ] All text is legible (minimum contrast: white text on dark frames)  
- [ ] Code blocks use JetBrains Mono, not Inter  
- [ ] No `import` or `require` statements from CocoKits packages in code examples  
- [ ] Arrow destructuring does **NOT** appear anywhere in `forEach` callbacks  
- [ ] All fonts are loaded via `figma.loadFontAsync` before first use  
- [ ] All code runs in a single `mcp_figma_use_figma` call  
- [ ] `var` used throughout (not `let`/`const`)  
- [ ] The frame grid places frames at correct x/y coordinates (3-column layout)

---

## 9 — TOKEN ARCHITECTURE CONTENT REFERENCE

Quick cheat-sheet of key facts from `TOKEN_ARCHITECTURE.md` for use in frame copy and examples:

### Tier 1 — Primitives

| Category | Key values |
|---|---|
| Color palette | blue-50 (#eff6ff) → blue-950 (#172554) · 11 steps |
| Spacing | spacing-1=4px · spacing-2=8px · spacing-4=16px · spacing-6=24px · spacing-8=32px · spacing-10=40px · spacing-12=48px |
| Font sizes | xs=12 · sm=14 · md=16 · lg=18 · xl=20 · 2xl=24 |
| Font weights | regular=400 · medium=500 · semibold=600 · bold=700 |
| Radius | none=0 · xs=2 · sm=4 · md=8 · lg=12 · full=9999 |

### Tier 2 — Semantic

- **Brand Palette modes:** One mode per brand (Brand-A, Brand-B…). Maps families → primitive hues.  
  Example: `brand-base → {purple-600}` · `info-base → {blue-600}` · `success-base → {green-600}`
- **Semantic Color modes:** `Light` and `Dark`. 7 families × 6 roles = **42 color tokens** + structural globals.
- **Structural globals:** `surface-default` · `surface-muted` · `on-surface` · `on-surface-muted` · `border-default` · `disabled-surface` · `disabled-on-surface` · `disabled-border`
- **Semantic Typography:** `text-xs-regular` · `text-sm-medium` · `display-md-semibold` etc.  
  Each token = separate size + weight + line-height properties (not CSS shorthand — Figma can't bind shorthand).

### Tier 3 — Component

- **Button:** 4 types (primary/outline/basic/light) × 7 colors × 3 sizes = controlled via 3 independent classes
- **Toggle:** 1 type, uses only `color` + `focus` from shared collection
- **Checkbox:** uses `color` + `focus`
- **Icon:** uses only `color`
- **Badge:** uses `color` + `on-color`
- **Tab:** 4 types (fill/border/basic/line) — `line` type uses `outline` instead of `color`

### Key innovation

```
Color class sets: --cck-color, --cck-on-color, --cck-container,
                  --cck-on-container, --cck-outline, --cck-focus
Type class reads: those same CSS variables

→ O(1) cost to add a new color (1 class)
→ O(1) cost to add a new type (1 class)
→ Never need both at the same time
```

### Naming convention

- Collections: `{Component} / Size` · `{Component} / Type` · `Color / Active`  
- Tokens in collection: `{component}-{property}-{variant}` → `button-height`, `button-padding-x`  
- CSS classes: `.cck-{component}__{prop}--{value}` → `.cck-button__type--primary`  
- CSS variables for color: `--{family}-{role}` → `--brand-color`, `--danger-focus`  
- Intermediate CSS variables: `--cck-color`, `--cck-on-color`, `--cck-container`, etc.

---

## 10 — REGENERATION CHECKLIST (starting from scratch)

If rebuilding the entire file from zero:

1. Open `https://www.figma.com/design/1sGvnXlFCiCqz9wly65Zdq`
2. Confirm pages 9 (`Midnight Indigo`), 10 (`Ember Dark`), 11 (`Arctic Light`) exist
3. Run ONE plugin call containing:
   - All fonts loaded
   - All helper functions defined
   - All three themes defined
   - Page switch to first target page
   - All 11 frames built for page 9 with theme A
   - `await figma.setCurrentPageAsync(page10)` — switch to page 10
   - All 11 frames built for page 10 with theme B
   - `await figma.setCurrentPageAsync(page11)` — switch to page 11  
   - All 11 frames built for page 11 with theme C
4. Verify all 33 frames are present via screenshot tool
5. Check quality checklist (Section 8)
