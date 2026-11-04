# Themes style guide

How to write a CocoKits theme: the framework-free package `@cocokits/theme-<name>` (a typed `ThemeConfig`, tokens and CSS written against the fixed anatomy classes and `data-*` attributes) and one thin typed theme-layer package per framework (`@cocokits/theme-<name>-<fw>`). A theme changes how a component looks, never how it behaves.

A theme package also ships its logo, one file for a light page and one for a dark page, as asset exports (`logo-light.svg`, `logo-dark.svg`); consumers such as a docs site read them from there.

Cross-cutting rules (the styling contract, CSS isolation, the cascade layer, the theme layer per framework, accessibility invariants, public API discipline) are in [architecture.md](../../architecture.md); this guide adds only what is specific to theme authoring. Components named here only illustrate a rule. Commands are in [targets.md](../workspace/targets.md). Why: [themes](../../why/themes.md).

## Load on demand

| File | Load when |
|---|---|
| [theme-config.md](./theme-config.md) | Adding or changing an option, its values or the parts it applies to; precedence; reserved names |
| [css-conventions.md](./css-conventions.md) | Writing or reviewing theme CSS |
| [theme-layer-per-framework.md](./theme-layer-per-framework.md) | Writing the Angular theme directive or the React/Vue theme wrapper |
| [overlays-and-theme-scope.md](./overlays-and-theme-scope.md) | Styling dialog, popover, menu or other portaled content |

For testing see [testing](../testing/index.md); for the visual accessibility requirements see [accessibility](../accessibility/index.md).
