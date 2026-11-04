# Structure and imports

Where Vue files live, what an entry point exports, and which package owns each symbol. Packages and entry points are created with the library generator ([generators](../workspace/generators.md)); never copy a folder.

## Packages

| Package | Folder | Entry points | Contains |
|---|---|---|---|
| `@cocokits/vue` | `packages/vue/` | One subpath per component, no root | Base parts only, no theme code |
| `@cocokits/vue-core` | `packages/vue/core/` | Root only | The adapter that runs machines in Vue, the shared composables, the overlay portal and the theme runtime |
| `@cocokits/theme-<name>-vue` | `packages/themes/<name>/vue/` | Root only | Hand-written typed theme wrappers ([theming.md](./theming.md)) |

Entry points are added with the library generator (`--kind=fw-entry --framework=vue`, [generators.md](../workspace/generators.md)), which creates `packages/vue/src/<name>/index.ts`, its test file and the `exports` key. Anatomy, meta and behaviour come from the machine ([machines](../framework-agnostic/machines.md)).

Inside a component folder (example shape):

```
packages/vue/src/<name>/
  <Name>Root.vue, <Name><Part>.vue   one SFC per anatomy part, PascalCase
  <name>.context.ts                  provide/inject pair
  <name>.types.ts                    Props, Emits, Slots, ChangeDetails (TSDoc lives here)
  index.ts                           flat and namespaced exports
```

- Types and context live in `.ts` files, never in a second `<script>` block or exported from a `.vue` file.
- Component registration names use the `Cck` prefix (`defineOptions({ name: 'CckTabsTrigger' })`).
- No theme code (wrappers, `size`/`color` props) in `packages/vue/src/<name>/`.

## Imports by layer

| Symbol | Import from |
|---|---|
| Stateless helpers (`dataAttr`, `mergeProps`, `cx`, `toIdSegment`, DOM queries, SSR guards) | `@cocokits/utils` |
| A component's anatomy, meta and behaviour | `@cocokits/machines/<name>` |
| Contracts (`defineAnatomy`, `ThemeConfig`, `ChangeDetails`) | `@cocokits/shared` |
| Framework-free behaviour (positioning, dismissal, focus, portal target, form control, roving focus) | `@cocokits/cdk/<module>` |
| Vue composables and runtime (polymorphic primitive, context helper, collection, form-control composable, portal, theme runtime) | `@cocokits/vue-core` |

- `@cocokits/vue-core` does not re-implement a utils helper; it wraps cdk modules into composables.

## Build

- The package builds with Vite library mode (`@vitejs/plugin-vue`), one output module per source module; `vue` is a peer dependency; `sideEffects: false`.
- Dev-only warnings use `process.env.NODE_ENV !== 'production'`, never `import.meta.env.DEV` (frozen at the library's build).
- No CSS injected from JavaScript; the base ships no styles.
- No dependencies beyond `vue` and `@cocokits/*`.
