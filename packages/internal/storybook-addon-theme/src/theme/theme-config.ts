import { ThemeComponentConfigRecord, ThemeConfig } from '@cocokits/core';

const components: ThemeComponentConfigRecord = {
  toggle: {},
  // divider: {},
  // chipList: {},
  // chip: {},
  // optionGroup: {},
  option: {},
  select: {
    templates: {
      dropdownIcon: {
        name: 'dropdownIcon',
        content:
          '<path d="M12.6,15.7c-0.4,0.4-0.9,0.4-1.3,0L5.3,9.6c-0.4-0.4-0.4-0.9,0-1.3C5.6,8,6.2,8,6.6,8.3l5.4,5.4l5.4-5.4 c0.4-0.4,0.9-0.4,1.3,0c0.4,0.4,0.4,0.9,0,1.3L12.6,15.7z" fill="#52525B"/>',
        viewBox: '0 0 24 24',
      },
    },
  },
  formField: {},
  radioGroup: {
    type: {
      name: 'type',
      values: ['column', 'row'],
      default: 'row',
      description: '',
    },
  },
  radioButton: {
    templates: {
      radioCheckmark: `
        <div class="doc-cck-radio-button__background--outer-circle"></div>
        <div class="doc-cck-radio-button__background--inner-circle"></div>
      `,
    },
  },
  // checkbox: {},
  iconButton: {
    type: {
      name: 'type',
      description: '',
      values: ['basic', 'outline'],
      default: 'basic',
    },
    size: {
      name: 'size',
      description: '',
      values: ['md', 'sm'],
      default: 'md',
    },
  },
  button: {
    type: {
      name: 'type',
      description: '',
      values: ['basic', 'outline', 'light'],
      default: 'basic',
    },
    size: {
      name: 'size',
      description: '',
      values: ['md', 'sm'],
      default: 'md',
    },
  },
  svgIcon: {},
  // error: {},
  // hint: {},
  input: {},
  // textarea: {},
  label: {},
  // leading: {},
  // prefix: {},
  selectPreview: {},
  // suffix: {},
  // trailing: {},
  // menu: {},
  // menuItem: {},
};

export const storybookAddonThemeConfig: ThemeConfig = {
  components,
  cssSelectorPrefix: 'doc',
};
