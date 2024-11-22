import { ThemeComponentConfigRecord, ThemeConfig } from '@cocokits/core';

const components: ThemeComponentConfigRecord = {
  toggle: {},
  divider: {},
  chipList: {},
  chip: {},
  optionGroup: {},
  option: {},
  select: {},
  formField: {},
  radioGroup: {},
  radioButton: {},
  checkbox: {},
  iconButton: {},
  button: {
    // type: {
    //   name: 'type',
    //   description: '',
    //   values: ['basic'],
    //   default: 'primary'
    // },
    // size: {
    //   name: 'size',
    //   description:'',
    //   values: ['md'],
    //   default: 'md'
    // },
    // color: {
    //   name: 'color',
    //   description: '',
    //   values: ['default', 'selected'],
    //   default: 'default'
    // }
  },
  svgIcon: {},
  error: {},
  hint: {},
  input: {},
  textarea: {},
  label: {},
  leading: {},
  prefix: {},
  selectPreview: {},
  suffix: {},
  trailing: {},
  menu: {},
  menuItem: {},
};

export const storybookAddonThemeConfig: ThemeConfig = {
  components,
  cssSelectorPrefix: 'doc',
};
