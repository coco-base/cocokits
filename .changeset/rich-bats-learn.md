---
'@cocokits/theme-frames-x': minor
---

**Breaking Change:**
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