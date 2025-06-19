# @cocokits/angular-accordion

The `@cocokits/angular-accordion` package provides a powerful and flexible accordion component for Angular applications. Built with customization, performance, and accessibility in mind, it supports advanced UI scenarios through lazy loading, nested panels, and custom interaction logic.

## Included Components:
- `AccordionComponent`
- `AccordionPanelComponent`
- `AccordionHeaderComponent`
- `AccordionHeaderIconDirective`


## Key Components Overview: 

### AccordionComponent
The core wrapper component that manages the accordion structure. It handles state control, panel registration, keyboard accessibility, and global behaviors such as animation and expand/collapse all.

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


### AccordionPanelComponent

Defines an individual collapsible section inside the accordion. Works as a direct child of AccordionComponent, managing local state and enabling features like disabling and dynamic expansion.


### AccordionHeaderComponent

Renders the clickable trigger area of a panel. Allows full template customization while preserving accessibility and keyboard support.

### AccordionHeaderIconDirective

Angular structural directive (ng-template) that allows replacing the default header icon with custom visuals or animations.


---

## Styling and Theming
As with other CocoKits components, these accordion related components do not come with built-in styles but apply CSS classes based on configuration. This allows you to style them or use CocoKits' theming options for a consistent look across your application.

## Documentation and Examples
For more information on configuring and using these components, visit the documentation:

- [AccordionComponent](https://angular.cocokits.com/?path=/docs/ui-components-accordion--docs)


---

### Contributing
We welcome contributions! If you'd like to contribute to this project, please read our [Contributing Guidelines](https://github.com/coco-base/cocokits/blob/main/CONTRIBUTING.md)

---

### License
This project is licensed under the Apache License. See the [LICENSE](https://github.com/coco-base/cocokits/blob/main/LICENSE) file for details.

