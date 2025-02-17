import { ThemeComponentConfigRecord, ThemeConfig } from '@cocokits/core';

const components: ThemeComponentConfigRecord = {
  // toggle: {},
  // divider: {},
  // chipList: {},
  // chip: {},
  // optionGroup: {},
  // option: {},
  // select: {},
  // formField: {},
  // radioGroup: {},
  // radioButton: {},
  // checkbox: {},
  iconButton: {
    type: {
      name: 'type',
      description: '',
      values: ['default'],
      default: 'default',
    },
    size: {
      name: 'size',
      description: '',
      values: ['md'],
      default: 'md',
    },
  },
  button: {
    type: {
      name: 'type',
      description: '',
      values: ['default'],
      default: 'default',
    },
    size: {
      name: 'size',
      description: '',
      values: ['md'],
      default: 'md',
    },
    color: {
      name: 'color',
      description: '',
      values: ['primary', 'secondary'],
      default: 'primary',
    },
  },
  svgIcon: {
    size: {
      name: 'size',
      description: '',
      values: ['md'],
      default: 'md',
    },
    color: {
      name: 'color',
      description: '',
      values: ['default', 'gray', 'brand'],
      default: 'default',
    },
  },
  // error: {},
  // hint: {},
  // input: {},
  // textarea: {},
  // label: {},
  // leading: {},
  // prefix: {},
  // selectPreview: {},
  // suffix: {},
  // trailing: {},
  // menu: {},
  // menuItem: {},
  tabs: {
    type: {
      name: 'type',
      description: '',
      values: ['default'],
      default: 'default',
    },
    size: {
      name: 'size',
      description: '',
      values: ['md'],
      default: 'md',
    },
    color: {
      name: 'color',
      description: '',
      values: ['default'],
      default: 'default',
    },
  },
  tab: {},
  tabLabel: {},
  // overlay: {},
};

export const websiteThemeConfig: ThemeConfig = {
  components,
  cssSelectorPrefix: 'website',
};
