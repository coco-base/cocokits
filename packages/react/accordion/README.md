# @cocokits/react-accordion

The `@cocokits/react-accordion` package provides a modular accordion system for React applications. Designed with flexibility and performance in mind, it supports lazy rendering, nested structures, and complete customization over headers, icons, and interactivity.

## Included Components:

- `Accordion`
- `AccordionPanel`
- `AccordionHeader`


### Accordion

The core wrapper that manages the state and structure of all panels. It handles global behavior such as single/multiple expansion, nesting, accessibility, and keyboard control.

**Features:**
- **Custom Icon Template:**
Allow developers to define a custom template for the expand/collapse icon, supporting branding or UI consistency.

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

### AccordionPanel

A collapsible section inside an accordion. Each panel works independently but syncs with the parent for state tracking and expansion logic.

### AccordionHeader

Acts as the toggle button for the panel. It can be styled or fully replaced using custom children, enabling full flexibility in the header’s layout and content.

### AccordionHeaderIcon

In React, the icon is injected via a headerIcon prop or slot. It enables you to fully control the visuals for expand/collapse behavior.

---

## Styling and Theming
As with other CocoKits components, these accordion related components do not come with built-in styles but apply CSS classes based on configuration. This allows you to style them or use CocoKits' theming options for a consistent look across your application.

## Documentation and Examples
For more information on configuring and using these components, visit the documentation:

- [AccordionComponent](https://react.cocokits.com/?path=/docs/ui-components-accordion--docs)


---

### Contributing
We welcome contributions! If you'd like to contribute to this project, please read our [Contributing Guidelines](https://github.com/coco-base/cocokits/blob/main/CONTRIBUTING.md)

---

### License
This project is licensed under the Apache License. See the [LICENSE](https://github.com/coco-base/cocokits/blob/main/LICENSE) file for details.