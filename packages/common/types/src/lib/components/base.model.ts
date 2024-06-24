export enum BaseColor {
  /**
   * The default color defined by each theme as the base for other colors.
   * In some themes, such as the 'cocokits' theme, it is equivalent to 'HighContrast'.
   * For more info, check the documentation of your theme.
   */
  Default = 'default',

  /**
   * 'Brand' is typically used to represent the primary brand color across all themes.
   * This color is crucial for maintaining brand identity.
   */
  Brand = 'brand',

  /**
   * 'Info' generally signifies informational messages and is styled with a light blue or similar color.
   * It helps to draw attention to informational content without being too aggressive.
   */
  Info = 'info',

  /**
   * 'Warning' usually represents caution and is styled with an orange or yellow color.
   * This color is used to alert users about potential issues or important notices.
   */
  Warning = 'warning',

  /**
   * 'Error' is used for error messages and is often styled in red to draw attention.
   * It indicates critical issues that need immediate attention.
   */
  Error = 'error',

  /**
   * In light theme, it is usually black, and in dark theme, it is usually white.
   * This high contrast color is used to ensure readability and visibility in various themes.
   */
  HighContrast = 'high-contrast',

  /**
   * In both light and dark themes, it is usually a shade of gray.
   * This color provides a balanced contrast that is not too stark.
   */
  MediumContrast = 'medium-contrast',

  /**
   * In light theme, it is usually white, and in dark theme, it is usually black.
   * Low contrast colors are used for less prominent elements that still need to be visible.
   */
  LowContrast = 'low-contrast',
}
