import { ThemeUIComponentsConfig } from '@cocokits/core';

export const cocokitsUIComponentConfig: ThemeUIComponentsConfig = {
  selectPreview: { type: null, size: null, color: null },
  optionGroup: {
    type: null,
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
    color: null,
  },
  option: {
    type: null,
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
    color: null,
    component: {
      optionSelectedIcon: {
        name: 'optionSelectedIcon',
        content:
          '<path d="M8.89739 16.0237L19.3077 5.54269C19.6947 5.15247 20.3222 5.15246 20.7094 5.54253C21.0967 5.93278 21.0969 6.56588 20.7098 6.95627L9.60697 18.1355C9.21588 18.5293 8.57892 18.5293 8.18786 18.1355L3.29027 13.1964C2.90324 12.8061 2.90324 12.1735 3.29027 11.7832C3.67729 11.393 4.30478 11.393 4.6918 11.7832L8.89739 16.0237Z"/>',
        viewBox: '0 0 24 24',
      },
    },
  },
  select: {
    type: null,
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
    color: null,
    component: {
      dropdownIcon: {
        name: 'dropdownIcon',
        content:
          '<path d="M12.6,15.7c-0.4,0.4-0.9,0.4-1.3,0L5.3,9.6c-0.4-0.4-0.4-0.9,0-1.3C5.6,8,6.2,8,6.6,8.3l5.4,5.4l5.4-5.4 c0.4-0.4,0.9-0.4,1.3,0c0.4,0.4,0.4,0.9,0,1.3L12.6,15.7z" fill="#52525B"/>',
        viewBox: '0 0 24 24',
      },
    },
  },
  textarea: { type: null, size: null, color: null },
  input: { type: null, size: null, color: null },
  label: { type: null, size: null, color: null },
  error: { type: null, size: null, color: null },
  hint: { type: null, size: null, color: null },
  prefix: { type: null, size: null, color: null },
  suffix: { type: null, size: null, color: null },
  trailing: {
    type: {
      name: 'type',
      values: ['regular', 'medium'],
      require: false,
      default: 'medium',
      description: '',
    },
    size: null,
    color: {
      name: 'color',
      values: ['transparent', 'grey'],
      require: false,
      default: 'transparent',
      description: '',
    },
  },
  leading: {
    type: {
      name: 'type',
      values: ['regular', 'medium'],
      require: false,
      default: 'medium',
      description: '',
    },
    size: null,
    color: {
      name: 'color',
      values: ['transparent', 'grey'],
      require: false,
      default: 'transparent',
      description: '',
    },
  },
  formField: {
    type: null,
    color: null,
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
  },
  radioGroup: {
    type: {
      name: 'type',
      values: ['column', 'row'],
      require: false,
      default: 'column',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error'],
      require: false,
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
  },
  radioButton: {
    type: null,
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error'],
      require: false,
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
    component: {
      radioCheckmark: `
        <div class="cck-checkbox__background--outer-circle"></div>
        <div class="cck-checkbox__background--inner-circle"></div>
      `,
    },
  },
  checkbox: {
    type: null,
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error'],
      require: false,
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
    component: {
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
      require: false,
      default: 'primary',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error', 'h-contrast', 'm-contrast', 'l-contrast'],
      require: false,
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
    additional: {
      rounded: {
        name: 'rounded',
        values: [true, false],
        require: false,
        default: false,
        description: 'TODO: ....',
      },
    },
  },
  button: {
    type: {
      name: 'type',
      values: ['primary', 'outline', 'basic', 'light'],
      require: false,
      default: 'primary',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error', 'h-contrast', 'm-contrast', 'l-contrast'],
      require: false,
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
  },
  svgIcon: {
    type: null,
    color: {
      name: 'color',
      values: ['brand', 'info', 'warning', 'error', 'h-contrast', 'm-contrast', 'l-contrast'],
      require: false,
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      require: false,
      default: 'md',
      description: '',
    },
  },
};
