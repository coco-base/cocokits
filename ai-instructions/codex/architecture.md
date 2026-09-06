# Repository map

Inspected on 2026-09-06 at baseline `7b7e8334`. Paths here are repository-relative.
Use this map to choose a small area to inspect; current source/configuration wins
over stale prose. The product README describes ambitions beyond the implemented
Angular/React packages.

## Ownership

| Location                                                     | Role / public name                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `packages/common/core`                                       | `@cocokits/core`: theme models, component names, layout selector definitions, class generation, prop validation/defaults |
| `packages/common/utils`                                      | `@cocokits/common-utils`: shared TypeScript helpers, RxJS helpers, selection, DOM utilities, data sources                |
| `packages/common/icons`                                      | `@cocokits/common-icons`: shared icon assets/data                                                                        |
| `packages/angular/core`                                      | `@cocokits/angular-core`: `_UiBaseComponent`, `ThemeConfigToken`, `provideCocokits`                                      |
| `packages/react/core`                                        | `@cocokits/react-core`: `ThemeConfigContext`, `useUiBaseComponentConfig`                                                 |
| `packages/{angular,react}/<library>`                         | Framework components, overlays, utilities, CDK; one publishable package per library                                      |
| `packages/{angular,react}/components`                        | Convenience re-exports; inspect the barrel before assuming an API is exposed                                             |
| `packages/themes/frames-x`                                   | `@cocokits/theme-frames-x`: `framesXThemeConfig`, visual SCSS, token source/output                                       |
| `packages/themes/cocokits`                                   | `@cocokits/theme-cocokits`: `cocokitsThemeConfig`, visual SCSS, token source/output                                      |
| `apps/angular-kits-doc`                                      | `@cocokits/angular-kits-doc`: Angular Storybook stories and configuration                                                |
| `apps/react-kits-doc`                                        | `@cocokits/react-kits-doc`: React Storybook stories and configuration                                                    |
| `packages/internal/common-kits-doc`                          | Shared MDX, assets, example configurations for both doc apps                                                             |
| `packages/internal/storybook-addon-theme`                    | Shared custom Storybook manager/preview UI, state/events, controls, source viewer, tokens/styles                         |
| `packages/internal/storybook-addon-theme-{angular,react}`    | Framework adapters, story types, decorators, argument-to-template helpers                                                |
| `tools/workspace-plugin`                                     | `@cocokits/workspace-plugin`: Nx generators and executors                                                                |
| `tools/scripts/storybook`                                    | Shared Storybook configuration factories and story resolution                                                            |
| `apps/website`                                               | Separate Next.js marketing website; it is not the Storybook documentation app                                            |
| `apps/tokens-doc`                                            | Static token-architecture content; `tokens-doc` has no explicit targets at baseline                                      |
| `figma-design-system`                                        | Separate design/token reference work; not the configured input of the published theme generators                         |
| `graphify-out`                                               | Saved generated graph/cache, not authoritative live project metadata                                                     |
| `ai-instructions/*.cursorrules`, `*.copilot-instructions.md` | Consumer-app guidance for using the library, not monorepo maintenance instructions                                       |

## How components acquire their appearance

1. A consumer supplies a theme configuration through Angular's `provideCocokits`
   or React's `ThemeConfigContext.Provider`, and imports the selected theme CSS/tokens.
2. `_UiBaseComponent` or `useUiBaseComponentConfig` passes the component identity
   and theme props into `getClassNames` in shared core.
3. Shared core validates props, applies theme defaults, and resolves selector
   structures to class names (including state/element hooks).
4. Framework components attach those classes to their rendered DOM. Theme SCSS
   targets the same contract across both implementations.
5. Storybook's framework adapters inject the selected theme and turn custom
   controls into framework-specific story arguments and displayed examples.

These are compatibility boundaries: changing a shared class or theme prop can
affect both libraries and docs even if the original bug appears in one framework.

## Entry points for common investigations

- Missing/wrong class: `packages/common/core/src/lib/class-names/class-names.ts`,
  `<component>-class-names.ts`, `layout-class-names-config.ts`, and
  `css-selector-render.ts` in the same directory.
- Invalid/default prop: `packages/common/core/src/lib/ui-component-props/ui-component-props.ts`
  and the relevant theme's `src/lib/theme-config.ts`.
- Component identity: `packages/common/core/src/lib/model/ui-base-components-name.ts`.
- Theme types: `packages/common/core/src/lib/model/theme-config.model.ts`.
- Angular state: component files and adjacent `*.store.ts`; use
  `packages/angular/form-field/src/lib/form-field.store.ts` as a substantial example.
- React state: local hooks/stores such as
  `packages/react/form-field/src/lib/form-store.ts` and `select-store.ts`.
- Table/data-source work: `packages/angular/table/src/lib`,
  `packages/common/utils/src/lib/data-source`, and the Angular table story directory.
  React's table is currently much smaller; do not promise parity.
- Dependency/build failures: root `tsconfig.base.json`, package `package.json`,
  `project.json`, `ng-package.json` (Angular), `vite.config.ts` (React), and `nx.json`.

## Dependencies and build conventions

The workspace uses pnpm, Nx 21.2.3, Angular 20, React 19, TypeScript 5.8, and
Storybook 8 (mixed patch/minor versions). These are repo declarations, not upgrade
recommendations. Check `package.json` and `pnpm-lock.yaml` before changing versions.

`tools/eslint/enforce-module-boundaries.json` defines `framework:*` and `type:*`
constraints. Shared packages may depend only on shared framework tags. Angular and
React packages may depend on their own framework and shared packages. Storybook
has explicit cross-framework allowances. Use package aliases for normal library
imports; Node-executed `.storybook/main.ts` deliberately uses relative imports for
the configuration helpers before aliases are registered.

Angular libraries build with `@nx/angular:package`. React libraries use Vite with
declaration generation and externalized dependencies. Shared libraries/themes use
SWC; themes run `build-css` first. Nx plugins infer build, test, typecheck, lint,
and documentation targets; not every project has all of them. Inspect resolved
targets rather than inferring them from a neighboring library.
