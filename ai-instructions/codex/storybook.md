# Documentation and custom Storybook UI

Read root `AGENTS.md`. This is an application built on Storybook, not just a set
of stock Storybook stories. Shared UI changes can affect Angular and React docs.

## Choose the right layer

| Concern                                                         | Location                                                                                             |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Angular component documentation                                 | `apps/angular-kits-doc/stories`                                                                      |
| React component documentation                                   | `apps/react-kits-doc/stories`                                                                        |
| Shared contribution, theme, and utility pages                   | `packages/internal/common-kits-doc/stories`                                                          |
| Shared example inputs/templates                                 | `packages/internal/common-kits-doc/src/examples-config`                                              |
| Sidebar, doc pages/tabs, controls, source viewer, theme/mode UI | `packages/internal/storybook-addon-theme/src/lib/features`                                           |
| Manager vs preview initialization                               | Addon `src/lib/manager`, `src/lib/preview`                                                           |
| Cross-surface state/events                                      | Addon `src/lib/data-access`, `src/lib/config/events.config.ts`                                       |
| Framework story types/decorators                                | `packages/internal/storybook-addon-theme-angular` / `storybook-addon-theme-react`                    |
| App configuration                                               | Each app's `.storybook/main.ts`, `preview.ts`, `manager.ts`                                          |
| Shared config factories                                         | `tools/scripts/storybook/generate-angular-storybook-config.ts`, `generate-react-storybook-config.ts` |

Angular uses the Angular Storybook builder; React uses `@storybook/react-vite`.
The common addon UI is React even in Angular docs. Preserve manager/preview event
synchronization; investigate both ends for a control or theme-switching defect.
Custom styling is documented in [Themes](themes.md).

## Component pages

Typical directory:

```text
apps/<framework>-kits-doc/stories/ui-components/<library>/<component>/
  index.stories.ts[x]
  description.md
  overview/default.stories.ts[x]
  overview/type.stories.ts[x]
  overview/size.stories.ts[x]
  overview/color.stories.ts[x]
  examples/<example>/index.example.stories.ts[x]
```

`main.ts` discovers `index.stories.ts[x]`, not every overview file. Export new
stories from that index; the meta `title` determines navigation. React currently
uses `.tsx` for many index files. Use the Button pages as a full working example.

- Import `StoriesMeta` and `StoryObj` from the matching framework addon, not just
  upstream Storybook types. Set `parameters.cckAddon.componentName` to the shared
  core identity. Preserve relevant subcomponent/API overrides.
- Use `CCK_CONTROL` factories and `parameters.cckAddon` for custom controls,
  `hasControl`, `singleControls`, source, and render conditions.
- Use `ngThemeArgsToTemplate` / `reactThemeArgsToTemplate` to apply selected theme
  props; stories receive `cckControl`/`cckIcons` through the adapters.
- Use `renderWithPageTab`, `renderWithThemeId`, or `renderWithThemeProp` when a story
  is tab/theme-specific. Do not render unsupported theme props unconditionally.
- Keep the live render and displayed EJS source snippets in agreement, including
  required imports, providers, and event/property binding syntax.
- Use `description.md` for component prose. Shared MDX uses the custom `MdxPage`
  wrapper and Storybook `Meta`; follow nearby pages and stable navigation titles.

## Examples and generated documentation

For a reusable example, inspect the `example-story` generator schema and the
existing Button `examples/back-button` pair before adding files. Shared example
config lives in `packages/internal/common-kits-doc/src/examples-config`; framework
example templates live beside `index.example.stories.ts[x]`.

`generate-example-story-source` reads examples and generates **`_story.source.ts`**.
It matches each example folder basename to exactly one shared `<name>.config.ts`.
Edit the example/config source, not that generated file. Regenerate per app:

```text
pnpm exec nx run @cocokits/angular-kits-doc:generate-example-story-source
pnpm exec nx run @cocokits/react-kits-doc:generate-example-story-source
```

Utility API pages are generated from source JSDoc using TypeDoc. Relevant configs:
`apps/{angular,react}-kits-doc/typedoc.config.mjs`,
`packages/internal/common-kits-doc/typedoc.config.mjs`, and root
`typedoc.config.base.mjs`. They write into tracked `stories/utils` directories.
Correct API prose in its source comments first, then run the owner's target:

```text
pnpm exec nx run @cocokits/common-kits-doc:build-typedoc
pnpm exec nx run @cocokits/angular-kits-doc:build-typedoc
pnpm exec nx run @cocokits/react-kits-doc:build-typedoc
```

Angular API metadata also uses Compodoc:
`apps/angular-kits-doc/.storybook/preview.ts` reads
`dist/compodoc/angular-kits-doc/documentation.json`. Run the Nx Storybook target
so its preparation happens; an absent generated JSON file on a fresh checkout
does not mean it should be committed manually.

Both development Storybook targets depend on example-source generation, TypeDoc,
shared TypeDoc, and addon CSS. Build targets have slightly different dependency
lists (including `^generate-example-story-source`); inspect resolved targets and
explicitly run a missing generator if output is stale. Preparation may update
tracked files even when merely starting docs.

## Validation

Start Angular on 6006 or React on 6007 using the commands in root `AGENTS.md`.
For a shared addon change, inspect both apps. Check navigation, the affected
Overview/Examples/API content, theme/mode switches, controls, live rendering, and
displayed source; check browser errors. For prose, check MDX rendering and links.
Build the relevant `build-storybook` target for bundling/metadata changes.

`test-storybook` is an inferred browser-runner target and needs a running Storybook
URL and installed browser dependencies; it does not start the server itself. Do
not treat its presence as proof that interaction tests exist for every component.
