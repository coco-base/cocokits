import { ThemeUIComponentsConfig } from '@cocokits/theme-core';

export const frameXUIComponentConfig: ThemeUIComponentsConfig = {
  iconButton: {
    type: {
      name: 'type',
      values: ['primary'],
      require: false,
      default: 'primary',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand'],
      require: false,
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm'],
      require: false,
      default: 'md',
      description: '',
    },
  },
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
      values: ['test'],
      require: false,
      default: 'test',
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
