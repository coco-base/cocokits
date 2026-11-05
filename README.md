# CocoKits

Unstyled components for **Angular**, **React** (including Next.js) and **Vue**, and themes that style all three the same way.

- **One behaviour, three frameworks.** Keyboard handling, ARIA, state and form participation are written once in framework-free code. Thin adapters bind it to each framework.
- **Unstyled by contract.** Every part renders a fixed `cck-` class and `data-*` attributes for each state. A theme is CSS plus a typed config, so it works the same in every framework.
- **Accessible and SSR-safe.** Roles and keyboard behaviour follow the WAI-ARIA Authoring Practices. Nothing touches `window` or `document` at import time.

Documentation: [doc.cocokits.com](https://doc.cocokits.com).

## Packages

Every package has the same version.

| Package | What it is |
|---|---|
| `@cocokits/angular` | Angular components, one subpath per component (`@cocokits/angular/button`) |
| `@cocokits/react` | React components, one subpath per component (`@cocokits/react/button`) |
| `@cocokits/vue` | Vue components, one subpath per component (`@cocokits/vue/button`) |
| `@cocokits/theme-cocokits` | The CocoKits theme: CSS, tokens and `ThemeConfig`, for any framework |
| `@cocokits/theme-cocokits-angular`, `-react`, `-vue` | The typed layer of the CocoKits theme for one framework |
| `@cocokits/theme-frames-x` | The Frames X theme: CSS and `ThemeConfig`, for any framework |
| `@cocokits/theme-frames-x-angular`, `-react`, `-vue` | The typed layer of the Frames X theme for one framework |

Internal packages that the packages above depend on: `@cocokits/angular-core`, `@cocokits/react-core`, `@cocokits/vue-core` (the framework adapters), `@cocokits/machines` (component behaviour), `@cocokits/cdk` (shared building blocks), `@cocokits/shared` and `@cocokits/utils`. They come in as dependencies; applications do not import them directly.

## Install

Install the component package of your framework and a theme:

```bash
# Angular
npm install @cocokits/angular @cocokits/theme-cocokits @cocokits/theme-cocokits-angular

# React or Next.js
npm install @cocokits/react @cocokits/theme-cocokits @cocokits/theme-cocokits-react

# Vue or Nuxt
npm install @cocokits/vue @cocokits/theme-cocokits @cocokits/theme-cocokits-vue
```

Then load the theme stylesheet (`@cocokits/theme-cocokits/styles.css`) and import components from their subpaths. Usage, theming and every component are in the [documentation](https://doc.cocokits.com).

## Supported versions

| | Range |
|---|---|
| Angular | 22 |
| React | 19 (Next.js 15 and 16) |
| Vue | 3.5 (Nuxt 3 and 4) |

The exact ranges are the `peerDependencies` of each package and [`compatibility.json`](compatibility.json).

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md). Coding agents start at [AGENTS.md](AGENTS.md). To report a vulnerability, see [SECURITY.md](SECURITY.md).

## License

[Apache License 2.0](LICENSE)
