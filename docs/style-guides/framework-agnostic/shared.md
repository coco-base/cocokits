# Shared contracts (`@cocokits/shared`)

`@cocokits/shared` holds what every framework shares that is not behaviour: anatomy and `ComponentMeta` types, `ThemeConfig`, reserved `data-*` names, and props types. One root entry, no subpaths. A component's own props, anatomy and meta stay with the component in `@cocokits/machines/<name>`.

## Rules

- Generic contracts only: one that every framework, theme or component needs. A contract that one component defines for another (the position type a badge container owns) stays with its owner in `@cocokits/machines/<name>` and is imported from there ([layers-and-imports](./layers-and-imports.md)).
- Only types, `as const` lists and pure helpers that define or check a contract. No state, no DOM access, no timers, no behaviour.
- No workspace or npm dependencies. DOM types are allowed; DOM access is not.
- Generic helpers go to [utils](./utils.md); anything stateful goes to [cdk](./cdk-modules.md) ([layers-and-imports](./layers-and-imports.md)).

## Anatomy

`defineAnatomy` returns the declared object plus a typed `classes` map; see [architecture, section 3](../../architecture.md). The conversion from a camelCase part name to its kebab-case class happens only there. A part has only `name` and `description`.

- The root part is named `root`, never `host`.
- `defineAnatomy` declares a `const` type parameter, so callers never write `as const`.
- Don't add a central record that imports every component's anatomy. If a list is needed, generate it at build time.
- A part with its own inner elements gets its own block (`cck-tab` with `cck-tab__label`), never `cck-tabs__trigger__label`.

Why: [anatomy](../../why/anatomy.md).

## Component meta

The meta `<name>.meta.ts` (a `ComponentMeta`) holds only what code cannot express: the data attributes per part, the keyboard table, the expected roles and the form contract ([architecture, section 8](../../architecture.md)). It is data for tests and docs, never read at runtime. Props are TSDoc on the `Props` interface, not in the meta. Reserved `data-*` names are derived from the meta's attributes.

## Theme attributes

Resolving a component's theme options to `data-*` attributes is a pure helper in this package. It is called by each framework's core `themeAttrs` runtime (which base directives call), never by a machine: a machine never sees `ThemeConfig` ([themes guide](../themes/index.md)).

## Change details

Every value callback has the shape `(value, details)`, where `details` carries a closed `reason` union and the originating event or `null`.
