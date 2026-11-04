# CocoKits: Architecture

This file states the cross-cutting rules for writing and reviewing CocoKits code. Guides under `docs/style-guides/` add rules specific to their area and link here instead of restating these. The reasons are in [`docs/why/`](./why/index.md); read a why file only when you need the reason or want to change the rule.

**Examples are illustrative.** Named components in any doc (Switch, Tabs, Popover, Select, Dialog, …) illustrate a general rule. They are never a spec of that component. A component's real behaviour (DOM, keyboard, ARIA, forms, states, API) comes from its requirements and its implemented, tested contract.

`AGENTS.md` at the repository root points to these rules and does not add new ones.

## 1. Goals

1. One set of **unstyled ("any-style") components** for **Angular, React (including Next.js) and Vue**. Only these three are supported.
2. Many **themes**. A theme is CSS plus a typed config, and it behaves the same in every framework.
3. Adding a component or theme must be cheap: behaviour is written once and shared.
4. **Code quality comes first**, so every contributor follows the same written rules and automated checks.
5. **A good developer experience in each framework** comes before identical authoring code across frameworks. Behaviour, DOM and themes are shared; the way a developer writes a component may differ.
6. **Current stable framework versions and their current APIs**. Support covers the current framework major, plus the previous one where the APIs allow. Guides never name versions; supported ranges live in `peerDependencies` and `compatibility.json`.

## 2. Layers and packages

```
utils, shared  ←  cdk  ←  machines  ←  <fw>-core  ←  <fw> components (base)  ←  themes (theme layer + CSS)
```

| Layer | Package | Entry points | Contains | Framework code? |
|---|---|---|---|---|
| utils | `@cocokits/utils` | Root only | Stateless generic helpers (class and attribute merging, DOM queries, ids, env/SSR guards, type helpers) | No |
| shared | `@cocokits/shared` | Root only | What all frameworks share that is not behaviour: anatomy and `ComponentMeta` types, `ThemeConfig`, reserved `data-*` names, props types | No |
| cdk | `@cocokits/cdk` | One subpath per module | Framework-free behaviour building blocks (focus handling, dismissal, positioning, presence, collections, form participation, …) | No |
| machines | `@cocokits/machines` | One subpath per component, no root | Per component: anatomy, meta, behaviour and the props each part needs | No |
| fw-core | `@cocokits/<fw>-core` | Root only | The adapter that runs a machine in one framework, the overlay portal, the theme runtime | Yes |
| base components | `@cocokits/<fw>` | One subpath per component | Unstyled parts with fixed classes and `data-*` attributes | Yes |
| themes | `@cocokits/theme-<name>` + `@cocokits/theme-<name>-<fw>` | Root only | Framework-free package: `ThemeConfig`, CSS and tokens; one package per framework with the thin typed theme layer | CSS + thin code |

There is no `core` package. A layer only imports from layers to its left; utils and shared import nothing internal; fw-core never imports a concrete machine. The dependency table and the lint configuration are in the [workspace guide](./style-guides/workspace/nx-tags-and-boundaries.md).

**No cycle between siblings.** Components need each other's contracts (a form field reads the type of its label or hint), so inside one layer a machine may import another machine's entry (`@cocokits/machines/<other>`), a cdk module a sibling module's `index.ts`, and a framework component subpath another's entry (`@cocokits/<fw>/<other>`), as long as the imports form no cycle. Type-only imports count. The import has two forms. Where a project's own alias is rejected by the module-boundaries rule (machines, cdk, React, Vue), the entry is a relative import of the other folder's `index` (`../badge-container`). Where the folders are separate ng-packagr entry points (Angular), it is the package alias (`@cocokits/angular/badge-container`). Test files follow the same rule. Any deeper path into another component folder is an error. A contract that two components share stays with the component that owns it and never moves into `@cocokits/shared`, which keeps generic contracts only. The `cycles` target of `machines`, `cdk`, `angular`, `react` and `vue` (dependency-cruiser, [targets](./style-guides/workspace/targets.md)) fails on a cycle and on a deeper path, so review does not have to catch them.

