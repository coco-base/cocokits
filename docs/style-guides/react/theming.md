# Theming in React

Shared rules: [theme-layer-per-framework](../themes/theme-layer-per-framework.md). Contract: [architecture](../../architecture.md) section 4.

- The runtime lives in `@cocokits/react-core`; parts get their `data-*` attributes from it, spread before `className`.
- A component calls `useThemeAttrs(anatomy)` and spreads the record of each part it renders ([architecture §10](../../architecture.md#10-simplicity-and-reuse), item 7).
- Wrappers are hand-written in `packages/themes/<name>/react/`, and the runtime's result without a theme is in [architecture §4](../../architecture.md#4-theme-configuration-size-variant-color-theme-only-options).

Example (illustrative; the provider name is a placeholder; use the runtime API of the theme package):

```tsx
export function Switch({ size, color, children, ...props }: SwitchProps) {
  return (
    <ThemeOptionsProvider componentName="switch" options={{ size, color }}>
      <Base.Root {...props}>{children ?? <Base.Thumb />}</Base.Root>
    </ThemeOptionsProvider>
  );
}
```

Portaled overlay content keeps the theme scope ([overlays.md](./overlays.md)).
