export enum BaseColor {
  /**
   * 'Default' varies across themes; in some themes, such as the 'coco-kits' theme, it is equivalent to 'HighContrast'.
   */
  Default = 'default',

  /**
   * 'Brand' is typically used to represent the primary brand color across all themes.
   */
  Brand = 'brand',

  /**
   * 'Info' generally signifies informational messages and is styled with a light blue or similar color.
   */
  Info = 'info',

  /**
   * 'Warning' usually represents caution and is styled with an orange or yellow color.
   */
  Warning = 'warning',

  /**
   * 'Error' is used for error messages and is often styled in red to draw attention.
   */
  Error = 'error',

  /**
   * In light theme it's usually black, and in dark theme, it's usually white.
   */
  HighContrast = 'high-contrast',

  /**
   * In both light and dark themes, it's usually a shade of gray.
   */
  MediumContrast = 'medium-contrast',

  /**
   * In light theme it's usually white, and in dark theme, it's usually black.
   */
  LowContrast = 'low-contrast',
}
