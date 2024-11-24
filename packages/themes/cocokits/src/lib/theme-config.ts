/* eslint-disable max-lines */
import { ThemeComponentConfigRecord, ThemeConfig } from '@cocokits/core';

const components: ThemeComponentConfigRecord = {
  toggle: {
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error', 'h-contrast'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  menuItem: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    color: {
      name: 'color',
      values: ['default', 'error'],
      default: 'default',
      description: '',
    },
  },
  divider: {
    type: {
      name: 'type',
      values: ['horizontal', 'vertical'],
      default: 'horizontal',
      description: '',
    },
    size: {
      name: 'size',
      values: ['md', 'lg'],
      default: 'md',
      description: '',
    },
    color: {
      name: 'color',
      values: ['light', 'default', 'dark'],
      default: 'default',
      description: '',
    },
  },
  chipList: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  chip: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    templates: {
      chipRemoveIcon: {
        name: 'chipRemoveIcon',
        content:
          '<path d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z" fill="currentColor"/>',
        viewBox: '0 0 24 24',
      },
    },
  },
  optionGroup: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  option: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    templates: {
      optionSelectedIcon: {
        name: 'optionSelectedIcon',
        content:
          '<path d="M8.89739 16.0237L19.3077 5.54269C19.6947 5.15247 20.3222 5.15246 20.7094 5.54253C21.0967 5.93278 21.0969 6.56588 20.7098 6.95627L9.60697 18.1355C9.21588 18.5293 8.57892 18.5293 8.18786 18.1355L3.29027 13.1964C2.90324 12.8061 2.90324 12.1735 3.29027 11.7832C3.67729 11.393 4.30478 11.393 4.6918 11.7832L8.89739 16.0237Z"/>',
        viewBox: '0 0 24 24',
      },
    },
  },
  select: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    templates: {
      dropdownIcon: {
        name: 'dropdownIcon',
        content:
          '<path d="M12.6,15.7c-0.4,0.4-0.9,0.4-1.3,0L5.3,9.6c-0.4-0.4-0.4-0.9,0-1.3C5.6,8,6.2,8,6.6,8.3l5.4,5.4l5.4-5.4 c0.4-0.4,0.9-0.4,1.3,0c0.4,0.4,0.4,0.9,0,1.3L12.6,15.7z" fill="#52525B"/>',
        viewBox: '0 0 24 24',
      },
    },
  },
  trailing: {
    type: {
      name: 'type',
      values: ['regular', 'medium'],
      default: 'medium',
      description: '',
    },
    color: {
      name: 'color',
      values: ['transparent', 'grey'],
      default: 'transparent',
      description: '',
    },
  },
  leading: {
    type: {
      name: 'type',
      values: ['regular', 'medium'],
      default: 'medium',
      description: '',
    },
    color: {
      name: 'color',
      values: ['transparent', 'grey'],
      default: 'transparent',
      description: '',
    },
  },
  formField: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  radioGroup: {
    type: {
      name: 'type',
      values: ['column', 'row'],
      default: 'column',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  radioButton: {
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    templates: {
      radioCheckmark: `
        <div class="cck-radio-button__background--outer-circle"></div>
        <div class="cck-radio-button__background--inner-circle"></div>
      `,
    },
  },
  checkbox: {
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    templates: {
      checkboxCheckmark: `
        <svg class="cck-checkbox__checkmark" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" class="cck-checkbox__checkmark-path"></path>
        </svg>
        <div class="cck-checkbox__mixedmark"></div>
      `,
    },
  },
  iconButton: {
    type: {
      name: 'type',
      values: ['primary', 'outline', 'basic', 'light'],
      default: 'primary',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error', 'h-contrast'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    additional: {
      rounded: {
        name: 'rounded',
        values: [true, false],
        default: false,
        description: 'Specifies whether the button should have rounded corners, giving it a circular appearance.',
      },
    },
  },
  button: {
    type: {
      name: 'type',
      values: ['primary', 'outline', 'basic', 'light'],
      default: 'primary',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error', 'h-contrast'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  svgIcon: {
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error', 'h-contrast', 'm-contrast'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      default: 'md',
      description: '',
    },
  },

  menu: {},
  selectPreview: {},
  textarea: {},
  input: {},
  label: {},
  error: {},
  hint: {},
  prefix: {},
  suffix: {},
};

export const cocokitsThemeConfig: ThemeConfig = {
  components,
  cssSelectorPrefix: '',
};
