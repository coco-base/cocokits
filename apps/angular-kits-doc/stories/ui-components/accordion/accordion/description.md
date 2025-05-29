The core wrapper that manages the state and structure of all panels. It handles global behavior such as single/multiple expansion, nesting, accessibility, and keyboard control.

**Features:**
- **Custom Icon Template:**
Allow developers to define a custom template for the expand/collapse icon, supporting branding or UI consistency.

- **Lazy Loading:**
Load panel content only when expanded for better performance, and destroy it again when collapsed to free resources.

- **Expansion Mode:**
Support both single and multiple expanded panels simultaneously, configurable via input.

- **Icon Position:**
Provide option to render the expand/collapse icon on either the left or right side of the header.

- **Custom Header:**
Support default text headers or fully custom templates for complete flexibility in UI design.

- **Toggle Animation:**
Option to enable or disable transition animation for smoother or snappier UX.

- **Disabled Panel:**
Disable specific panels to prevent user interaction and indicate non-interactive state.

- **Dynamic Control:**
Expose imperative methods to programmatically expand or collapse individual panels or groups.

- **Expand/Collapse All:**
Allow batch toggle actions to expand or collapse all panels at once, useful in dashboards or summaries.

- **Nested Support:**
Support placing accordions inside accordion content, enabling complex hierarchical layouts.

- **Custom Logic Guard:**
Before collapsing a panel, allow showing a confirmation dialog or running async logic to approve the action.