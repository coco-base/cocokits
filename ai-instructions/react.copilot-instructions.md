# Cocokits React AI Instructions

You are an expert React developer using the `@cocokits/react-components` library. Your goal is to write clean, performant, and accessible React code using these components.

## Installation & Setup
- **Install:** `npm i @cocokits/react-components`
- **Setup:** Wrap your root component with `<ThemeConfigContext.Provider value={themeConfig}>` in `App.tsx` or `main.tsx`.

## Component Documentation & Usage
Below is a summary of the available components in `@cocokits/react-components`. 

**CRITICAL INSTRUCTION:** For exact prop names, types, and detailed JSDoc comments, you MUST read the TypeScript definition files located locally in `node_modules/@cocokits/react-components/**/*.d.ts`. Do not guess the API.

### Available Components:
- **Accordion / AccordionHeader / AccordionPanel:** Use for collapsible content panels to save vertical space.
- **Avatar / AvatarGroup / AvatarLabel:** Use to display user profile images, initials, or fallback icons.
- **Badge / BadgeContainer:** Use for status indicators, notification counts, or small labels attached to other elements.
- **Button / IconButton:** Use for primary, secondary, and tertiary actions. Supports various variants (solid, outline, ghost) and sizes.
- **Checkbox:** Use for boolean selections or multi-select lists.
- **Chip / ChipList:** Use for compact elements that represent an input, attribute, or action.
- **Divider:** Use to visually separate content or groups of elements.
- **FormField / Input / Textarea / Label / Error / Hint / Prefix / Suffix:** Use as a wrapper for input elements to provide consistent labeling, helper text, and error message styling.
- **Icon / SvgIcon:** Use to render SVG icons consistently across the application.
- **Menu / MenuItem:** Use for dropdown lists of actions or navigation links, typically triggered by a button.
- **Option / OptionGroup:** Use within select or autocomplete components to represent selectable items.
- **Overlay:** Use as a foundational component for building modals, popovers, tooltips, and dialogs.
- **Radio / RadioButton / RadioGroup:** Use for single selection from a mutually exclusive list of options.
- **Select / SelectPreview:** Use for dropdown selection menus.
- **Table:** Use for displaying structured tabular data with support for sorting, pagination, and filtering.
- **Tabs / Tab:** Use for navigating between different views or content sections within the same page context.
- **Toggle:** Use for switch inputs that immediately toggle a state on or off.
- **Trailing / Leading:** Use for adding elements to the start or end of other components (like list items or inputs).

## General Rules
1. Always use functional components and React Hooks.
2. Use controlled components for form inputs (`Checkbox`, `Radio`, `Toggle`, `FormField`) unless uncontrolled is explicitly requested.
3. Ensure accessibility (a11y) by providing appropriate `aria-` attributes if the component does not handle it automatically.
4. When asked to implement a feature, first check if a Cocokits component can fulfill the requirement before building a custom one.