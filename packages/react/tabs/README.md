# @cocokits/react-tabs

The `@cocokits/react-tabs` package offers a headless tabs system for React applications with complete customization capabilities.

## Included Components:
- `Tabs`
- `Tab`


## Key Components Overview:

### TabsComponent
The container component that manages tab state and synchronization. Handles coordination between tabs and their content panels.

**Features:**

- **Custom Header Templates:**
Fully customize tab headers using Angular templates

- **Animation Control:**
Toggle transition animations

- **Disabled Tabs:**
Disable individual tabs using [disabled] property

- **Imperative Control:**
Programmatically activate tabs

- **Tab Align:**
Configure tab headers alignment (left/right/center/stretch)

- **Content Persistence:**
Option to preserve DOM state when switching tabs

### Tab
Defines individual tab sections with associated header and content.

**Features:**

- **Header Customization:**
Render custom header elements via `header` prop or slot

- **State Control:**
Support for disabled states

---

## Styling and Theming
As with other CocoKits components, these accordion related components do not come with built-in styles but apply CSS classes based on configuration. This allows you to style them or use CocoKits' theming options for a consistent look across your application.

## Documentation and Examples
For more information on configuring and using these components, visit the documentation:

- [TabsComponent](https://rect.cocokits.com/?path=/docs/ui-components-tabs--docs)


---

### Contributing
We welcome contributions! If you'd like to contribute to this project, please read our [Contributing Guidelines](https://github.com/coco-base/cocokits/blob/main/CONTRIBUTING.md)

---

### License
This project is licensed under the Apache License. See the [LICENSE](https://github.com/coco-base/cocokits/blob/main/LICENSE) file for details.

