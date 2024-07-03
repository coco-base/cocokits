import { ThemeUIComponentsConfig } from '@cocokits/theme-core';

export const cocokitsUIComponentConfig: ThemeUIComponentsConfig = {
  button: {
    type: {
      name: 'type',
      values: ['primary', 'secondary', 'outline'],
      require: true,
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
      values: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
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
