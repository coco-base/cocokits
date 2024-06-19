/**
 * List of all available css classes with require styles, that each them must/can be defined
 */

export type CssSelector = string;
export type ThemeStyleValidationGroup = string; // For example: Overlay, Button
export interface ThemeStyleValidation {
  optional: boolean;

  /**
   * string: this property must exist.
   * string[]: at list one of the properties must exist.
   * @example:
   * [
   *   ['background-color', 'background'],
   *   'color',
   * ]
   */
  properties: (string[] | string)[];
}
export type ThemeStyleValidationMap = Record<ThemeStyleValidationGroup, Record<CssSelector, ThemeStyleValidation>>;

export const themeStyleValidationMap: ThemeStyleValidationMap = {
  overlay: {
    '.cck-overlay__backdrop': {
      optional: false,
      properties: [['background-color', 'background']],
    },
    '.cck-overlay__content': {
      optional: false,
      properties: [['background-color', 'background']],
    },
  },
};