Why: [layers](./why/layers.md#sibling-imports-and-no-cycle)

**Entry points.** Import from a package root. A subpath exists only where the [entry-point table](./style-guides/workspace/packages-and-entry-points.md) lists one (`@cocokits/cdk/<module>`, `@cocokits/machines/<name>`, `@cocokits/<fw>/<component>`, `@cocokits/angular/<component>/testing`, and the one non-component subpath `@cocokits/angular/form-control`). A lint rule rejects other subpath imports.

Why: [entry points](./why/entry-points.md)

**Machines** hold the behaviour of one component, written once and reused by every framework: keyboard handling, ARIA wiring, state, and the props each part needs. `@cocokits/machines/<name>` exports the anatomy, the meta and the behaviour. End users never import machines directly; the framework packages do.

Why: [layers](./why/layers.md)

**fw-core** is the small adapter that runs a machine inside one framework and converts the props a machine produces into that framework's conventions.

**Framework-free, SSR-safe shared layers.** utils, shared, cdk and machines import no framework, access no `window`/`document` at import time, and have no top-level side effects. State is created and DOM is touched only inside functions called by an adapter, after mount. How a machine's state is bound to a framework's reactivity is an adapter concern; the machine itself stays framework-free.

**Next.js** is React plus SSR/RSC, not a separate framework. Machines, cdk and the React package must not touch `window`/`document` at import time, must use SSR-stable ids, must keep `'use client'` in the build, and must render the same markup on the server and the first client render. React tests cover server render, hydration and import safety.

**Overlays:** floating or overlay parts are rendered in an overlay container, never inside the trigger's parent. An overlay opened from inside a modal dialog stays inside the dialog's subtree (it is not made inert by it), works inside shadow roots, and follows the theme scope, mode and `dir` of the trigger's ancestors. Closed overlays render nothing on the server. Only one cdk module wraps the positioning library (`@floating-ui/dom`, an optional peer); it only computes and writes coordinates: those of the content and of its arrow (position and rotation).

Why: [overlays](./why/overlays.md)

## 3. Anatomy and the styling contract

One rule: **a class says what an element is; a `data-*` attribute says everything that varies**.

Why: [styling contract](./why/styling-contract.md)

| What | Rendered as | Example (illustrative) |
|---|---|---|
| Block and part | Fixed BEM class | `cck-tabs`, `cck-tabs__trigger` |
| Runtime state (base layer) | `data-*` | `data-selected`, `data-disabled`, `data-orientation="vertical"` |
| Theme options (theme layer) | `data-*` | `data-size="lg"`, `data-variant="outline"`, `data-rounded` |

- Every component declares its **parts** once (why: [anatomy](./why/anatomy.md)). Example (illustrative; the parts of a real component come from its requirements):

  ```ts
  export const exampleAnatomy = defineAnatomy({
    block: 'example',
    parts: {
      root:    { name: 'Root',    description: 'Wraps the whole component.' },
      trigger: { name: 'Trigger', description: 'The element that activates it.' },
    },
  });
  ```

  `defineAnatomy` (from `@cocokits/shared`) returns the same object plus a typed `classes` map (`exampleAnatomy.classes.trigger === 'cck-example__trigger'`). A part has only `name` and `description`: no state, options, role or other attributes (role and ARIA are behaviour, rendered by the machine). A component's anatomy and meta live in `packages/machines/<name>/` and are exported from `@cocokits/machines/<name>`. The anatomy never depends on `ThemeConfig`.
- **One rendered contract per component** (why: [rendered contract](./why/rendered-contract.md)): once a component's contract is settled, every framework renders exactly that (same parts, classes, `data-*`, roles, focus and ref targets, labelling and **default element**); only the authoring shape differs. Where the contract lets the author choose the element of a part, every framework lets them, and the meta's `defaultElements` names the default. A part's anatomy description says what the part is for, never which element it is, unless the behaviour contract fixes the element. Ids are generated from the root id (SSR-stable); a value that links sibling parts (a Tab and its panel) enters an id only through the injective `toIdSegment`. The meta (`<name>.meta.ts`) declares every emitted `data-*` attribute; undeclared output fails a test.
- Every part renders its fixed class. There is no `data-scope`/`data-part`.
- `data-*` naming: booleans are presence attributes (`data-disabled=""`, absent when false); named values are value attributes; one attribute per fact (no `data-unselected` next to `data-selected`); `data-state` only for exclusive lifecycle states (`open|closed`); base attribute names are reserved and a `ThemeConfig` cannot reuse them.
- A `data-*` the base renders names a **fact** (`data-empty`: no text is shown; `data-truncated`), never a **look** (`data-dot`). Whether a fact is drawn as a dot, a badge or nothing is the theme's decision (why: [styling contract](./why/styling-contract.md#the-base-states-facts-the-theme-decides-the-look)).
- `data-*` attributes are **output only**: the component renders them from typed props or internal state. Developers configure through props, never by writing `data-*`.
- **Public API discipline.** Classes and `data-*` names are public API. Renaming or removing one is a breaking change; adding one is a minor change. The anatomy (the parts and the nesting a theme selector relies on) is public API too. Changing it is breaking (major) and the changeset documents it. Add a part (a wrapper, for example) only when a layout needs it, never speculatively.
- **CSS isolation:** theme CSS that styles a part targets its own class plus its own attributes (`.cck-example__trigger[data-selected]`), never a bare attribute (`[data-size="lg"]`) and never a descendant selector across blocks (`.cck-example [data-selected]`), because projected content can contain other components. Theme CSS sits in a cascade layer (`@layer cocokits`) so customer overrides win. Details: [css-conventions.md](./style-guides/themes/css-conventions.md).

## 4. Theme configuration (size, variant, color, theme-only options)

**The base (unstyled) layer** owns behaviour, accessibility, state, forms and anatomy. Its options are behavioural: `disabled`, `value`, `orientation`, …

**The theme layer** owns visual options. A theme declares which `size`/`variant`/`color` values it supports and adds its own options (for example `rounded`). The theme layer renders them as `data-*` attributes on the right parts. A theme never changes behaviour.

**Base or theme.** Decide it for every prop, input, `data-*`, CSS variable and element before the API is written.

- The base owns behaviour, content, state facts, ARIA, keyboard and forms. Hiding that the base promises uses a native mechanism (`hidden`), so the unstyled base hides with no theme rule.
- The theme owns variant, size, color, a dot, corner insets, offsets and radii. The base never takes a prop, input or output whose only effect is visual, and a base part never writes a prefixed CSS variable or an inline style. Only unprefixed variables for measured geometry are allowed, and the unprefixed `--side-offset` that the theme sets and the positioning module reads (the gap of an overlay). React and Vue overlay content may also take that gap and its alignment offset as numbers (`sideOffset`, `alignOffset`), as the reference libraries do; unset, the theme's `--side-offset` applies, and Angular uses the theme only ([machines](./style-guides/framework-agnostic/machines.md#props-per-part)).
- A theme may expose a visual setting as a **documented custom property** that the author sets ([css-conventions](./style-guides/themes/css-conventions.md#documented-custom-properties)).

Why: [themes](./why/themes.md#the-base-has-no-visual-only-input)

| Framework | Theme layer | Why |
|---|---|---|
| **Angular** | A **directive on the same element**, either with the same selector as the base or attaching the base via `hostDirectives`. **Never a wrapper component that renders the base inside its template.** | Wrappers break native elements, content queries, compound parent lookups, forms, CSS structure and imperative APIs. |
| React (incl. Next.js), Vue | A **theme component that wraps the base**. It takes typed theme options and provides them to the base parts through the fw-core theme runtime. | Context, slots and children pass through wrappers without the problems Angular has. |

Base parts never take a `theme` prop. They read the theme options that apply to them from the fw-core theme runtime, which returns one empty record per part when no theme is provided. This also reaches parts a component renders internally.

`ThemeConfig` is an executable schema: per component, options with their values, default, the parts they apply to and the attribute they render; `null` removes an attribute; precedence is in [theme-config](./style-guides/themes/theme-config.md#precedence). Icons and templates come from the theme layer, never from machines. Each theme's rules (token architecture, CSS-variable prefix and markers, mode attributes, CSS style guide) live in `packages/themes/<theme>/core/docs/`.

The typed theme layers live in their own packages (`@cocokits/theme-<name>-<fw>`), scaffolded by the `library` generator and filled by hand. Typed values come from each theme's own component types, so a theme without `size` exposes no `size` prop. There is no global type registration and no untyped `additional` record. Themes are distributed as npm packages.

Why: [themes](./why/themes.md)

## 5. Selectors and component shape (Angular), compound components (all frameworks)

Angular selectors (examples):

| Case | Angular selector |
|---|---|
| The part's role has a native element ([aria-rules, Semantics first](./style-guides/accessibility/aria-rules.md#semantics-first)) | That element with the attribute: `button[cckButton]`, `a[cckButton]`, `input[cckInput]` |
| Any other part, including one with internal markup | Attribute only, on the author's element: `[cckBadge]`, `[cckTooltip]` |

**The behaviour contract requires a native element** when the part's role has a native element: a trigger is `button` or `a`, a form value is `input`, `select` or `textarea`, a modal Dialog is `dialog`. A Popover with `modal` keeps its content element and gets `aria-modal="true"`, as Radix and Reka do ([why](./why/overlays.md#a-modal-popover-keeps-its-content-element)). The component's requirements record that element in the Anatomy table, and the selector fixes it. Every other part is attribute-only so the author chooses the element, and the meta's `defaultElements` names the default that docs, stories and tests use. A part with internal markup is a component with an attribute selector, not a tag.

Base parts that have no markup of their own are directives. Parts that need internal markup are components. Both use attribute selectors.

**Compound components: the authoring shape is per framework; the rendered contract is shared**.

| Framework | Authoring shape | Example (illustrative) |
|---|---|---|
| Angular | **Content projection**: one child per section holds its own header and content, and each section is configured on its own element (never one big array input). | `<div cckTabs><div cckTab label="A">…</div></div>` |
| React (incl. Next.js), Vue | **Sibling parts** linked by `value` (Radix style), which stays SSR-safe | `<Tabs.Root><Tabs.List><Tabs.Trigger value="a"/></Tabs.List><Tabs.Content value="a"/></Tabs.Root>` |

- Same machine, same rendered parts, classes, `data-*` and default element in every framework, so every theme works everywhere.
- Children register with their parent through DI (Angular) or context (others), never through structural content queries. In Angular, projected children register before the parent's view renders, so SSR output is complete.
- Tests assert on the rendered parts, never on the authoring shape.
- The component's requirements and its documentation describe the authoring shape of every framework.

Why: [rendered contract](./why/rendered-contract.md#the-element-is-the-authors-choice)

## 6. Props, events and forms contract

- Controlled and uncontrolled are both supported, and each framework maps them idiomatically:

  | Framework | Mapping |
  |---|---|
  | Angular | `model()` + output |
  | Vue | `v-model`, and `update:*` as the only change event (no `openChange` or `valueChange` beside it) |
  | React | `value` / `defaultValue` / `onValueChange(value, details)` |

- Change callbacks fire when the component changes its own value: through user interaction or a native form reset. They never fire when the parent changes a controlled value or updates props.
- Refusal and change notification follow each framework's reference ([§10.5](#10-simplicity-and-reuse)): Angular `disableClose` / `closePredicate` and Material output names, React Content handlers and `details.cancel()`, Vue Content emits and `update:*` only. The cdk dismiss intent is the shared core ([why](./why/overlays.md#each-framework-refuses-and-reports-as-its-reference-does)).
- Form participation (the form contract is part of each component's contract; component tests submit and reset a real form in every framework; details in the [React](./style-guides/react/forms.md), [Vue](./style-guides/vue/forms.md) and [Angular](./style-guides/angular/forms.md) forms guides):
  - Angular: Signal Forms is the model integration (no `ControlValueAccessor`); native submission uses a hidden native input when `name` is set.
  - React and Vue: one shared primitive (`@cocokits/cdk/form-control`) renders a hidden native input whenever the component can be submitted or validated, not only when `name` is set. So native `input`/`change` events, the `form` attribute, fieldsets, constraint validation and reset work.
  - A component whose control is a native `input` (text, checkbox, radio) or `textarea` renders no hidden input in any framework. The same cdk module reports the owner form's reset and submit and the disabling fieldset, writes the value (or `checked`) to the element, and reports a radio that another radio of its group unchecked ([why](./why/forms.md)).
- One polymorphism mechanism per framework: React `render` prop, Vue `asChild` / `as`, Angular attribute selectors on the real element.

## 7. Accessibility

Native elements first; roles and keyboard behaviour follow the WAI-ARIA Authoring Practices; every keyboard behaviour a component documents has a test. Guides: [accessibility](./style-guides/accessibility/index.md).

## 8. Single source of truth

| Information | Source |
|---|---|
| API descriptions (props/inputs, events/outputs, models, slots, methods) | TSDoc on the framework source code |
| Parts and classes | The anatomy in `packages/machines/<name>` (when the component exists) |
| `data-*` per part, keyboard table, expected roles, form contract | The component meta `<name>.meta.ts` in `packages/machines/<name>` (when the component exists) |
| Theme options and their `data-*` values | Each theme's `ThemeConfig` |
| Supported framework and browser ranges | `compatibility.json` and each package's `peerDependencies` |

Examples are not specs: they never define a component's behaviour.

Why: [tooling](./why/tooling.md)

## 9. Tests and quality gates

| Kind | Covers | Runner |
|---|---|---|
| Unit | utils, shared, cdk, machines (transitions, props, keyboard maps) | `nx test` (Vitest, node) |
| Component | A framework component rendered in a DOM: parts, classes, `data-*`, roles, keyboard, forms, accessibility checks. Every framework also gets server render and hydration tests; only React also gets the import-safety test | `nx test` (Vitest) |

Tests use explicit assertions, not catch-all DOM snapshots (see the [testing guide](./style-guides/testing/index.md)).

The checks and commands that exist are listed in [targets.md](./style-guides/workspace/targets.md).

## 10. Simplicity and reuse

1. **Reuse first.** Before writing code, search the repo for an existing implementation, helper, cdk module, util, component, pattern or doc that does the same or a similar job. Reuse or extend it; never add a second one.
2. **Simplest solution.** Choose the simplest solution that meets the spec: no abstraction, option, layer, generic or config the spec does not need. If 5 lines can do what 30 do, write the 5. Use the mechanism the framework provides before a hand-written one; the framework guide lists each exception with its reason, and code that needs a new exception adds it there first.
3. **No duplication.** Shared logic goes to the layer that owns it (utils, shared, cdk or the machine). Shared text lives in one owner file and other files point to it. Code reads a fact from its source (§8) and never restates it as a literal; a part binds the class the machine returns ([machines](./style-guides/framework-agnostic/machines.md#props-per-part)). One exception: a project that may not import the owner (the `workspace` project imports nothing internal, [dependency table](./style-guides/workspace/nx-tags-and-boundaries.md#dependency-table)) keeps a copy with a comment that names the owner.
4. **Names say what the value is.** Name a value for what it holds, not for its kind. This item owns the rule; the guides point here.
   - A parameter or field that names another thing ends in `Name`: `componentName`, `partName`, `attrName`. A field that names its own object stays `name` (`ThemeConfig.name`, a part's `name`).
   - A config object is named after its type: `themeConfig`, not `config`.
   - A function is a verb phrase (`resolveOptions`, `resolveThemeAttrs`) or is named after the single value it returns (`dataAttr`, `themeAttrs`, `linkClickGuard`).
   - An established domain term keeps its name (`block` in an anatomy, `element` for the rendered element).
   - A bare kind word (`component`, `config`, `part`, `read`, `directive`, `own`) is still wrong where it hides what the value is: say which one (`themeDirective`, `ownValues`). A name that a framework API fixes (`read` in `afterEveryRender`, `directive` in `hostDirectives`) is exempt.
   - An abstract class that directives or components share ([when](style-guides/angular/components-and-selectors.md#directive-on-the-users-element)) ends in `Base` (`CckButtonBase`, `CckTextControlBase`); `Root` is only the root part of an anatomy.
   - Use the [glossary](./glossary.md) term, and never a framework type name for something else.
   - Exported names, fields and parameters of exported functions are API (semver); settle them before the first release.
   - In a published `@cocokits/*` package, a public member of an exported class that only the library's own parts use (marked `@internal`) starts with one `_` (`_register`, `_theme`), so a consumer does not use it by accident. Everything else keeps its plain name: the members of a class or interface that is internal as a whole (`CckOverlayLayer`), `private`, `protected` and `#` members, consumer API (inputs, models, outputs, documented methods), names a framework or a base class fixes (lifecycle hooks, an override of a `protected` member) and every project that is not published (tools, tests).
   - Code comments describe the current code. They never name plans, tickets or review rounds; that history lives in the pull request.
5. **Reference API per framework.** Every public API choice follows the reference library of that framework: Angular follows [Angular Material](https://material.angular.dev) and the [Angular CDK](https://material.angular.dev/cdk/categories), React follows [Radix UI](https://www.radix-ui.com), [Base UI](https://base-ui.com) and [React Aria](https://react-aria.adobe.com), Vue follows [Reka UI](https://reka-ui.com). A cdk module follows the matching Angular CDK module (overlay dispatchers, a11y key managers, focus trap) and Radix or Floating UI (dismissable layer, presence), and each behaviour they have that it lacks is a deviation row of the comparison.
   - **What it covers.** The entry point (service, directive or component), the open and close model, the defaults mechanism, the veto or refusal mechanism, the naming of inputs, outputs, props and events, composition (`asChild`, `render`, slots), and the simplicity of the structure. Prefer their simpler solution.
   - **Parity.** Parity across frameworks binds the rendered contract (§3: classes, `data-*`, roles, ARIA, keyboard), not the entry point. Parity never excuses breaking a framework's idiom.
   - **Never a reason.** Repo convenience: a tool can print it, the authoring shapes look alike, less migration, existing code. A tooling limitation never shapes a component API.
   - **Deviation.** It needs all three: the reference precedent with a fetched URL, the reason, and a maintainer's agreement recorded in the pull request or issue that proposes the API. Without them the reference wins.
   - **Originality.** It means no copied code or prose. The reference's API shape is the starting point, never something to avoid.
   - **Proposals.** In every issue, pull request or design discussion, each API or design pick cites its reference precedent (link to a fetched page) or is labelled DEVIATION and put to the maintainers as a question, never as "agreed". A comparison from memory is incomplete.
6. **One name, one owner, simplest channel.**
   - One name per concept through the whole data flow (prop, machine field, type, `data-*`, CSS, docs). Never rename it between layers.
   - Put each piece of configuration and logic on the component whose purpose it serves. A child does not know its parent's concern: the container owns `position`, and the badge only shows its value.
   - Use the simplest mechanism first: CSS on the parent's own attributes (`.cck-badge-container[data-position='top-right'] > .cck-badge`) before any parent-child channel. Where a child really needs parent state, use the framework guide's channel ([Angular](./style-guides/angular/components-and-selectors.md#di-rules), [React](./style-guides/react/compound-parts.md#context), [Vue](./style-guides/vue/compound-parts.md#context)).
7. **Derive from the source; stay pure.**
   - Derive from the single source (the anatomy, the meta) instead of repeating its keys. A helper takes the whole source and loops over it; no call site repeats a part name or makes one call per part. A new part then needs no edit in any adapter. For theme attributes a component calls the helper once with the anatomy and every part it renders binds its own record.
   - A function is pure: it mutates no input and has no hidden effect beyond the one its documentation states. It returns a new value.

Why: [simplicity and reuse](./why/simplicity.md#simplicity-and-reuse), [reference API](./why/simplicity.md#reference-api-per-framework)
