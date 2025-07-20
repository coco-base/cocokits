# @cocokits/angular-badge
The `@cocokits/angular-badge` package provides essential UI components for displaying notifications, counts, and status indicators in Angular applications. The components included in this package are designed to be flexible, customizable, and easy to integrate into various design systems.

This package includes the following components:
- `BadgeComponent`
- `BadgeContainerComponent`

---

### BadgeComponent
Displays numeric/text notifications or status dots. Handles content truncation, zero-state behavior, and conditional visibility. This component is ideal for notification counters, status indicators, and other visual cues.

#### Features:
- **Content Truncation:** Converts numbers above limit to {max}+ (e.g., 100 → 99+)
- **Zero-State Handling:** Automatically renders dot when value is 0, null, or undefined
- **Conditional Visibility:** Completely hides badge when true (overrides content)
- **Layout Independence:** Badge positioning doesn't affect the layout of other elements
- **Design System Ready:** Adapts to theme-specific sizing and colors

---

### BadgeContainerComponent
Manages badge placement relative to target elements. Provides precise offset control without affecting layout. This component is perfect for positioning badges on buttons, icons, or other UI elements.

#### Features:
- **Position Presets:** Positions badge at corners: top-left, top-right, bottom-left, bottom-right
- **Pixel-Perfect Placement:** Adjusts position with [x,y] pixel values (supports negative offsets)
- **Flexible Integration:** Works with any content element that needs badge indicators

---

### Styling and Theming
The components in this package do not include any built-in styles. However, `@cocokits/angular-badge` adds CSS classes to the elements based on the provided configuration. You can style the components yourself or apply a theme from `CocoKits`.

`CocoKits` provides ready-made theming options, or you can create a custom design using your CSS or SCSS styles.

---

### Documentation and Example
For detailed usage examples, configuration options, and additional documentation, visit the following links
- [BadgeComponent](https://angular.cocokits.com/?path=/docs/ui-components-badge--docs)
- [BadgeContainerComponent](https://angular.cocokits.com/?path=/docs/ui-components-badge-container--docs)

---

### Contributing
We welcome contributions! If you'd like to contribute to this project, please read our [Contributing Guidelines](https://github.com/coco-base/cocokits/blob/main/CONTRIBUTING.md)

---
