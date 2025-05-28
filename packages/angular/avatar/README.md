# @cocokits/angular-avatar
The `@cocokits/angular-avatar` package provides essential UI components for user representation in Angular applications. The components included in this package are designed to be flexible, customizable, and easy to integrate into various design systems.

This package includes the following components:
- `AvatarComponent`
- `AvatarLabelComponent`
- `AvatarGroupComponent`

---

### AvatarComponent
A visual representation of users that displays profile images, name initials, or custom content through templates. This component handles common user representation scenarios while providing full control for advanced cases.

#### Features:
- **Multiple Display Modes:** Show profile images or fallback initials
- **Advanced Templates:** Customize content with templates for complex scenarios like using <picture> elements
- **Interactive Elements:** Supports click actions with visual feedback
- **Design System Ready:** Adapts to theme-specific sizing and colors
- **State Handling:** Built-in support for loading and fallback images

---

### AvatarLabelComponent
Combines an avatar with descriptive text in flexible layouts, ideal for user directories where names and titles need clear association with profile pictures.

#### Features:
Flexible Positioning: Place avatar left, right, top, or bottom of text

- **Text Alignment:** Choose between horizontal or vertical layouts
- **Modular Interaction:** Separate click handler for the avatar element
- **Space Optimization:** Automatically adjusts spacing based on position

---

### AvatarGroupComponent
Efficiently displays groups of overlapping avatars with smart overflow management, perfect for showing teams or collaborators while conserving space.

#### Features:
- **Direction Control:** Configure left or right overlap direction
- **Customizable Spacing:** Adjust gap between avatars (in pixels)
- **Overflow Handling:** Automatic "+X" counter when exceeding maximum count

---

### Styling and Theming
The components in this package do not include any built-in styles. However, `@cocokits/angular-avatar` adds CSS classes to the elements based on the provided configuration. You can style the components yourself or apply a theme from CocoKits.

`CocoKits` provides ready-made theming options, or you can create a custom design using your CSS or SCSS styles.

---

### Documentation and Example
For detailed usage examples, configuration options, and additional documentation, visit the following links:

- [AvatarComponent](https://angular.cocokits.com/?path=/docs/ui-components-avatar--docs)
- [AvatarLabelComponent](https://angular.cocokits.com/?path=/docs/ui-components-avatar-label--docs)
- [AvatarGroupComponent](https://angular.cocokits.com/?path=/docs/ui-components-avatar-group--docs)

---
### Contributing
We welcome contributions! If you'd like to contribute to this project, please read our [Contributing Guidelines](https://github.com/coco-base/cocokits/blob/main/CONTRIBUTING.md)


---

### License
This project is licensed under the Apache License. See the [LICENSE](https://github.com/coco-base/cocokits/blob/main/LICENSE) file for details.