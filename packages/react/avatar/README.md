# @cocokits/react-avatar
The `@cocokits/react-avatar` package provides flexible avatar components for React applications with design system theming support. These components are built to be customizable and work seamlessly across different design systems.

This package includes the following components:
- `Avatar`
- `AvatarLabel`
- `AvatarGroup`

---

### Avatar
A visual representation of users that supports images, initials, and advanced templating for complete rendering control.

#### Features:
- **Multiple Display Options:** Render profile images or fallback initials
- **Advanced Templating:** Full control over content with support for <picture> elements
- **Interactive:** onClick handler with visual states
- **Design System Ready:** Size and color theming support
- **State Handling:** Built-in loading and fallback states

---

### AvatarLabel
Combines an avatar with text labels in configurable layouts for user identification.

#### Features:
- **Position Control:** Avatar placement on left, right, top, or bottom
- **Text Alignment:** Horizontal or vertical layout options
- **Independent Interaction:** Separate click handler for the avatar

---

### AvatarGroup
Displays clustered avatars with smart overflow handling for space-constrained interfaces.

#### Features:
- **Stack Direction:** Left or right overlap orientation
- **Custom Spacing:** Control overlap gap (in pixels)
- **Max Count:** Automatic "+X" counter for overflow

---

### Styling and Theming
The components in this package do not include any built-in styles. However, `@cocokits/react-avatar` adds CSS classes to the elements based on the provided configuration. You can style the components yourself or apply a theme from CocoKits.

`CocoKits` provides ready-made theming options, or you can create a custom design using your CSS or SCSS styles.

---

### Documentation and Example
For detailed usage examples, configuration options, and additional documentation, visit the following links:

- [AvatarComponent](https://react.cocokits.com/?path=/docs/ui-components-avatar--docs)
- [AvatarLabelComponent](https://react.cocokits.com/?path=/docs/ui-components-avatar-label--docs)
- [AvatarGroupComponent](https://react.cocokits.com/?path=/docs/ui-components-avatar-group--docs)

---
### Contributing
We welcome contributions! If you'd like to contribute to this project, please read our [Contributing Guidelines](https://github.com/coco-base/cocokits/blob/main/CONTRIBUTING.md)


---

### License
This project is licensed under the Apache License. See the [LICENSE](https://github.com/coco-base/cocokits/blob/main/LICENSE) file for details.