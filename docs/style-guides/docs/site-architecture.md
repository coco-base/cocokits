# Site architecture

Purpose: the apps and packages that make up the docs site, how they are built and run. Why: [tooling](../../why/tooling.md#docs-astro-site-with-one-preview-app-per-framework).

There is no Storybook. The site is a static Astro site with no UI framework inside, and live examples run in one preview app per framework. API descriptions are only TSDoc on the source, never a hand-written props list.

The site is `apps/docs`, `packages/docs-stories`, `packages/docs-shared`, `tools/story-compiler` and the preview app `apps/preview-<fw>` of each framework that has one. Create packages, apps and entry points with the library generator ([generators.md](../workspace/generators.md)).

```
apps/
  docs/                 Astro static site: pages, switchers, controls, API tables, snippets
  preview-angular/      Angular app: renders the generated Angular stories (src/generated/stories)
  preview-react/        React app: renders the generated React stories
  preview-vue/          Vue app: renders the generated Vue stories
packages/
  shared/               ModeCollection, ApiDoc, story, snippet and scenario types and steps
  docs-shared/          private: protocol messages, docs data types (ThemeDocData, ComponentDocData), splitUnionType, the preview kit
  docs-stories/         private: story sources and story config (*.story.tsx, stories.config.ts), scenarios
tools/
  story-compiler/       private: prints the stories as Angular, React and Vue code, once per theme
  consumer-fixture/     private: compiles the generated stories from packed packages in a temporary project
```

| Piece | Responsibility | May import |
|---|---|---|
| `apps/docs` | Pages, navigation, framework/theme/mode switchers, controls, API tables, snippets | `@cocokits/shared`, `@cocokits/docs-shared`, extracted API JSON, `docs-stories`, `@cocokits/machines/<name>` (spec, anatomy), `ThemeConfig`s |
| `apps/preview-<fw>` | Render one generated story from its `storyRegistry` with given args, theme and mode; report component events (the run module's `report`), height and errors | Its framework, `@cocokits/<fw>`, theme packages, `docs-stories`, `@cocokits/shared`, `@cocokits/docs-shared` |
| `packages/docs-stories` | Story sources and story config per component and theme, and scenarios ([stories-and-scenarios.md](./stories-and-scenarios.md), [scenarios.md](./scenarios.md)) | `@cocokits/shared` only |
| `packages/docs-shared` | The code the docs tooling shares: the preview protocol and its validator, the docs data types, `splitUnionType` and the preview kit (`src/preview/`: the session, args, standalone request, origin check, theme and anatomy catalogs, highlight overlay, page control and the shared CSS), generic over the story and provider types of a framework | `@cocokits/shared` only |
| `tools/story-compiler` | Compiles the story sources, the `ApiDoc` and the `ThemeConfig`s into each preview app's `src/generated/stories`, and writes the author typings of `docs-stories` | `@cocokits/shared`, `@cocokits/docs-shared` |
| `tools/consumer-fixture` | Packs the packages the generated stories import, installs them offline into a temporary project outside the workspace and compiles the stories with `ngc`, `tsc` and `vue-tsc` (target `check`) | none |

- Never import a framework component into `apps/docs`. It renders no framework code; examples run in an iframe served by a preview app.
- There is no Next.js preview app. The framework switcher shows Angular, React and Vue; React stories render in `apps/preview-react` and Vue stories in `apps/preview-vue`.
- Each preview app has its own toolchain. Upgrading a framework touches only its preview app.
- A preview app holds only what is framework code: its stage (mounting, updating and the navigation guard), its root component and its theme registry. Everything else is the preview kit in `@cocokits/docs-shared`; a rule is written once there and never copied into an app.
- The protocol types live in `@cocokits/docs-shared`, and the API shape and the story and snippet types in `@cocokits/shared`, so the site, the compiler and the preview apps stay in sync.

## Build

One Nx pipeline, one static output:

1. Extract the API of each framework package into `<project>/src/generated/api-docs/<component>.json` and the docs data of the machines and each theme into `<project>/src/generated/docs-data/` ([api-extraction.md](./api-extraction.md), [Docs data](#docs-data)).
2. Compile the stories: the `stories` target of each preview app runs the story compiler and writes `src/generated/stories` ([stories-and-scenarios.md](./stories-and-scenarios.md)).
3. Build each preview app with base path `/preview/<fw>/`.
4. Build `apps/docs`. Astro reads the API JSON and the story metadata through content loaders and writes static HTML.
5. Copy each preview build into `apps/docs/dist/preview/<fw>/`.

`docs:build` runs these steps through `dependsOn` and then checks the built HTML (titles, descriptions, canonical and social tags, `alt`, image sizes). The site also emits `sitemap.xml` and `robots.txt` ([production-checklist.md](./production-checklist.md)). Never edit generated output; fix the source and rebuild.

## Docs data

Everything the pages show about a component or a theme that is not prose is generated by Nx targets that `docs:dev` and `docs:build` depend on (so CI makes it as part of the affected `build`), and written as JSON into the gitignored `src/generated/` folder of the project that owns the source. The folders are the Nx outputs of the targets, so a cache hit restores them. The executors are in `tools/workspace-plugin`, and the shapes are in `@cocokits/docs-shared` (`ComponentDocData`, `ThemeDocData`) and `@cocokits/shared` (`ModeCollection`, which the theme package exports).

| Target | Source | Writes |
|---|---|---|
| `machines:docs-data` | The built `@cocokits/machines` subpaths; each exports `<name>Anatomy` and `<name>Meta` | `ComponentDocData` per component |
| `theme-<name>:docs-data` | The theme's built entry: its `ThemeConfig` and its **modes index** `modeCollections` | `ThemeDocData` in `theme.json` |
| `angular:api-docs` | TSDoc of the Angular entry points ([api-extraction.md](./api-extraction.md)) | `ApiDoc` per component |

- Every `docs-data` target depends on its project's `build`, which already depends on the theme's tokens.
- The modes index is the theme package's neutral export `modeCollections`: for each collection that has a mode attribute, its `name`, the attribute that selects a mode (`attrName`, without `data-`), its modes (`name` and `value`) and `defaultMode`, plus the `componentName` of a component collection, so two components may share an attribute name. The theme makes it with the code that writes its selectors and puts no docs field in it, so the extraction and the docs assume no prefix, attribute naming or collection structure. The cocokits theme writes it with its `tokens` target ([tokens guide](../../../packages/themes/cocokits/core/docs/tokens.md)).
- **Themes and page modes** come only from the docs config. `DOCS_THEMES` in `apps/docs/src/config.ts` has one entry per theme, in the order of the theme list (the first is the default theme): its `label`, its `logo` (the package exports of the theme's logo files for a light and a dark page, for example `@cocokits/theme-<name>/logo-light.svg`; the docs app depends on the theme packages for them) and, optionally, the collections that are page modes by collection name, each with a label and the mode names that match a light and a dark page (`colorScheme`); an entry without `pageModes` has no Modes rows. `apps/docs/src/lib/page-modes.ts` builds the docs type `ModeAxis` from `modeCollections` and that entry when Astro loads the themes. The build fails, with a message that names the theme, the entry and the valid choices, when an entry names a theme without docs data or twice, a theme with docs data has no entry, an entry has no `logo` (a file the package does not export fails when the page reads it), an entry names a collection the theme does not have, a component collection, a collection twice or a `colorScheme` mode the collection does not have. Nothing derives page modes from the index, so a new collection reaches the page only when the config names it.
- Each page mode gets a row in the Modes control and a `setModes` to the previews of the selected theme only: a stage of another theme keeps the modes it last accepted and catches up with the current ones when its theme is shown again. Theme options stay in each `ThemeConfig` and appear as story controls. The page mode that has a `colorScheme` and the chrome's light and dark scheme are one setting: the app bar toggle picks the mode of its scheme, a pick of the mode sets the scheme, and either change sets every preview of the selected theme and its Workbench colour-mode tools. The `colorScheme` mapping stays in the docs site; a preview app never receives it. It receives only the result, each block's scheme (`light` or `dark`, the page's or the block's override), with the modes in `render` and `setModes`, sets it as its document's `color-scheme`, and the iframe element gets the same one ([preview-protocol.md](./preview-protocol.md#modes)).
- The nav, the app bar and the table of contents stay in place while the content scrolls (`position: sticky`); on a screen narrower than 808px only the app bar stays.
- The docs site reads the generated files with content loaders by glob, so a new component needs no change in `apps/docs`, and a new theme needs its `DOCS_THEMES` entry (label and the light and dark logo from its package) in `apps/docs/src/config.ts`, the docs app's dependency on the theme package in `apps/docs/package.json`, and a registration in each preview app (`apps/preview-<framework>/src/app/themes.ts`: the stylesheet, the docs data and the providers), with the theme's `docs-data` target among the `stories` dependencies of each preview app and of `docs-stories`, its two files in `servedFiles` of `packages/docs-shared/vite/preview-data.mjs`, and, in the Angular app, its stylesheet bundle and assets. A file names its kind (`component` or `theme`).
- A `theme-core` package made by the library generator has a `docs-data` target; it fails until the theme's entry exports a `ThemeConfig` and `modeCollections`.

## Dev

- `docs:dev` starts everything one command needs and `docs:watch-data` runs with it, so a change to a TSDoc sentence, token, meta or story reaches the page with no restart. A change to a `project.json` (for example the files the preview build copies) is read only when a dev server starts, so it needs a restart of `docs:dev`. The options, the Nx daemon requirement and the other docs commands are in [targets.md](../workspace/targets.md#docs-targets); the budgets of `docs:lighthouse` are in `apps/docs/src/config.ts`.
- `apps/docs/src/config.ts` lists the frameworks (`FRAMEWORKS`, Angular first and the default) and resolves the iframe URL (dev: `http://localhost:<port>/`, production: `/preview/<fw>/`). `docs:dev` starts the three preview apps (its options are in [targets.md](../workspace/targets.md#docs-targets)) and hands the ports to the config through `PREVIEW_<FRAMEWORK>_PORT`.
- A preview app also runs alone: [standalone mode](./preview-protocol.md#origins-and-standalone-mode).
- Framework, theme and mode live in the query string and in `localStorage`; the URL wins. Nothing is stored before the user picks.
- Online sandbox examples import published packages, never workspace paths.

## Docs app components

How `apps/docs/src` is built, so a new option or part is a small local change. What an MDX author uses is in [component-pages.md](./component-pages.md). Why: [tooling](../../why/tooling.md#docs-app-built-from-parts-that-share-a-store).

```
components/
  ui/          Icon + Sprite (every icon, the Angular, React and Vue marks included), CopyButton, DataTable, PillGroup, Select (select.ts), show-icon.ts
  chrome/      Header, SideNav, NavGroup (nav-group.ts), pair-select.ts (the framework and theme choice), Toc (toc.ts, toc-spy.ts), TabRow, Footer, app-bar.ts; modes/ (ModesPopover, ModeRow, modes-popover.ts)
  workbench/   Workbench (shell), Stage, StageSkeleton, Toolbar, ToolGroup, tools/, ControlsPanel, controls/, CodePanel,
               FilesList, FullscreenDialog, model.ts (state), presets.ts, workbench.ts (mountPair)
  overview/    Hero, Stories, Story, StoryBlock, Apg, Keyboard, ThemeNotice
  styling/     AnatomyExplorer (on the Stage part, anatomy-explorer.ts), Classes, DataAttributes, CustomProperties
  api/         ApiReference, ApiTable, Usage, Forms, CodeSample (the source of a hand-written sample file)
scripts/       boot.ts, chrome.ts (the one lazy chunk), core/ (store, page-store, storage, meta, enable, dismiss), preview/ (client, session)
guides/        guide pages in MDX (`forms.mdx`), rendered by `pages/guides/<name>.astro` inside `Base`; the one place that may hold fenced code (a component page may not), which `.guide pre.astro-code` in code.css styles with the site's code themes (`lib/shiki-theme.ts`, set as `markdown.shikiConfig` in `astro.config.mjs`)
lib/           build-time data: code-sample.ts (the allowed sample paths), page.ts, ids.ts, headings.ts, block-meta.ts, page-modes.ts, nav.ts (the side nav groups), …
styles/        tokens.css (colours and the [type scale](#type-scale)), global.css (reset, shell grid, glow, prose, `.pair`), code.css (`renderLines` markup, guide code)
```

- **One part, one owner.** A part is `<Name>.astro` with its `<Name>.css` imported in its frontmatter and, when it has behaviour, a `<name>.ts` next to it. No other file styles its internals or queries inside it. Class names and `data-*` are kept stable: `docs-e2e` and the unit tests select by them.
- **Code on a component page.** A component `.mdx` holds no fenced code. The one way to show code there is `<CodeSample path="…" title="…" framework="angular" />` (`components/api/CodeSample.astro`), which reads a hand-written sample file at build time (`lib/code-sample.ts`) and renders it with the site's code theme and a copy button, and hides it in the views of other frameworks. The path is relative to the repository root and must lie in `apps/preview-<name>/src/samples/`; a path outside it, with a `..` or `.` segment, or naming no file fails the build with an error that names the path (`tests/code-sample.test.ts`). The sample is compiled by that preview app's build and run by its tests, so the page shows code that works. The Dialog page shows the Angular service this way, as "Opened from code".
- **Composition, not flags.** A shell renders parts. A variant is a named preset object, never a boolean that switches several things. A prop changes one thing.
- **One config interface per configurable component**, `readonly` fields with TSDoc that gives the default and the page that uses the field. A field nobody uses yet is not added; adding one is one field and one condition. Example, the Workbench: `WorkbenchConfig { codeOpen; loading }` with the presets `STORY` (story blocks) and `PLAYGROUND` (the Hero). Fixed in a block: the tools and their order (the colour-mode tool exists when the theme links a page mode to the colour scheme), the controls panel (there when the story has args), the files list, the stage height (`StoryMeta.height`, else `DEFAULT_STORY_HEIGHT`) and the full-screen sizes.
- **Parts talk through a typed store**, never through each other's DOM. `createStore<S>()` (`scripts/core/store.ts`) gives `get`, `set(patch)` and `subscribe(keys, listener)`; each key has one writer.
  - `pageStore` (`scripts/core/page-store.ts`): `scheme` (writer `setScheme`: the app bar toggle and the Modes control; `<html data-docs-scheme>` mirrors it for the CSS), `modes` (writer: the Modes control; readers: the stages: those of the selected theme apply a change at once, the others keep their last accepted modes and catch up when their theme is shown) and `selection` (writer: the framework segment and the theme list of the Modes popover; readers: the Modes control, the blocks that start a pair when it is shown).
  - The Workbench store (`model.ts`, one per pair): `args` and `argsChange` (writers: the controls and Reset; readers: Stage, CodePanel), `file` (FilesList; CodePanel), `controlsOpen`, `codeOpen` and `eventsOpen` (the panel toggles; the panels), `events` (Stage adds a row for each reported component event, at most 50, and empties it when the story is mounted again; EventsPanel's Clear empties it; EventsPanel reads it), `dots` (BackgroundTool; Stage), `colorOverride` (ColorModeTool; Stage drops it when the page's modes change for its shown theme, or when its theme is shown again after a change), `fullscreen` (FullscreenTool opens, FullscreenDialog closes; Stage renders again after the move) and `preview` (Stage; StageSkeleton). The anatomy explorer gives the Stage a store of the stage keys alone (`StageState`, `stageStart`).
- **The shell finds its parts by their root hook** `[data-wb-part="<name>"]` and mounts each with the store (`mountPair` in `workbench.ts`); a part looks only inside its own root. Every part, in the Workbench and in the chrome, renders its buttons `disabled data-needs-script` until its script runs, and its script calls `enable(root)` once its handlers are attached.
- **A parent changes a part through the part's custom properties**, never through a descendant selector: full screen sets `--stage-min-height`, `--controls-max-height`, `--code-height` and the others on the body it shows.
- **The app-bar box.** `.docs-switch-box` (Header) holds two segments: Theme (the Modes popover's button, which shows the theme's logo and `label` from `DOCS_THEMES`, with the accessible name `Theme: <label>`; the segment is always shown; the popover lists the themes in config order at its top only with two or more, each radio with its logo and `label`, and a lone theme without page modes shows its label as a plain line) and Framework (a `ui/Select` with the framework mark and name). The scheme toggle stays outside it, at the right. At 808px and below the segment text hides visually (`.seg-label`), the logos and the accessible names stay. The framework marks are monochrome `currentColor` symbols of the sprite; a theme's logo is the theme package's file for the page scheme.
- **The docs chrome uses no native `<select>`; a dropdown is `ui/Select`.** The theme list in the Modes popover is the exception: a labelled radio group of `ui/PillGroup`, not a dropdown. `ui/Select` is the APG select-only combobox ([pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/)): a `role="combobox"` button that keeps DOM focus, a `role="listbox"` popup of `role="option"` items (with the Popover API it is in the top layer, so a scrolling parent does not clip it; without it, it is a `position: fixed` box at the same place), `aria-activedescendant` on the combobox, and a `change` event on its host. It is rendered `disabled data-needs-script` and stays so until the code that listens to its `change` turns it on (`enable`), so no pick is made before it is read. `docs:build` fails on a `<select>` or `<option>` in a built page (`check-pages.mjs`). Why: [tooling](../../why/tooling.md#the-docs-chrome-uses-no-native-select).
- **One pill group.** `ui/PillGroup` draws the tab row (`as="links"`: a `nav` of links with `aria-current`) and each Modes row (`as="radios"`: a labelled `radiogroup` of native radios drawn as pills) in one look. The Modes popover closes through `dismissable` (`scripts/core/dismiss.ts`): Escape, a press outside it, a second press of its button; a press inside never closes it.
- **Table of contents.** It starts at its natural place and sticks 80px below the viewport top (`--docs-anchor-top`, also the page's `scroll-padding-top`). It marks every entry whose section (its heading to the next entry's heading, the last to the end of `main`) is in the viewport, with `aria-current="location"` (`toc-spy.ts`), and a followed entry scrolls smoothly, at once under reduced motion.
- **Loading.** A stage is `aria-busy` with its `aria-hidden` skeleton until the preview rendered the story; the skeleton is one opaque surface the size of the stage, the same for every story (never shaped like a component), still under reduced motion, and again after a reload or a theme change; the frame keeps its size and is not drawn meanwhile. Before its script runs a stage has no `data-stage` and follows the chrome scheme, so a light page has no dark first paint.
- **One preview session.** `PreviewSession` (`scripts/preview/session.ts`) owns a preview iframe's protocol lifecycle: connect, the first render with catch-up, live gating, reload after a move and the error status. The Workbench stage and the anatomy explorer both use it.
- **Data comes from props.** Only the MDX entry components (Hero, Stories, Story, Apg, Keyboard, Classes, DataAttributes, AnatomyExplorer, ApiReference) and the two blocks the routes and the Hero render by themselves (ThemeNotice, CustomProperties) read the URL, through `pageDataOf(Astro)` (loaded once per render); inner parts get their data as props. One server-to-browser shape, `BlockMeta` (`blockMeta()` writes it, `readMeta()` reads it), carries what a block's script needs. Heading ids come from `lib/ids.ts`, so a block and the table of contents never drift.

## Type scale

The docs app uses six font sizes, each a role token owned by `apps/docs/src/styles/tokens.css`. Why: [tooling](../../why/tooling.md#one-type-scale-with-role-tokens).

| Token | Size | Use it for | Examples |
|---|---|---|---|
| `--docs-fs-title` | 32px | The page title (`h1`) | Component name |
| `--docs-fs-section` | 20px | A section heading (`h2` in `main`) | Overview, Keyboard |
| `--docs-fs-heading` | 16px | A sub-heading | `h3` in `main`; panel, dialog and table-group titles; the side nav logo |
| `--docs-fs-body` | 14px | Body text and interactive UI | Prose, nav links, tabs and pill groups, control labels and inputs, table body, inline code, buttons, error lines |
| `--docs-fs-small` | 12px | Secondary text | Table of contents, table headers, code blocks, labels, hints, captions, the eyebrow, the footer, file names, chips |
| `--docs-fs-tiny` | 10px | Tiny badges only | The file badge of the Files list |

- Write `font-size: var(--docs-fs-<role>)` and nothing else. A literal `font-size` (px, rem, em, a keyword) in a component, a `<style>` block or an inline style is a defect; `tests/type-scale.test.ts` fails on it.
- Choose by role, not by space. If text does not fit, change the layout or the wrapping, never the size.
- A new size needs a maintainer decision and a token in `tokens.css`, the test and this table.
- Component text inside a preview comes from the theme tokens, never from the docs tokens: a preview app cannot read the docs tokens across its iframe, so the preview kit sets its own base size and says which token it matches.

## Colours

The docs app and the preview app each keep their colour values in one file, as custom properties: `apps/docs/src/styles/tokens.css` (`--docs-*`, a dark and a light block) and `packages/docs-shared/src/preview/_tokens.scss` (`--preview-*`, the preview kit's, shared by every preview app). Why: [tooling](../../why/tooling.md#colours-only-through-custom-properties). Theme CSS follows the same rule: [css-conventions, values](../themes/css-conventions.md#values).

- Everything else names a token with `var(--docs-<role>)`, also inside `color-mix()`. A literal is a hex value, `rgb()`, `hsl()`, `oklch()` or a similar function, a named colour, `color-mix()` with a literal input, or a system colour outside `@media (forced-colors: active)`. `transparent`, `currentColor`, `inherit`, `initial` and `unset` are not literals.
- Reuse a token when its value and role match. Add one only for a new role and name it by that role (`--docs-text-muted`, `--docs-stage-skeleton-dark`), never by its value. The same value in another role is a second token.
- A script that needs a colour sets a class or a data attribute, or hands over a token (`var(--docs-part-1)`); it never writes a literal. The dark code theme (`lib/shiki-theme.ts`) names tokens for the same reason.
- The preview apps cannot read the docs tokens across their iframe. It has its own tokens, and a value that must equal a docs token carries a comment naming it. A message to the preview carries a role (`tone`), never a colour.
- Component colours inside a preview come from the theme tokens (`--cck-*`), never from docs or preview tokens.
- `tests/colors.test.ts` scans the CSS, SCSS, Astro and TypeScript sources of both apps and fails on a literal outside the two token files.
