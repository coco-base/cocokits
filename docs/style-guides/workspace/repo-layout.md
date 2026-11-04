# Repository layout

Where each kind of code lives. Package names and entry points: [packages-and-entry-points.md](./packages-and-entry-points.md). Commands: [targets.md](./targets.md).

```
cocokits/
├─ AGENTS.md  CLAUDE.md             # contributor entry: what the repo is, the rules, where they live
├─ docs/
│  ├─ architecture.md  glossary.md  why/
│  └─ style-guides/<area>/          # index.md plus small topic files per area
├─ compatibility.json               # supported peer ranges, browsers, SSR targets
├─ packages/
│  ├─ utils/                        # @cocokits/utils            layer:utils
│  ├─ shared/                       # @cocokits/shared           layer:shared
│  ├─ cdk/                          # @cocokits/cdk/<module>     layer:cdk
│  ├─ machines/                     # @cocokits/machines/<name>  layer:machine, ONE Nx project
│  ├─ angular/                      # @cocokits/angular          layer:fw-component
│  │  └─ core/                      # @cocokits/angular-core     layer:fw-core
│  ├─ react/                        # @cocokits/react
│  │  └─ core/                      # @cocokits/react-core
│  ├─ vue/                          # @cocokits/vue
│  │  └─ core/                      # @cocokits/vue-core
│  └─ themes/<name>/                # cocokits, frames-x
│     ├─ core/                      # @cocokits/theme-<name>         layer:theme, scope:shared
│     ├─ angular/                   # @cocokits/theme-<name>-angular layer:theme, scope:angular
│     ├─ react/                     # @cocokits/theme-<name>-react
│     └─ vue/                       # @cocokits/theme-<name>-vue
├─ tools/
│  ├─ workspace-plugin/             # @cocokits/workspace: the library generator, the tokens, docs-data, api-docs-angular, api-docs-react, api-docs-vue and api-parity executors
│  ├─ eslint/                       # shared flat configs: base, boundaries, entry points, contract rules, exceptions, file size
│  └─ scripts/                      # ci-local.mjs, package-checks.mjs, verify-library-generator.mjs
└─ nx.json  pnpm-workspace.yaml  tsconfig.base.json  eslint.config.mjs  size-limit.config.mjs  .changeset/  .github/
```

`dist/` at the root holds the build output of the Angular packages (`dist/packages/<name>`), the tarballs of the publish checks (`dist/tarballs`) and the extractor output (`dist/api-docs`, `dist/docs-data`). It is git-ignored.

## Placement rules

- A directory under `packages/` is a published library unless its `package.json` has `"private": true`.
- Angular components live in `packages/angular/<component>/` (secondary entry point, with `testing/` for the harness). Other frameworks: `packages/<fw>/src/<component>/`. Each folder is one entry point `@cocokits/<fw>/<component>`.
- A component's anatomy, machine, types and meta (`<name>.meta.ts`; `.spec.ts` is reserved for tests) live in `packages/machines/<name>/`.
- A theme is four projects under `packages/themes/<name>/`: the framework-free core and one package per framework.
- The framework theme runtime lives in `@cocokits/<fw>-core`; the typed theme layer per framework lives in `packages/themes/<name>/<fw>/`.
