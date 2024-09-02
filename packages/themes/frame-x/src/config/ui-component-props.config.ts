import { ThemeUIComponentsConfig } from '@cocokits/core';

export const frameXUIComponentConfig: ThemeUIComponentsConfig = {
  toggle: { type: null, size: null, color: null },
  menu: { type: null, size: null, color: null },
  menuItem: { type: null, size: null, color: null },
  divider: { type: null, size: null, color: null },
  chipList: { type: null, size: null, color: null },
  chip: { type: null, size: null, color: null },

  selectPreview: { type: null, size: null, color: null },
  optionGroup: { type: null, size: null, color: null },
  option: { type: null, size: null, color: null },
  select: { type: null, size: null, color: null },
  textarea: { type: null, size: null, color: null },
  input: { type: null, size: null, color: null },
  label: { type: null, size: null, color: null },
  error: { type: null, size: null, color: null },
  hint: { type: null, size: null, color: null },
  prefix: { type: null, size: null, color: null },
  suffix: { type: null, size: null, color: null },
  trailing: { type: null, size: null, color: null },
  leading: { type: null, size: null, color: null },
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
    color: null,
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
    color: null,
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
  },
  checkbox: {
    type: null,
    color: null,
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
    component: {
      checkboxCheckmark: `
        <svg class="cck-checkbox__checkmark" focusable="false" viewBox="0 0 16 16" aria-hidden="true">
          <path class="cck-checkbox__checkmark-path" d="M5.6,10.1l7.7-7.7c0.6-0.6,1.6-0.6,2.3,0c0.6,0.6,0.6,1.6,0,2.3l-8.8,8.8c-0.6,0.6-1.6,0.6-2.3,0l-4-4 c-0.6-0.6-0.6-1.6,0-2.3s1.6-0.6,2.3,0L5.6,10.1z"/>
        </svg>
        <div class="cck-checkbox__mixedmark"></div>
      `,
    },
  },
  iconButton: {
    type: {
      name: 'type',
      values: ['default', 'secondary', 'ghost'],
      require: false,
      default: 'default',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'highlight', 'success', 'danger'],
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
  button: {
    type: {
      name: 'type',
      values: ['default', 'secondary', 'ghost'],
      require: true,
      default: 'default',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'highlight', 'success', 'danger'],
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
      values: ['grey', 'brand', 'highlight', 'success', 'danger'],
      require: false,
      default: 'grey',
      description: '',
    },
    size: {
      name: 'size',
      values: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      require: false,
      default: 'md',
      description: '',
    },
  },
};
