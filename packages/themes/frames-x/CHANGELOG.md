# @cocokits/theme-frames-x

## 1.1.0

### Minor Changes

- 51ad4f2: **Breaking Change:**

  - Icon size has changed:

    - `xxs` -> `xs`
    - `xs` -> `sm`
    - `sm` -> `md`
    - `md` -> `lg`
    - `lg` -> `xl`
    - `xl` -> `2xl`
    - `2xl` -> `3xl`
    - `3xl` -> `4xl`

  - Changed `svgIcon` size from:

    - `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
    - to:
    - `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`

  - Default icon size is now `lg` instead of `md`

  **Fix:**

  - Updated SCSS files to replace deprecated `@import` with modern `@use` and `@forward` directives for better modularity and maintainability.

### Patch Changes

- Updated dependencies [14e142b]
  - @cocokits/core@1.1.0

## 1.0.2

### Patch Changes

- fix default export path of themes from `package.json`
- Updated dependencies
  - @cocokits/core@1.0.2

## 1.0.1

### Patch Changes

- update package exports for proper type definitions and paths
- Updated dependencies
  - @cocokits/core@1.0.1

## 1.0.0

### Major Changes

- 8e9793b: First Release 🔥

### Patch Changes

- Updated dependencies [8e9793b]
  - @cocokits/core@1.0.0
