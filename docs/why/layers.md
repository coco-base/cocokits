# Why: layers and packages

Rules: [Layers and packages](../architecture.md#2-layers-and-packages). This file explains them and states no rules.

## A separate machines layer

**Rejected alternatives.**
- *Put the logic in a shared runtime package.* The old repo's `layoutClassNamesConfigRecord` in its core package imports every component, so anything using it pulls them all in.

**Why.**
- The layer exists for reuse, not performance. Keyboard handling, ARIA wiring and edge cases of Tabs are written and tested once instead of once per framework. That makes "adding another framework is cheap" true.
- A separate layer keeps the shared packages small. The boundary is a package boundary that lint can enforce.
- A component can ship hand-written first and move onto a machine later without changing its public API.

## One `@cocokits/machines` package

**Rejected alternatives.**
- *One npm package per machine.* Many packages to version and publish for no extra tree-shaking. Subpaths give the same isolation. The single-root alternative is covered in [entry-points.md](entry-points.md).

**Cost.** Lockstep versioning means every machine fix releases a new version of the whole set. That is acceptable.

## No `@cocokits/core`: utils, shared and cdk instead

**Rejected alternatives.**
- *Keep core.* An extra layer with a fuzzy boundary to cdk.
- *Put the store and interpreter in utils.* Utils must stay stateless and dependency-free so it is safe everywhere, including theme builds and Node scripts.
- *Put the runtime inside machines.* Cdk modules (presence, roving focus, typeahead) need state too, and cdk sits below machines.

**Why.** The old `core` mixed pure functions (`mergeProps`, `dataAttr`, the theme resolver, DOM and env guards) with a stateful runtime. Its only job was to sit between utils and cdk. Now each layer has one simple rule: utils is stateless, cdk holds the stateful building blocks, machines hold one component each.

## Shared contracts in `@cocokits/shared`

**Rejected alternatives.**
- *Put shared interfaces in machines.* Themes and docs would depend on behaviour code.
- *Put them in utils.* It mixes CocoKits-specific contracts with generic helpers.
- *Name it `models`.* It clashes with Angular `model()` and data models.

**Why.** Machines, cdk, framework packages and themes all need the anatomy type, `ComponentMeta`, `ThemeConfig` and the reserved `data-*` names. Everyone who needs a contract imports only the contract, so themes never pull behaviour code. Component-specific contracts stay with their component.

## Sibling imports and no cycle

Rules: [Layers and packages](../architecture.md#2-layers-and-packages), [Tags and boundaries](../style-guides/workspace/nx-tags-and-boundaries.md#rules).

**Rejected alternatives.**
- *Ban every import between machines, cdk modules and component subpaths.* Components need each other's contracts: form-field with label and hint, select with menu, radio-group with radio. With a ban, each shared contract moves into `@cocokits/shared`, and component-specific contracts become global.
- *Catch cycles in review.* A cycle through a type-only import is easy to miss, and nothing fails until a bundler or a build order does.
- *`import-x/no-cycle`.* It ignores type-only imports, and a contract shared by two components is often type-only.

**Why.**
- A cycle, not an import, is what breaks build order and tree-shaking: two entry points that import each other cannot be built or loaded one first. One direction can.
- Contracts stay with their owner, so `shared` keeps only generic contracts.
- Entry-only imports keep a folder from coupling to another's internals; the form of the import follows what the module-boundaries rule and ng-packagr allow.
- dependency-cruiser builds the whole graph in one run, counts type-only edges, resolves the `@cocokits/*` aliases from `tsconfig.base.json` and reads `.vue` files, so the repo writes no graph code.

**Cost.** Two dev dependencies (`dependency-cruiser`, `@vue/compiler-sfc`) and one `cycles` target per project that has component folders.

## Docs tooling has its own layer

Rule: [Tags and boundaries](../style-guides/workspace/nx-tags-and-boundaries.md).

**Rejected alternatives.**
- *Tag docs tooling `layer:shared`.* That layer imports nothing internal. Letting the story compiler import `@cocokits/shared` would loosen the rule for every package in the layer.
- *Put the tooling into the `workspace` project.* Every compiler change would run the generator-verify job and grow the plugin.

**Why.** Docs tooling (the story compiler, the story sources, the code they share) reads the contracts in `shared` and is never imported by a published package. Under its own `layer:docs` tag this tooling may import `shared` and other docs tooling, while `layer:shared` keeps its "nothing internal" rule. Other layers import `shared` as the dependency table says; the tag gives docs tooling no new right over them.

## Docs-only code lives in a private package

Rule: [Layers and imports](../style-guides/framework-agnostic/layers-and-imports.md).

**Rejected alternatives.**
- *Keep the preview protocol and the docs data types in `@cocokits/shared`.* Every export of a published package is public API: users could import it, a change to it would need a changeset and a semver bump, and the package would ship code no user runs.

**Why.** The preview protocol, the docs data types and their helpers serve only the docs site, the preview apps and the story compiler. In the private `@cocokits/docs-shared` (`layer:docs`) they change with the site, need no changeset, and the boundary rules keep every published package from importing them.

## Apps have their own layer

Rule: [Tags and boundaries](../style-guides/workspace/nx-tags-and-boundaries.md).

**Rejected alternatives.**
- *Tag apps `layer:shared` or `layer:fw-component`.* The first forbids importing `@cocokits/shared`, the second would let an app sit in a layer that other packages may import.
- *Tag apps by `type:app` alone.* Every project has one `layer:*` tag, and tooling that groups projects by layer would find none for the apps.

**Why.** The docs site and the preview apps consume packages and nothing consumes them. A `layer:app` value that no "may depend on" list contains makes "no package imports an app" a property of the table instead of a review rule, and the `type:app` and `scope:*` rules say what each app may import.

## E2e projects import nothing

Rule: [Tags and boundaries](../style-guides/workspace/nx-tags-and-boundaries.md).

**Rejected alternatives.**
- *Tag the browser tests `type:test`.* That constraint allows `shared`, machines and cdk, which a browser test of the built site must not import, and the Vitest-based conformance projects carry it.
- *Tag them `type:app`.* An app may import `shared`, machines and the docs tooling.

**Why.** The tests drive the built site in a browser and read it only through the DOM. If they imported repo source they could share a selector or a constant with the code under test and keep passing when both are wrong. A tag of their own with an empty "may depend on" list turns that into a lint error, and `layer:app` keeps them out of every other project's list.

## Package names

**Rejected alternatives.** `contracts` and `controllers`.

**Why.** `machines` continues the vocabulary of the old repo and of Zag. `shared` says plainly that every framework uses it.

## Not Zag.js or XState as the machine runtime

**Rejected alternatives.**
- *Zag.js as a runtime dependency.* It has no official Angular adapter. It renders `data-scope` and `data-part`, which CocoKits drops (see [styling-contract.md](styling-contract.md)). Its output would become our public API.
- *XState.* Too heavy for UI widgets.
- *TanStack Store.* Pre-1.0 when considered.

**Why.** Three problems are easy to mix: component logic, the reactive container, and the bridge that re-renders a framework. Angular and Vue are signal-based. React needs immutable snapshots read through `useSyncExternalStore`. Machines only need to stay framework-free and SSR-safe. How state binds to a framework is left to the adapters.
