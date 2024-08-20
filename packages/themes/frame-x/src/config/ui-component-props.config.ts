import { ThemeUIComponentsConfig } from '@cocokits/core';

export const frameXUIComponentConfig: ThemeUIComponentsConfig = {
  textarea: { type: null, size: null, color: null },
  input: { type: null, size: null, color: null },
  label: { type: null, size: null, color: null },
  error: { type: null, size: null, color: null },
  hint: { type: null, size: null, color: null },
  prefix: { type: null, size: null, color: null },
  suffix: { type: null, size: null, color: null },
  trailing: { type: null, size: null, color: null },
  leading: { type: null, size: null, color: null },
  formField: { type: null, color: null, size: null },
  radioGroup: {
    type: null,
    color: null,
    size: null,
  },
  radioButton: {
    type: null,
    color: null,
    size: null,
  },
  checkbox: {
    type: null,
    color: null,
    size: null,
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
