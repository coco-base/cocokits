import { ThemeUIComponentsConfig } from '@cocokits/core';

export const frameXUIComponentConfig: ThemeUIComponentsConfig = {
  toggle: { type: null, size: null, color: null },
  menu: { type: null, size: null, color: null },
  menuItem: { type: null, size: null, color: null },
  divider: { type: null, size: null, color: null },
  chipList: { type: null, size: null, color: null },
  chip: {
    type: null,
    size: {
      name: 'size',
      values: ['xs', 'sm', 'md', 'lg'],
      require: false,
      default: 'md',
      description: '',
    },
    color: null,
    component: {
      chipRemoveIcon: {
        name: 'chipRemoveIcon',
        content:
          '<path d="M8.00003 7.05733L11.4954 3.56199C11.7557 3.30168 12.1777 3.30168 12.438 3.56199V3.56199C12.6983 3.8223 12.6983 4.24435 12.438 4.50466L8.9427 7.99999L12.438 11.4953C12.6983 11.7556 12.6983 12.1777 12.438 12.438V12.438C12.1777 12.6983 11.7557 12.6983 11.4954 12.438L8.00003 8.94266L4.5047 12.438C4.24439 12.6983 3.82234 12.6983 3.56203 12.438V12.438C3.30172 12.1777 3.30172 11.7556 3.56203 11.4953L7.05737 7.99999L3.56203 4.50466C3.30172 4.24435 3.30172 3.8223 3.56203 3.56199V3.56199C3.82234 3.30168 4.24439 3.30168 4.5047 3.56199L8.00003 7.05733Z" fill="currentColor"/>',
        viewBox: '0 0 16 16',
      },
    },
  },

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
      values: ['sm', 'md', 'lg', 'xl'],
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
      values: ['sm', 'md', 'lg', 'xl'],
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
      values: ['sm', 'md', 'lg', 'xl'],
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
      values: ['sm', 'md', 'lg', 'xl'],
      require: false,
      default: 'md',
      description: '',
    },
  },
  button: {
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
      values: ['sm', 'md', 'lg', 'xl'],
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
