# Themes and generated assets

Read root `AGENTS.md`. Both published themes share the component selector contract
but have different tokens, prop values, defaults, and templates.

| Theme    | Package                    | Config export         |
| -------- | -------------------------- | --------------------- |
| Frames X | `@cocokits/theme-frames-x` | `framesXThemeConfig`  |
| CocoKits | `@cocokits/theme-cocokits` | `cocokitsThemeConfig` |

For either theme, start under `packages/themes/<theme>`:

- `src/lib/theme-config.ts`: supported components, prop values/defaults, templates.
- `src/styles/scss/_<component>.scss`: authored component appearance.
- `src/styles/scss/_index.scss` and `_all.scss`: Sass exports and combined mixins.
- `src/styles/css/components.scss`: authored entry point for generated component CSS.
- `json-token/manifest.json`: configured token-generation input; inspect the
  manifest's referenced collections/modes before changing token data.
- `src/token`: generated Sass variables, core mixins, CSS, and token dictionary.
- `package.json`: CSS and Sass public exports, plus publication directory.

The theme packages export `styles.css`, `styles.min.css`, `tokens.css`,
`tokens.min.css`, `tokens`, `styles-core`, and `tokens-core`. Confirm the package
manifest before adding installation examples or changing output paths.

## Source to output

| Edit                             | Regenerate                                                                              | Result                                |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| Theme `json-token` data          | `pnpm exec nx run @cocokits/theme-frames-x:token-generator` (or `theme-cocokits`)       | Theme `src/token`                     |
| Theme component SCSS             | `pnpm exec nx run @cocokits/theme-frames-x:build-css` (or `theme-cocokits`)             | Theme `src/styles/css`                |
| Theme styles/tokens used by docs | `pnpm exec nx run @cocokits/storybook-addon-theme:css-generator`                        | Addon `src/assets/styles`             |
| Addon `src/json-token` data      | `pnpm exec nx run @cocokits/storybook-addon-theme:token-generator` then `css-generator` | Addon `src/token` and compiled styles |

After theme token changes, also rebuild component CSS and docs CSS if they consume
the changed tokens. A theme's `build` target runs `build-css` and dependency builds;
it does **not** explicitly regenerate JSON tokens. Do not assume a package build
refreshes all generated data.

The shared implementations live in
`tools/workspace-plugin/src/executors/token-generator` and `scss-builder`.
Read the relevant schema/project options before altering output formatting,
prefixes, mode selection, or selector wrapping. Frames X excludes specific
collections in its target; CocoKits has different options.

## Fixing a visual defect

1. Identify theme, collection/mode, component, and state. Confirm the supplied
   props exist in that theme's config and inspect the actual class/DOM contract.
2. Trace the selector to authored SCSS and the token to its real source. Reuse
   tokens for semantic visual values; do not invent token names from a screenshot.
3. Change the responsible theme. Shared selector or DOM changes require checking
   both themes and frameworks; a theme-specific visual fix need not alter both.
4. Regenerate relevant outputs and inspect the diff. Avoid hand-editing minified
   CSS or token dictionaries. Keep unrelated generator churn out of the change.
5. Inspect the story under both themes if shared behavior was touched, including
   light/dark or other relevant modes, focus, disabled, selected, invalid, and
   responsive states. Build success does not prove visual correctness.

Storybook has its **own** internal visual theme and tokens under
`packages/internal/storybook-addon-theme/src/theme` and `src/token`. Changing the
docs sidebar or toolbar usually belongs there, not in a published component theme.
Its four compiled entry points are `manager-styles`, `preview-styles`,
`cck-themes-components`, and `cck-themes-tokens` under `src/styles`.

`figma-design-system/tokens` and `apps/tokens-doc` describe separate design-system
work. They are not the current `json-token/manifest.json` inputs configured in
the published theme targets. Do not silently replace those pipelines. See the
dated [baseline](baseline.md) for a known malformed design-reference JSON file.
