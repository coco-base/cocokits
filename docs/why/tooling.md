# Why: tooling and docs

Rules: [Generators](../style-guides/workspace/generators.md), [Writing guideline](../style-guides/docs/writing-guideline.md) and [Single source of truth](../architecture.md#8-single-source-of-truth). This file explains them and states no rules.

## One library generator, more only after repetition

**Rejected alternatives.**
- *Generators for components and scenarios up front.* Not added until the same files are written by hand repeatedly.

**Why.**
- Package scaffolding is the same for every package of a kind and is known from the guides. Hand-written `project.json`, `exports` keys, tsconfigs and size-limit entries would differ from package to package, so the generator exists from the first package.
- A generator runs once. Its output is then normal source code.

## Docs: Astro site with one preview app per framework

Rules: [Docs guide](../style-guides/docs/index.md) and [Site architecture](../style-guides/docs/site-architecture.md).

**Rejected alternatives.**
- *Storybook.* It breaks on Angular and React upgrades and puts every framework into one build.
- *One docs app that imports all frameworks.* It has the same upgrade problem.

**Why.**
- A framework upgrade touches only the preview app of that framework. The site and the other preview apps do not change.
- Astro ships static HTML with no JavaScript by default. That is fast and indexable, which a public site needs.
- The site imports no framework component, so it has no framework to upgrade. Live examples are iframes served by the preview apps and driven by a typed message protocol.

## Stories compiled from one source

Rules: [Stories and scenarios](../style-guides/docs/stories-and-scenarios.md), [Story language](../style-guides/docs/story-language.md), [Interaction portability](../style-guides/docs/interaction-portability.md) and [Playground and snippets](../style-guides/docs/playground-and-snippets.md).

**Rejected alternatives.**
- *Hand-written stories per framework, with a hand-written snippet recipe each.* Frameworks times stories to keep in step, and the code shown drifts from the code that runs.
- *A neutral tree rendered at runtime, with a separate printer for the code shown.* The code shown is then not the code that runs. One printer with a run mode is not that alternative: both outputs come from one IR, the run module differs only in the two pinned ways (args binding, event reporting), and tests keep it so.
- *A compiler in the browser, with a live editor.* The proof of concept's browser bundle is 1,066 kB gzip. A later job can add it on top of the same compiler.
- *Mitosis.* It also generates components. Here only stories are compiled; components stay hand-written.

**Why the stories are generated from `ApiDoc` and `ThemeConfig`.** The playground and the option, boolean and union stories follow from facts that already have one source: TSDoc and the theme's options. A new option or prop gets its story and its code in every framework with no edit. Storybook infers controls but generates no story per prop or theme option, and Ladle and Histoire generate nothing, so this is new work. Custom stories cover the rest.

**Why version 1 is static.** The Button needs no state, handlers, conditions, loops or slots beyond its default one, and the facts a larger language needs do not exist yet (slot shapes, the authoring data of compound components). The proof of concept is about 25,000 lines; the subset is about 3,000. What happens to a construct outside the subset: [story-language](../style-guides/docs/story-language.md#story-language).

**Why version 3 adds state.** The rule that custom stories take no handlers held while the only stories were static markup. A disclosure Button, a character count and the form stories need a value that changes and an event that changes it, and a story written by hand per framework would drift from the code shown. So the language gains typed markers that the compiler reads and prints as each framework's own state, and handlers stay small so that the three printed handlers behave the same. The cost is a larger parser and validator; every construct comes with a story that needs it, and nothing is built ahead of one. The markers live in the compiler's own authoring entry, `@cocokits/story-compiler/language`, and not in the published `@cocokits/shared`: the library will move to its own repository, which must not know about the story compiler, and the compiler will move to its own repository too. The entry imports no `@cocokits/*` package and has its own small value type; `defineStory` and the story types stay in `shared` until that split. The rules are in [story-language](../style-guides/docs/story-language.md#state-and-handlers).

**Why `each` is over a constant list of distinct literals.** A radio group, a row of tabs or a set of options is the same markup once per value. A list of any kind (objects, items that are added or removed) needs an identity for each repeat that the author chooses, and would make the portability rules depend on what the list does: rules R and B hold because a node is removed only by a `when`, and a node is moved by nothing. It would also put the item in handlers, which are declared once and run for every repeat. A constant list of distinct strings or numbers, keyed by the item, adds nothing to those rules (no repeat is added, removed or moved after the first render) and the key is the value the reader already sees. Items in handlers, object items and a list that changes wait for a story that needs them ([architecture §10](../architecture.md#10-simplicity-and-reuse)). The rules are in [story-language](../style-guides/docs/story-language.md#state-and-handlers).

**Why a component handler reads the event's value.** A story that sets other states from an event (select all) cannot be written otherwise. A component handler takes none or one parameter, the value of the event, and nothing else: no DOM `Event` and no framework object reaches story code, and the Events panel shows the reason of every event without authoring. A native handler takes no parameter, because the native events differ in their payloads across the three frameworks.

**Why components and forms join only through measured contracts.** The portability check models what the browser and each framework deliver to a native element. A component adds its own events, its own listeners and, for `bind`, a two-way binding that is a different mechanism in each framework (Angular `[(value)]`, React `value` with `onValueChange`, Vue `v-model`). The first design left them out of the domain. A component joins it only with a contract: a trace row for each user action the stories deliver through it, a `browser-facts` row and a matrix row, in three frameworks, for the real component. The Input's contract found that the order of the component's event against an author's native handler on the same element differs (Angular runs the component first, Vue and React the author first), so an `onInput` beside `bind` or `onValueChange` on one Input is refused instead of modelled twice. The Textarea's contract measured the same order, so it shares the Input's trace row and the same refusal.

**Why the rows of composites and overlays are generic and the content of an overlay is a mounting condition.** A tab, a trigger, an option and a menu item are parts of a compound component whose models sit on the root, so a row names the parts the user acts on and delivers the model's change to the root; a new composite or overlay then adds a contract entry, its facts and its matrix rows, and no compiler code (the Menu and Radio-group fixtures prove it). The content of an overlay is unmounted by the closing it causes, like the branch of a `when`: React has collected the handlers of the dispatch, Vue keeps the listeners of the detached element and Angular removes them, so a handler that the click still has to reach inside the content is refused. The change of `open` is a delivery of the row whether or not the story handles it, because the component, not the story, writes it. The native `select` row is `native-select.choose` so that `select.choose` is the Select component's.

**Why a component may bind inside a form.** The first rule refused every `bind` in a form, because a native reset changes a field without telling the state. That holds for a native `input`, which still cannot be bound there. The CocoKits Input, Textarea, Checkbox and Switch restore the value they had when they mounted and report it with `reason: 'form-reset'` (`text-control-base.ts`, `check-control-base.ts`), so the bound state follows: the browser fact `form-fields.spec.ts` measures a bound Input and Checkbox after a native reset in the three frameworks. A Radio group stays refused: every Radio reports its own restored check and each report writes the one group state, so the state could end up empty depending on the order of the reports. The component handler stays out of the domain in a form, and the controlled model is refused there too.

**Why `form()` prints the forms of each framework.** A form with validators shows its errors by touched and submitted, as the components gate them, and Angular has that in Signal Forms (`form`, `[formField]`, `form[formRoot]`), so the story prints it and the reader copies the idiom of the framework. React and Vue ship no forms library; react-hook-form or vee-validate in the printed code would add a dependency and a second API to mirror, so those two print a state for each field and computed validity. Native constraint attributes alone were rejected: they have no touched. Every story `<form>` prevents the browser's submit, so a story never navigates the preview, and only a `form()` form prints `novalidate` (Signal Forms sets it itself): a plain form keeps the browser's constraint validation, which the three frameworks leave alone, so they agree either way. A native reset does nothing to a field that Signal Forms binds, so the Reset Button of a `form()` form calls `reset(form)` with the initial model. In React and Vue the printed code gives each component its `touched` and `submitted` instead of leaving them to the component's own tracking, because `reset(form)` is a call and not a native reset: the component would keep its touch and the errors would stay.

**Why a Radio group clears its state when the old Radio reports.** A Radio that loses the check reports `false` before the one that gains it reports `true`, in all three frameworks. A story that only sets the state on `true` works in Angular and Vue, but not in React: the React Radio is controlled by `checked`, and the report of the old Radio is followed by a restore of its `checked` to what the parent still holds, which checks the old Radio again and unchecks the new one before its own report. Measured on the real Radio (`browser-facts/choice-rows.ts`, `radio-bind-click`). So every Radio that reports `false` clears the state (`''`) and the one that reports `true` sets it to its value, in the three frameworks alike, and no Radio stands for the empty text.

**Why custom stories take args.** The rule that only the playground has args held while a story had no value a reader could change. The character count has a limit that its own control changes, and the code shown must follow that control, so a custom story declares `args` and reads them as one destructured parameter. The types (`StoryWithArgs`, `StoryArgsOf`) stay in `shared` with `defineStory`: a select arg is typed as the union of its list, so TypeScript and the compiler give the same answer for a union prop. An arg that code reads (a `derived` value) is a hole in the snippet's `script`; a bare arg in text is a text hole, the same hole type as an arg attribute, because `derived(maxLength)` would print a computed value for a constant. Expressions over args and `when` conditions stay behind a `derived`: a hole for an expression or a conditional hole would make the page print code, not fill values. A custom story prints every arg value, because its default belongs to the story and not to a component. Rules: [Args](../style-guides/docs/story-language.md#args).

**Why union values come from catalog types.** `state('outline')` is a `string` in TypeScript, and a union prop or theme option takes only its literals. A check by the values a state can reach (the first design) was a second oracle that the editor, the compiler and the printed code answered differently, so a story could pass one and fail another. One mechanism replaces it for every union, theme option or `ApiDoc` prop: a catalog type generated from the same metadata the author typings use, which the state names (`state<ButtonVariant>('outline')`). The compiler then checks the declared type, never the values it happens to hold, so it agrees with TypeScript; it may refuse more (the whole option a theme package prints, the values of one theme), never less. A union prop prints its values inline, because no framework package exports a type for it. The rule and its test (`catalog-agreement.test.ts`) are in [story-language](../style-guides/docs/story-language.md#catalog-types).

**Why the Angular code updates its view and only two shapes are refused.** The first design refused every story in which a handler wrote something that a later event of the interaction depended on (a hidden next tab stop, a disabled Button, a label's `for`), because zoneless Angular updates the page in a task after the handler while React and Vue do it in a microtask that Chromium runs first. That refused daily stories (a checkbox that enables a Button) to protect shapes nobody writes. Updating the story's view at the end of the handler makes Angular match in every probed case, and it needs no shim and no change to React and Vue. Two shapes that no timing fixes stay refused. Rule R is listener lifetime: when a handler unmounts the element that another handler of the same interaction is still to reach, React has already collected the handlers, Vue keeps the listeners of the detached element and Angular removes them. Rule B is a blur the story's own update causes: Chromium blurs a focused element at once, inside the mutation, when its own `hidden` is set, when it or an ancestor is removed and when the `disabled` of an ancestor fieldset is set; Angular and Vue run the author `onBlur` then, and React, whose event dispatcher is off during its commit, does not. Every other change (its own `disabled`, `inert`, an ancestor's `hidden`, closing a `details`) blurs at the next rendering update and all three run it. The rules are in [interaction-portability](../style-guides/docs/interaction-portability.md).

**The full proof of concept.** `C:\Users\milad\Desktop\projects\mvp-cross-framework` has state, handlers, `when`/`each`, named and scoped slots, compound components, views, stores, forms, profiles and the runtime builder. It is documented in `docs/ai/` (start at `README.md`, `04-examples-and-views.md` and `09-findings-and-pitfalls.md`) and in `docs/SPEC.md`, `docs/SPEC-PART2.md` and `docs/BACKENDS.md`. Its code is not reused; the plan names of the v3 constructs (`state`, `derived`, `set`, `toggle`, `when`, `bind`) are kept.

**Costs.** The language must grow before compound, controlled or overlay stories. The parser uses the TypeScript compiler API, which Angular pins to 6.0 while 7.0 ships none; it sits behind one module so another parser can replace it. The older tests check the Field only against a hand-written fixture component; the tests of composed stories use the real components and data.

## Stories may style their own containers

Rules: [Story styles](../style-guides/docs/story-language.md#story-styles).

A story carries no colours or fonts, but it may write a container with layout rules (`overflow`, `transform`, a size) so that a story such as `popover/in-clipped-container` shows the clip in the code the reader copies.

**Rejected alternatives.**
- *Keep every story free of styling and test the clip in the end-to-end test only.* The checklist item "inside a clipped container" would then have an example whose code hides the clip, so a reader could not copy the case.
- *A style attribute or a theme class on the container.* `style` and `cck-*` classes belong to the theme, and an inline style repeats in every copy; one named class with layout properties reads like the app code it stands for.
- *CSS Modules for React.* Their hashed class names broke the code panel and the snippet in the proof of concept; a plain `.css` file imported by the module keeps the class the reader sees.

**Why.** Colours and fonts stay the theme's, so a theme can still restyle every story; only layout enters the story, in a form each framework prints natively (Angular `styles`, a React `.css` file, a Vue `<style scoped>` block). **Costs.** The files list shows a second file for React, the consumer fixture compiles it, and a copied class keeps its story name.

## Scenarios run as end-to-end tests

Rule: [Scenarios](../style-guides/docs/scenarios.md).

**Rejected alternatives.**
- *A component test per framework package.* The packages cannot import the stories, and jsdom input is synthetic: it would not show that the story behaves the same in a browser.
- *The in-page replay now.* It is a later job, and approximate by design: it dispatches synthetic events.
- *`docs-e2e` importing `docs-stories`.* The project imports no repo source, so this would change a boundary rule.

**Why.** The generated stories exist only in the preview apps, and Playwright gives real input. The steps are plain data that the `stories` target writes as JSON, so `docs-e2e` stays free of repo imports and the later in-page player reads the same file. The scenario run is the record of the scenario, and the component tests stay the record of the component.

**Why targets resolve in the whole preview document.** An overlay is portaled out of the story root, so a target searched inside the root would never find its content. `clickOutside` presses 4px inside the top-left corner of the frame, a point no story stage covers, so the press is outside every layer of the story, and `expectAbsent` retries because an overlay unmounts a moment after the action that closes it. `layer` and `expectInert` were dropped: nothing a story shows needs the layer stack or inertness, which the user sees as what is reachable.

## Modes keyed by the theme's attribute names

Rule: [Preview protocol](../style-guides/docs/preview-protocol.md#modes).

**Rejected alternatives.**
- *A single `mode: 'light' | 'dark'` field.* A theme with other axes (density, contrast) cannot be driven, and the docs would name the attribute itself.
- *The docs derive attribute names from the token collection names.* That assumes a naming scheme and a prefix that only one theme uses.

**Why.** Each theme owns its mode scheme and exports its modes index, `modeCollections`, made by the code that writes its selectors. The messages carry the index's attribute names, so another theme with its own prefix and axes needs no change in the protocol or a preview app; the docs site needs only the theme's `DOCS_THEMES` entry and its dependency on the theme package, and each preview app a registration of the theme. The cost is that both sides check every name against the index.

## Page modes live in the docs config

Rule: [Docs data](../style-guides/docs/site-architecture.md#docs-data).

**Rejected alternatives.**
- *Docs fields (`label`, `page`, `colorScheme`) in the token JSON.* The theme's data would know the docs app, and every other consumer would carry fields it does not use.
- *Page modes derived from the multi-mode collections no component option uses.* The rule is implicit, and a new collection would appear on the page without anyone deciding it.

**Why.** The theme package exports a neutral modes index, and the docs config names each theme's page modes, their labels and the colour-scheme mapping by collection name. What the docs show is a docs decision made in one docs file, and the theme stays usable by any consumer. Theme options stay in each `ThemeConfig`. The same list carries each theme's label and logo, so a theme's name is written once, and its order sets the default theme instead of the alphabetical order of the names. A theme with docs data and no entry fails the build, as a wrong entry does, so a new theme cannot reach the site without a label and a logo. The logo files belong to the theme package, so the docs config names them and holds no drawing of a theme.

## The preview gets its colour scheme from the docs page

Rule: [Preview protocol](../style-guides/docs/preview-protocol.md#modes).

**Rejected alternatives.**
- *The preview keeps the default scheme in every mode.* The frame stays transparent, but plain story text and native controls stay light on a dark stage (the form story's label was about 1.1:1).
- *The preview guesses the scheme from the theme's modes.* Which collection and mode is dark differs per theme and cannot be derived; the preview would need the docs mapping.

**Why.** The docs config already says which theme mode is light or dark, so the docs page sends only the result, `colorScheme`, with the modes. The preview sets it on its document and the frame gets the same one, so the frame stays transparent while the story follows the mode. Cost: protocol version 3.

## Docs app built from parts that share a store

Rule: [Docs app components](../style-guides/docs/site-architecture.md#docs-app-components).

**Rejected alternatives.**
- *Flag props that switch a layout* (the Workbench's `hero`, which changed the controls panel, the iframe loading, the code panel state and its markup at once). Every new option meant edits across the component, its script and its styles.
- *Scripts and styles that reach into another part* (one class that drove the controls, the code, the copy button and the colour tool; CSS that styled a part from its parent). A markup change in one part broke another file without a failing test.

**Why.** A part owns its markup, styles and script and talks to the others only through a typed store, so a change stays in the part. Named presets keep each variation a decision with a page that uses it. The maintainer approved this design for Rework 2 (item 2).

## The docs chrome uses no native select

Rule: [Docs app components](../style-guides/docs/site-architecture.md#docs-app-components).

**Rejected alternatives.**
- *Keep the native `<select>` and style it.* The open list is drawn by the browser, so it cannot match the app-bar box or the dark and light looks, and each browser draws it differently.
- *A library select.* The site would take a UI dependency for one control, and the controls would still need the site's own look and keys.

**Why.** The maintainer asked for the old CocoKits switcher: one rounded box with the theme and the framework, one look in light and dark. One `ui/Select` part, the APG select-only combobox, serves every dropdown (the framework segment and the controls panel; the theme list is a radio group), so there is one owner and one set of keys.

## The consumer fixture is built once for all frameworks

Rule: [Playground and snippets](../style-guides/docs/playground-and-snippets.md#generated-stories-must-compile).

**Rejected alternatives.**
- *Build the consumer fixture with the docs site.* Phase A publishes no Angular consumer setup to install, and the fixture would be written for one framework and rewritten for three.

**Why.** The fixture compiles the code the reader copies, the inline code; the preview app compiles the run module, which also holds the reporter of the Events panel. The playground snippet comes from the compiler's template, which the compiler's tests compare with the inline output. The fixture adds the packed-package case. It is built once, for all three frameworks together, when each framework has the component to compile against.

## Component pages: three tabs on three routes

Rule: [Component pages](../style-guides/docs/component-pages.md).

**Rejected alternatives.**
- *One long page with Overview, Styling and API sections.* The page grows with every story, and the reader has to scroll past the live examples to reach the API.
- *Tabs as a `tablist` on one page.* The panels would all be in the HTML and need arrow-key handling and hydration, and a tab could not be linked or indexed on its own.

**Why.** The design shows the tabs as separate pages. Each tab is a page of its own with its own title, description and table of contents, so it can be linked and found, and the tab row is a `nav` of links that needs no script. The prose stays in one MDX file per component; the API and Styling tabs are generated from the extracted data. Nothing here prevents a fourth route, such as the design's Examples tab.

## Generated docs data in `src/generated`

Rule: [Site architecture](../style-guides/docs/site-architecture.md#docs-data).

**Rejected alternatives.**
- *Write the extracted data into `dist/`.* `dist/` holds what is published or built; a generated input in it is deleted by any clean and is not restored by the cache.
- *Extract in a step that only CI runs.* The site would show data that the author cannot see before the push.

**Why.** Each project writes its own data into its git-ignored `src/generated/` folder, and Nx declares the folder as the output of the target, so a cache hit restores it and a clean run regenerates it. The extraction runs before `docs:dev` and `docs:build`, and `docs:dev` re-runs it when a source changes, so a changed TSDoc sentence, token or story reaches the page with no restart.

## Docs updated in every job

Rule: [Docs guide](../style-guides/docs/index.md) rule 8.

**Rejected alternatives.**
- *A separate docs pass after the code is merged.* Pages fall behind the code, and nobody owns the gap.
- *Write the page even when a planned job owns it.* A later docs-site job rewrote an earlier Button page almost line by line.

**Why.** The page is part of the change. Reviewing code and page together catches a stale example while the author still has the context. A changed cdk module or util changes every component that imports it, so those pages are in scope too. A page that a planned job rewrites is work done twice, so the spec leaves it to that job and the PR says which one.

## Public site always production-ready

Rule: [Production checklist](../style-guides/docs/production-checklist.md).

**Rejected alternatives.**
- *A launch checklist run once before going public.* Problems found late are expensive; every job would have added some.

**Why.** If every branch keeps titles, descriptions, sitemap, links, images, speed and mobile layout right, the site can be published at any time and no cleanup phase is needed. Each item has an implementation and a check, so reviewers verify instead of guessing.

## API descriptions only in TSDoc

**Rejected alternatives.**
- *A hand-written props list in a meta file.*

**Why.** A hand-written list drifts from the real code. TSDoc sits on the source, so the description changes in the same edit as the symbol. A theme option's default and values live only in the theme's `ThemeConfig`, so the TSDoc of a theme layer does not restate them, and the agent tells theme options from base inputs by reading the component code and the theme config, not from a list in the guide: a second copy of the default would drift from the config the docs and the runtime read.

## React API through the TypeScript checker

Rule: [API extraction, pipeline](../style-guides/docs/api-extraction.md#pipeline).

**Rejected alternatives.**
- *API Extractor's doc model for React.* It follows `Omit`, `Pick` and extended interfaces only in part, so a prop picked from a machine type could lose its text and default.
- *A hand-written props list.* It drifts from the code ([API descriptions only in TSDoc](#api-descriptions-only-in-tsdoc)).

**Why.**
- The checker resolves a props type like the compiler does, with the declaration of each property. A prop picked from a machine type keeps the machine's TSDoc, and a property declared in `node_modules` or the TypeScript library (the native button props) is left out by its declaration file, not by a name list.
- Vue has its own tool (`vue-component-meta`) for the same reason: it reads what the Vue compiler resolves.
- The parity check fails on members (slots included), `required` and `default`, and reports types only: type spellings differ across frameworks. A slot that exists in one framework by design is marked `none` and left out.
- A difference by design is written on the member or part that causes it, not in a list in the checker. A default that differs because each framework reads it from another holder (Angular token `0`, React and Vue Provider `700`) is `@cckDefaultDiffers <reason>`: the check reports it, and a default difference without the tag still fails, so a drift nobody meant is not hidden. A part only some frameworks have (the Tooltip Provider) is `@cckSemantic none` on the part, as on a member. The Accordion root members stay in `LACKING_BY_DESIGN` because React and Vue use those ids as the canonical ones for their controls and stories; tagging them `none` would remove them from both. A root member that names another part (`tooltip.content.aria-label` on the Angular root) is compared with that part, because the Angular one-attribute form has no separate content input.
- A React controlled `value` has no default: an omitted `value` means uncontrolled, and `defaultValue` carries the start value. Angular and Vue model the value with a default (`''`). Stating `''` on the React `value` would be false, so the parity check leaves that one default out of the comparison instead of the TSDoc lying to satisfy it.

## Lint exceptions live in one file

**Rejected alternatives.**
- *`eslint-disable` comments with a written reason.* They scatter across files, so nobody can list or audit them, and a comment is the easiest way to get a check green.

**Why.** One config file lists every file that may break a rule, each with its reason, so a reviewer sees a new exception in one diff and the list can be audited. A comment hides the same decision inside the code it excuses.

## Guides never name versions

**Why.** Guides must stay valid across framework upgrades. A version number in a guide is out of date after the next release. Supported versions live in `peerDependencies` and the workspace `package.json`.

## Lighthouse counts the median run of a gzipped site

Rule: [Targets](../style-guides/workspace/targets.md#docs-targets) (`docs:lighthouse`) and [Production checklist](../style-guides/docs/production-checklist.md), item Page speed.

**Rejected alternatives.**
- *The default aggregation (the best of three runs).* One lucky run passes a page that most visits would fail; the Button page passed with runs of 2.4 s and 3.3 s.
- *Lighthouse's own static server.* It was measured on 150 KB of uncompressed HTML, which no host sends.

**Why.** The median run is what a typical visit sees, and the site is served gzipped because every static host compresses text. A budget that holds only on the best run or on an unrealistic transfer is not a budget.

## One type scale with role tokens

Rule: [Site architecture, type scale](../style-guides/docs/site-architecture.md#type-scale).

**Rejected alternatives.**
- *Per-component px values copied from the design.* The design uses about a dozen sizes (9 to 17px, with halves); copied into components they drift, and two parts that mean the same thing end up a pixel apart.

**Why.**
- A size is chosen by what the text is, so the same role looks the same on every page and a change is one token.
- Six sizes are enough for the site; a seventh would only encode a fit problem that layout solves.
- A lint-like test over the source finds a stray literal, which a reviewer could miss.

## Colours only through custom properties

Rule: [Site architecture, colours](../style-guides/docs/site-architecture.md#colours).

**Rejected alternatives.**
- *Literal colours copied from the design.* The same colour then lives in several files and drifts, a light and a dark value are edited apart, and a forced-colors rule has nothing to replace.
- *A colour sent to the preview as a value.* The preview cannot read the docs tokens, so the value would be a second copy; a role (`tone`) lets each app own its colour.
- *A stylelint rule.* It would add a dependency for CSS alone; the scan test already covers CSS, Astro and TypeScript sources and runs with `docs:test`.

**Why.**
- A colour has one owner, so a change is one edit and light, dark and the contrast test read the same value.
- A role name says where a colour may be used; a value name (`green-500`) would invite reuse for another role.

## Framework-free preview code lives in the shared kit

Rule: [Site architecture, preview apps](../style-guides/docs/site-architecture.md).

**Rejected alternatives.**
- *Each preview app keeps its own session, origin check and catalogs.* Three copies of the security-relevant message handling drift apart, and a fix would be made three times.
- *A new package for the kit.* The code is only used by the docs tooling, which `@cocokits/docs-shared` already serves; a package adds a project for no new boundary.

**Why.**
- The protocol is the same for Angular, React and Vue, so its receiving side is written once and only the stage and the theme registry stay framework code.
- Generic over the story and provider types, the kit stays free of framework imports and is tested without a framework.

## The pipeline runs locally and the workflows are manual

**Rejected alternatives.**
- *Keep CI on every PR.* GitHub Actions minutes are paid. On 2026-10-31 GitHub stopped starting jobs for a billing reason and every PR check failed within 3 seconds, so the checks gave no signal anyway.

**Why.** Running locally costs the maintainer nothing. One script (`tools/scripts/ci-local.mjs`) owns the list of checks, so a local run and a manual workflow run check the same things. The workflows stay for the moments something must be checked on GitHub.

## The compiler limitations are listed in one file

Rules: [Compiler limitations](../style-guides/docs/compiler-limitations.md), [documenting-components](../../.claude/skills/documenting-components/SKILL.md#limitations-of-the-compiler).

**Why.**
- Refusals were found in many jobs and lived only in review files and chat; a compacted session lost them and the next one asked the same question again.
- One file per entry point is cheap to keep, but an entry is added only after a search and a brainstorm, so the file does not become an excuse to stop looking for a solution.
- An unclear case is one TODO line, so the doubt is recorded without a research detour.
- The file keeps the PR and job of each entry and its TODO section although rule documents carry no plan or status ([writing-for-agents](../../.claude/skills/writing-for-agents/SKILL.md#no-plan-or-status)): the maintainer asked for both, so a reader can find the evidence behind a refusal and the open doubts.


## A group binds on the group, and story styles use logical sides

Rules: [Radio group](../style-guides/docs/story-language.md#radio-group), [Story styles](../style-guides/docs/story-language.md#story-styles).

**Why.**
- The RadioGroup owns the value in all three libraries (Radix and Reka bind the group, not a radio; Material's `MatRadioGroup` is the form control), so a Radio that also bound a group state would be a second way to do one thing ([architecture §10](../architecture.md#10-simplicity-and-reuse)) and needed its own printer code to keep the Radio that loses the check from rewriting the state.
- A story layout copied into an app should follow `dir` without a second pass. Logical sides do that by construction, and no story needs a physical left or right side, so the compiler refuses them with the name of the logical property instead of accepting both.
