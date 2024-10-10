# @cocokits/angular-icon
The `@cocokits/angular-icon` package provides a powerful and flexible way to integrate SVG icons within your Angular applications. The core component in this package, SvgIconComponent, allows for dynamic SVG embedding, making it versatile for a wide range of design needs.

## Included Component:
This package includes the following component:
- `SvgIconComponent`


### SvgIconComponent
The SvgIconComponent offers a customizable and flexible way to embed SVG icons into your Angular applications. It supports multiple configurations for size and color, making it adaptable to any design system or layout.

#### Features:
- **Flexible Icon Sizing:** The size of the icons can be customized using the `IconSize` enum. If no size is specified, the icon will inherit styles from its parent, making it adaptable to various layouts and responsive designs.
- **Theme-Compatible Colors:** The icon's color can be set through the `BaseColor` enum or left unset, allowing the icon to inherit colors from the surrounding elements. This flexibility makes it easy to integrate with custom CSS or predefined design themes.
- **Theme Integration:** You can select SVG icons from your preferred theme, and the component ensures that the icon integrates seamlessly with the look and feel of your application.


## Styling and Theming
The components in this package do not come with any pre-defined styles. However, `@cocokits/angular-icon` applies CSS classes based on the provided configuration, which allows developers to style the icons with their own custom CSS or by using any predefined theming from CocoKits.

CocoKits also offers ready-made theming options, which can be easily applied, or you can build your own design system using standard CSS/SCSS.

## Documentation and Example
For detailed usage examples, configuration options, and additional documentation, please visit the following link:
- [SvgIconComponent](https://angular-docs.cocokits.com/?path=/docs/ui-components-svgicon--docs)