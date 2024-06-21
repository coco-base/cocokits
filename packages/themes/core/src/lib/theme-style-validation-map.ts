/**
 * List of all available css classes with require styles, that each them must/can be defined
 */

export type CssSelector = string;
export type ThemeStyleValidationGroup = string; // For example: Overlay, Button
export interface ThemeStyleValidation {
  optional: boolean;
  description: string;

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
      description: 'TODO: ...',
      properties: [['background-color', 'background']],
    },
    '.cck-overlay__content': {
      optional: false,
      description: 'TODO: ...',
      properties: [['background-color', 'background']],
    },
  },

  icon: {
    '.cck-icon__size--default': {
      optional: false,
      description: 'TODO: ...',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--xs': {
      optional: false,
      description: 'TODO: ...',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--sm': {
      optional: false,
      description: 'TODO: ...',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--md': {
      optional: false,
      description: 'TODO: ...',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--lg': {
      optional: false,
      description: 'TODO: ...',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--xl': {
      optional: false,
      description: 'TODO: ...',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--2xl': {
      optional: false,
      description: 'TODO: ...',
      properties: ['width', 'height'],
    },

    '.cck-icon__color--brand': {
      optional: false,
      description: 'TODO: ...',
      properties: ['fill'],
    },
    '.cck-icon__color--info': {
      optional: false,
      description: 'TODO: ...',
      properties: ['fill'],
    },
    '.cck-icon__color--warning': {
      optional: false,
      description: 'TODO: ...',
      properties: ['fill'],
    },
    '.cck-icon__color--error': {
      optional: false,
      description: 'TODO: ...',
      properties: ['fill'],
    },
    '.cck-icon__color--h-contrast': {
      optional: false,
      description: 'TODO: ...',
      properties: ['fill'],
    },
    '.cck-icon__color--m-contrast': {
      optional: false,
      description: 'TODO: ...',
      properties: ['fill'],
    },
    '.cck-icon__color--l-contrast': {
      optional: false,
      description: 'TODO: ...',
      properties: ['fill'],
    },
    '.cck-icon__color--default': {
      optional: false,
      description: 'TODO: ...',
      properties: ['fill'],
    },
  },
};
