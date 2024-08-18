import { ThemeUIComponentsConfig } from '@cocokits/core';

export const cocokitsUIComponentConfig: ThemeUIComponentsConfig = {
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
