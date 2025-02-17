# @cocokits/react-overlay
The `@cocokits/react-overlay` package is part of CDK and offers a robust set of utilities and components designed to manage floating UI elements within your React applications. With the help of this overlay system, you can build flexible and dynamic UI elements such as modals, tooltips, popups, and dropdowns, enhancing the overall user experience with non-intrusive, context-sensitive content.

This package includes the following:

- `OverlayPortal`
- `OverlayStandaloneService`

### OverlayPortal
The `OverlayPortal` allows you to open an overlay rendered as a React portal. It is perfect for creating temporary UI elements such as modals, popups, or dropdowns that require a dynamic positioning relative to the viewport or trigger element.

#### Features:
- **Dynamic Positioning:** Automatically positions overlays in an optimal spot in the viewport.
- **Dismissable Interactions:** Easily closes the overlay when clicking outside or pressing escape.
- **Backdrop Support:** Optionally includes a backdrop to dim the main content and focus user attention on the overlay.

### OverlayStandaloneService
The `OverlayStandaloneService` enables you to open an overlay as a standalone component without any external dependencies, offering a lightweight alternative for cases when you need a quick overlay solution.

#### Features:
- **Independence:** Launch overlays without tying to any specific component hierarchy.
- **Flexibility:** Provides full control over the overlay lifecycle and behavior.
- **Lightweight Integration:** Minimal setup and dependency management.


## Documentation and Example
For detailed usage examples, configuration options, and further documentation, visit:
- [Overlay](https://react.cocokits.com/?path=/docs/cdk-overlay--docs)
---

### Contributing
We welcome contributions! For details, please see our [Contributing Guidelines](https://github.com/coco-base/cocokits/blob/main/CONTRIBUTING.md).

---

### License
This project is licensed under the Apache License. See the [LICENSE](https://github.com/coco-base/cocokits/blob/main/LICENSE) file for details.
