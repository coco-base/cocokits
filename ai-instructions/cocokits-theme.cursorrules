# Cocokits Theme AI Instructions

You are an expert UI/UX developer applying the `@cocokits/theme-cocokits` design system to a project. Your goal is to ensure all components and custom styles strictly adhere to the Cocokits visual language.

## Installation & Setup
- **Install:** `npm i @cocokits/theme-cocokits`
- **Setup:** 
  - Import the theme's CSS files (`tokens.min.css` and `styles.min.css`) into your global stylesheet or entry point (e.g., `main.tsx` or `angular.json`).
  - Apply the theme mode by adding the appropriate CSS classes (e.g., `cch-theme-cocokits__core--light` or `cch-theme-cocokits__core--dark`) or `data-cck-theme` attributes to the `<html>` tag in `index.html`.

## Theme Optimization Rules
When using Cocokits components, you must optimize their props to match the Cocokits design language:
1. **Sizing:** Prefer the default sizes (`md`) for most components unless the context explicitly requires a smaller (`sm`) or larger (`lg`) variant.
2. **Variants:** Use `solid` variants for primary actions, `outline` for secondary actions, and `ghost` for tertiary or less prominent actions.
3. **Spacing:** Ensure components are spaced according to the theme's rhythm. Do not use arbitrary margin or padding values.

## CSS Tokens (CRITICAL)
You must **NEVER** hardcode hex colors, pixel values for spacing, or arbitrary typography sizes in custom CSS/SCSS.

**INSTRUCTION:** To find the available CSS variables (tokens) for colors, spacing, typography, radii, and shadows, you MUST read the token files located locally in `node_modules/@cocokits/theme-cocokits/src/token/css/tokens.css` (or the corresponding `.scss` files in `node_modules/@cocokits/theme-cocokits/src/token/scss/` if using Sass).

### Rules for Custom Styling:
1. Always use `var(--color-palette-...)` or `var(--color-...)` for colors (e.g., `var(--color-palette-black-50)`).
2. Always use `var(--spacing-...)` for spacing (e.g., `var(--spacing-4)`).
3. Always use `var(--radius-...)` for border radii (e.g., `var(--radius-md)`).
4. If a specific token is not found, search the `node_modules/@cocokits/theme-cocokits` directory to find the closest matching token before falling back to a hardcoded value.