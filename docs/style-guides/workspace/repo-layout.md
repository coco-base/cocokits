# Repository layout

Where each kind of code lives. Package names and entry points: [packages-and-entry-points.md](./packages-and-entry-points.md). Commands: [targets.md](./targets.md).

```
cocokits/
├─ AGENTS.md  CLAUDE.md  INDEX.md   # agent entry: CLAUDE.md imports AGENTS.md; both load only INDEX.md
├─ .claude/skills/<skill>/          # one workflow per task, each pointing at the guide to load
├─ docs/
│  ├─ architecture.md  glossary.md  why/
│  └─ style-guides/<area>/          # index.md plus small topic files per area
├─ compatibility.json               # supported peer ranges, browsers, SSR targets
├─ apps/                            # private, layer:app, type:app
│  ├─ docs/                         # @cocokits/docs             the Astro docs site
│  ├─ preview-angular/              # @cocokits/preview-angular  renders the compiled stories in an iframe
│  ├─ preview-react/                # @cocokits/preview-react    the same for React
│  └─ preview-vue/                  # @cocokits/preview-vue      the same for Vue
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
│  ├─ docs-stories/                 # @cocokits/docs-stories (private)  layer:docs: story sources and config
│  ├─ docs-shared/                  # @cocokits/docs-shared (private)   layer:docs: preview protocol, docs data types, preview kit
│  └─ themes/<name>/
│     ├─ core/                      # @cocokits/theme-<name>         layer:theme, scope:shared
│     ├─ angular/                   # @cocokits/theme-<name>-angular layer:theme, scope:angular
│     ├─ react/                     # @cocokits/theme-<name>-react
│     └─ vue/                       # @cocokits/theme-<name>-vue
├─ tools/
│  ├─ workspace-plugin/             # @cocokits/workspace: the library generator, the tokens, docs-data, api-docs-angular, api-docs-react and api-docs-vue executors
│  ├─ story-compiler/               # @cocokits/story-compiler (private)  layer:docs, type:tool: prints stories
│  ├─ consumer-fixture/             # @cocokits/consumer-fixture (private)  layer:docs, type:tool: compiles the stories from packed packages
│  ├─ eslint/                       # shared flat configs: base, boundaries, entry points, contract rules, exceptions, file size
│  └─ scripts/                      # verify-library-generator.mjs
└─ nx.json  pnpm-workspace.yaml  tsconfig.base.json  eslint.config.mjs  size-limit.config.mjs  .changeset/
```

`apps/` holds only private apps; they publish nothing.

## Placement rules

- A directory under `packages/` is a published library unless its `package.json` has `"private": true`.
- Angular components live in `packages/angular/<component>/` (secondary entry point, with `testing/` for the harness). Other frameworks: `packages/<fw>/src/<component>/`. Each folder is one entry point `@cocokits/<fw>/<component>`.
- A component's anatomy, machine, types and meta (`<name>.meta.ts`; `.spec.ts` is reserved for tests) live in `packages/machines/<name>/`.
- A theme is four projects under `packages/themes/<name>/`: the framework-free core and one package per framework.
- The framework theme runtime lives in `@cocokits/<fw>-core`; the typed theme layer per framework lives in `packages/themes/<name>/<fw>/`.
