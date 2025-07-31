Displays numeric/text notifications or status dots. Handles content truncation, zero-state behavior, and conditional visibility. This component is ideal for notification counters, status indicators, and other visual cues.

#### Features:
- **Content Truncation:** Converts numbers above limit to {max}+ (e.g., 100 → 99+)
- **Zero-State Handling:** Automatically renders dot when value is 0, null, or undefined
- **Conditional Visibility:** Completely hides badge when true (overrides content)
- **Layout Independence:** Badge positioning doesn't affect the layout of other elements
- **Design System Ready:** Adapts to theme-specific sizing and colors