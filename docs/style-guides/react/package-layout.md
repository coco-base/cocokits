# Package layout, exports, naming and TypeScript

Where React code lives and the naming and typing conventions every part follows. Packages and entry points are created with the library generator ([generators](../workspace/generators.md)); after that the files are normal source.

## Packages

| Package | Folder | Entry points | Contains |
|---|---|---|---|
| `@cocokits/react` | `packages/react/` | One subpath per component, no root | Unstyled parts |
| `@cocokits/react-core` | `packages/react/core/` | Root only | The adapter that runs machines in React, the overlay portal and the theme and direction runtime |
| `@cocokits/theme-<name>-react` | `packages/themes/<name>/react/` | Root only | Hand-written typed theme wrappers ([theming.md](./theming.md)) |

Entry points are added with the library generator (`--kind=fw-entry --framework=react`, [generators.md](../workspace/generators.md)), which creates `packages/react/src/<name>/index.ts`, its test file and the `exports` key. Anatomy, meta and behaviour come from the machine ([machines](../framework-agnostic/machines.md)). Helpers that are specific to React parts and not exported live in `packages/react/src/internal/` ([internals.md](./internals.md)).

Package rules:

- The build keeps one output module per source module (the package builds with `tsdown`, `unbundle`), so each emitted module can keep its own `'use client'`.

## `'use client'` policy

| Module | Directive |
|---|---|
| Every module that defines a part, calls a hook, creates or reads a context, or attaches handlers | First statement, kept per module by the build |
| Barrels (`index.ts`) | Never: they only re-export, and the bundler follows them to the client modules; Server Components can import types |
| Pure modules (types, plain helpers) | Never |

Check the emitted modules after a build when you add or move a module ([nextjs-ssr.md](./nextjs-ssr.md)).

## Naming

What a name says about its value: [architecture §10](../../architecture.md#10-simplicity-and-reuse).

| Thing | Convention | Example (illustrative) |
|---|---|---|
| Part component | `<Component><Part>` function; namespace member `<Part>` | `TabsTrigger`, `Tabs.Trigger` |
| `displayName` | `'<Component>.<Part>'` on every exported component | `TabsTrigger.displayName = 'Tabs.Trigger'` |
| Context | `<Component>Context`, hook `use<Component>Context(partName)` | `useTabsContext('Tabs.Trigger')` |
| Booleans | platform names, no `is*` | `disabled`, `readOnly`, `required` |
| Events | `on<Thing>Change(value, details)` | `onValueChange`, `onCheckedChange` |
| Errors | `CocoKits: <what>. <how to fix>.` | `CocoKits: <Tabs.Trigger> must be placed within <Tabs.Root>.` |
| JS identifiers | no `Cck` prefix (the package scope disambiguates); `cck-` stays on classes and CSS variables | `Switch.Root`, `cck-switch` |

Exports are named only; no default exports in package code.

## TypeScript

- Props: `interface XProps extends Omit<ComponentPropsWithRef<'el'>, ...redefined keys>`. Always omit `color` (theme naming); omit `value`/`defaultValue`/`onChange`/`defaultChecked` when redefined.
- Item-based components are generic over the item and use `function` declarations (arrow generics cannot take `displayName`).
- No `React.FC`. Declare `| undefined` where `undefined` is forwarded.
- Export every public `Props`, `State` and `ChangeDetails` type by name.
- Hooks lint (`eslint-plugin-react-hooks`) runs with zero warnings as part of the `lint` target; do not disable its rules without a written reason.
