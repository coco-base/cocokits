# Why: entry points

Rules: [Packages and entry points](../style-guides/workspace/packages-and-entry-points.md). This file explains them and states no rules.

## Root entry by default, subpaths only with a strong reason

**Rejected alternatives.**
- *Subpaths everywhere* (earlier `utils/dom`, `contracts/<area>`, `machines/<name>/meta`, `<fw>/theme`). More import paths to learn and maintain, with no measurable benefit for pure, dependency-free code.

**Why.**
- For pure, dependency-free packages (`utils`, `shared`) a root entry is enough.
- Subpaths pay off where a barrel does harm:
  - modules with optional peer dependencies (`@floating-ui/dom`, `@internationalized/*`) that a root barrel would force on every user;
  - independent modules;
  - Angular, which builds each component as its own entry point;
  - React, which keeps one `'use client'` boundary per component;
  - Angular harnesses, which depend on `@angular/cdk/testing` and must stay out of the runtime entry.
  - the Angular form controls' shared base: `@cocokits/angular/form-control` holds `CckFormControlBase`, which several component entries extend. It needs the optional `@angular/forms` peer, so it cannot live in `angular-core` (every Angular application imports that) or in `form-field` (a field must not need the forms package), and ng-packagr entries cannot share a relative file, so the base is an entry of its own and the only one without a component.
- A written reason per subpath keeps the list short and reviewable.
- The theme framework layers are separate packages, not subpaths (see [themes.md](themes.md)).

## Machines have no root entry

**Rejected alternatives.**
- *One package with a single root entry* (`import { tabs } from '@cocokits/machines'`), relying on tree-shaking.
  - Tree-shaking applies only to production builds. Dev servers (Vite, Next.js dev) and test runners evaluate the whole barrel. This is why Next.js added `optimizePackageImports`.
  - One accidental top-level side effect in any machine silently keeps code for everyone.
  - Heavy dependencies (`@internationalized/date`, Floating UI) load in dev for every user.

**Why subpaths cost users nothing.** End users never import machines directly. `@cocokits/angular`, `@cocokits/react` and `@cocokits/vue` do. The import path only matters inside the repo.

**Cost.** Heavy third-party dependencies become optional peer dependencies, needed only by the components that use them.

## `docs-shared` has `/vite` and `/testing` subpaths

**Rejected alternatives.**
- *A relative import of the plugin file from each `vite.config.mjs`.* The `@nx/enforce-module-boundaries` rule refuses a relative import that crosses a project; the rule is never silenced.
- *The plugin in the root entry.* The root barrel is evaluated in the browser; the plugin imports `node:fs`.
- *A new package for the plugin and one for the test support.* Two more packages (about ten files each) for two small files; the preview PR size limit rules it out and the packages would have one consumer pair each.
- *Test support in the root entry.* Fakes and a `ResizeObserver` stub would ship in the runtime barrel that the preview apps bundle.

**Why.**
- A Vite config is loaded by Node, which resolves a bare specifier through the package `exports`; tsconfig paths do not apply there. So the plugin needs a subpath of a package, and the package is private and already owns the preview code.
- `/testing` follows the same pattern as the cdk and angular `testing` subpaths: test-only code stays out of the runtime entry.
- The exception is limited to the private `docs-shared`; no published package gets such a subpath.

## `story-compiler` has a `/language` path

**Rejected alternatives.**
- *The markers in `@cocokits/shared`.* It is published, and the library will move to a repository that must not know about the story compiler.
- *A new package for the markers.* A package (about ten files) for one small file with one consumer family, and it would be moved with the compiler anyway.
- *A relative import of the file from the stories.* The `@nx/enforce-module-boundaries` rule refuses a relative import that crosses a project; the rule is never silenced.

**Why.**
- The markers belong to the story language, and the compiler owns the language, so they live in its package, in a folder of their own outside `src`.
- Story sources, tests and the compiler resolve it through a tsconfig path, like every private package; a tool has no `exports`, so none is added.
- The entry imports no `@cocokits/*` package, so moving the compiler out takes it along with no change.
- The exception is limited to the private `story-compiler`; no published package gets such a path.
