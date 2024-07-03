import { ThemeUIComponentsConfig } from '@cocokits/theme-core';

export const frameXUIComponentConfig: ThemeUIComponentsConfig = {
  button: {
    type: {
      name: 'type',
      values: [],
      require: true,
      default: '',
      description: '',
    },
    color: {
      name: 'color',
      values: [],
      require: false,
      default: '',
      description: '',
    },
    size: {
      name: 'size',
      values: [],
      require: false,
      default: '',
      description: '',
    },
  },
  svgIcon: {
    type: null,
    color: {
      name: 'color',
      values: ['brand', 'info', 'success', 'error'],
      require: false,
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      require: false,
      default: 'md',
      description: '',
    },
  },
};
