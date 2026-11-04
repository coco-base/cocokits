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

## Tooling has its own layer

Rule: [Tags and boundaries](../style-guides/workspace/nx-tags-and-boundaries.md).

**Rejected alternatives.**
- *Tag a private tool `layer:shared`.* That layer imports nothing internal. Letting a tool import `@cocokits/shared` would loosen the rule for every package in the layer.
- *Put every tool into the `workspace` project.* Every tool change would run the generator-verify job and grow the plugin.

**Why.** A private tool that reads the contracts in `shared` is never imported by a published package. Under its own `layer:tool` tag it may import `shared` and other tools, while `layer:shared` keeps its "nothing internal" rule. Other layers do not list `layer:tool`, so no published package can import a tool; that is a property of the table instead of a review rule.

## Package names

**Rejected alternatives.** `contracts` and `controllers`.

**Why.** `machines` continues the vocabulary of the old repo and of Zag. `shared` says plainly that every framework uses it.

## Not Zag.js or XState as the machine runtime

**Rejected alternatives.**
- *Zag.js as a runtime dependency.* It has no official Angular adapter. It renders `data-scope` and `data-part`, which CocoKits drops (see [styling-contract.md](styling-contract.md)). Its output would become our public API.
- *XState.* Too heavy for UI widgets.
- *TanStack Store.* Pre-1.0 when considered.

**Why.** Three problems are easy to mix: component logic, the reactive container, and the bridge that re-renders a framework. Angular and Vue are signal-based. React needs immutable snapshots read through `useSyncExternalStore`. Machines only need to stay framework-free and SSR-safe. How state binds to a framework is left to the adapters.
