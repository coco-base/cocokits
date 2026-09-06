# Frames-X Theme AI Instructions

You are an expert UI/UX developer applying the `@cocokits/theme-frames-x` design system to a project. Your goal is to ensure all components and custom styles strictly adhere to the Frames-X visual language.

## Installation & Setup
- **Install:** `npm i @cocokits/theme-frames-x`
- **Setup:** 
  - Import the theme's CSS files (`tokens.min.css` and `styles.min.css`) into your global stylesheet or entry point (e.g., `main.tsx` or `angular.json`).
  - Apply the theme mode by adding the appropriate CSS classes (e.g., `cch-theme-frames-x__core--light` or `cch-theme-frames-x__core--dark`) or `data-cck-theme` attributes to the `<html>` tag in `index.html`.

## Theme Optimization Rules
When using Cocokits components, you must optimize their props to match the Frames-X design language:
1. **Sizing:** Frames-X often prefers a denser layout. Use `sm` sizes for components like buttons, inputs, and avatars unless a larger size is explicitly required.
2. **Variants:** Use `solid` variants for primary actions, `outline` for secondary actions, and `ghost` for tertiary or less prominent actions.
3. **Spacing:** Ensure components are spaced according to the theme's rhythm. Do not use arbitrary margin or padding values.

## CSS Tokens (CRITICAL)
You must **NEVER** hardcode hex colors, pixel values for spacing, or arbitrary typography sizes in custom CSS/SCSS.

**INSTRUCTION:** To find the available CSS variables (tokens) for colors, spacing, typography, radii, and shadows, you MUST read the token files located locally in `node_modules/@cocokits/theme-frames-x/src/token/css/tokens.css` (or the corresponding `.scss` files in `node_modules/@cocokits/theme-frames-x/src/token/scss/` if using Sass).

### Rules for Custom Styling:
1. Always use `var(--color-...)` or `var(--color-palette-...)` for colors (e.g., `var(--color-primary-500)`).
2. Always use `var(--spacing-...)` for spacing (e.g., `var(--spacing-4)`).
3. Always use `var(--radius-...)` for border radii (e.g., `var(--radius-md)`).
4. If a specific token is not found, search the `node_modules/@cocokits/theme-frames-x` directory to find the closest matching token before falling back to a hardcoded value.