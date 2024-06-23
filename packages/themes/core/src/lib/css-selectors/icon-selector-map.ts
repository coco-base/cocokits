import { CssSelectorComponentMap } from './css-selector.model';

export const iconSelectorsMap: CssSelectorComponentMap = {
  Size: {
    '.cck-icon__size--default': {
      selector: '.cck-icon__size--default',
      description:
        'This selector sets the default size for icons. It ensures that icons have consistent dimensions across various themes, maintaining visual uniformity.',
      renderCondition: 'Will be added to the component when the size parameter is set to `default` by the developer.',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--xs': {
      selector: '.cck-icon__size--xs',
      description:
        'This selector sets an extra small size for icons. It is ideal for use in compact interfaces where space is limited.',
      renderCondition: 'Will be added to the component when the size parameter is set to `xs` by the developer.',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--sm': {
      selector: '.cck-icon__size--sm',
      description:
        'This selector sets a small size for icons. It is commonly used for icons that are not the main focus but still need to be visible.',
      renderCondition: 'Will be added to the component when the size parameter is set to `sm` by the developer.',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--md': {
      selector: '.cck-icon__size--md',
      description:
        'This selector sets a medium size for icons, which is often the standard size across different devices.',
      renderCondition: 'Will be added to the component when the size parameter is set to `md` by the developer.',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--lg': {
      selector: '.cck-icon__size--lg',
      description:
        'This selector sets a large size for icons. It is ideal for making icons more visible or for emphasizing important features within the interface.',
      renderCondition: 'Will be added to the component when the size parameter is set to `lg` by the developer.',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--xl': {
      selector: '.cck-icon__size--xl',
      description:
        'This selector sets an extra large size for icons. It is suitable for key actions or areas where focus is needed within the UI.',
      renderCondition: 'Will be added to the component when the size parameter is set to `xl` by the developer.',
      properties: ['width', 'height'],
    },
    '.cck-icon__size--2xl': {
      selector: '.cck-icon__size--2xl',
      description:
        'This selector sets an extra-extra large size for icons. It is used in situations where icons must be very prominent.',
      renderCondition: 'Will be added to the component when the size parameter is set to `2xl` by the developer.',
      properties: ['width', 'height'],
    },
  },

  Color: {
    '.cck-icon__color--brand': {
      selector: '.cck-icon__color--brand',
      description:
        'This selector sets the brand color for icons. It ensures that icons adhere to the primary brand color defined in the theme, maintaining brand consistency.',
      renderCondition: 'Will be added to the component when the color parameter is set to `brand` by the developer.',
      properties: ['fill'],
    },
    '.cck-icon__color--info': {
      selector: '.cck-icon__color--info',
      description: 'This selector sets the informational color for icons, typically styled with a light blue color.',
      renderCondition: 'Will be added to the component when the color parameter is set to `info` by the developer.',
      properties: ['fill'],
    },
    '.cck-icon__color--warning': {
      selector: '.cck-icon__color--warning',
      description: 'This selector sets the warning color for icons, usually styled with an orange or yellow color.',
      renderCondition: 'Will be added to the component when the color parameter is set to `warning` by the developer.',
      properties: ['fill'],
    },
    '.cck-icon__color--error': {
      selector: '.cck-icon__color--error',
      description: 'This selector sets the error color for icons, often styled in red.',
      renderCondition: 'Will be added to the component when the color parameter is set to `error` by the developer.',
      properties: ['fill'],
    },
    '.cck-icon__color--h-contrast': {
      selector: '.cck-icon__color--h-contrast',
      description:
        'This selector sets a high contrast color for icons, ensuring readability and visibility in various themes.',
      renderCondition:
        'Will be added to the component when the color parameter is set to `high-contrast` by the developer.',
      properties: ['fill'],
    },
    '.cck-icon__color--m-contrast': {
      selector: '.cck-icon__color--m-contrast',
      description: 'This selector sets a medium contrast color for icons, usually a shade of gray.',
      renderCondition:
        'Will be added to the component when the color parameter is set to `medium-contrast` by the developer.',
      properties: ['fill'],
    },
    '.cck-icon__color--l-contrast': {
      selector: '.cck-icon__color--l-contrast',
      description:
        'This selector sets a low contrast color for icons, typically white in light themes and black in dark themes.',
      renderCondition:
        'Will be added to the component when the color parameter is set to `low-contrast` by the developer.',
      properties: ['fill'],
    },
    '.cck-icon__color--default': {
      selector: '.cck-icon__color--default',
      description: 'This selector sets the default color for icons, defined by each theme.',
      renderCondition: 'Will be added to the component when the color parameter is set to `default` by the developer.',
      properties: ['fill'],
    },
  },
};
