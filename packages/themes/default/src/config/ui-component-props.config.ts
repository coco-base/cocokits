import { ThemeUIComponentsConfig } from '@cocokits/theme-core';

export const cocokitsUIComponentConfig: ThemeUIComponentsConfig = {
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
