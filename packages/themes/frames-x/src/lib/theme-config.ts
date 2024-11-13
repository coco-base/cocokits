import { ThemeComponentConfigRecord, ThemeConfig } from '@cocokits/core';

const components: ThemeComponentConfigRecord = {
  toggle: {
    type: {
      name: 'type',
      values: ['knob', 'switch'],
      default: 'knob',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: '',
    },
  },
  divider: {
    type: {
      name: 'type',
      values: ['horizontal', 'vertical'],
      default: 'horizontal',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md'],
      default: 'sm',
      description: '',
    },
  },
  chipList: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  chip: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    templates: {
      chipRemoveIcon: {
        name: 'chipRemoveIcon',
        content:
          '<path d="M8.00003 7.05733L11.4954 3.56199C11.7557 3.30168 12.1777 3.30168 12.438 3.56199V3.56199C12.6983 3.8223 12.6983 4.24435 12.438 4.50466L8.9427 7.99999L12.438 11.4953C12.6983 11.7556 12.6983 12.1777 12.438 12.438V12.438C12.1777 12.6983 11.7557 12.6983 11.4954 12.438L8.00003 8.94266L4.5047 12.438C4.24439 12.6983 3.82234 12.6983 3.56203 12.438V12.438C3.30172 12.1777 3.30172 11.7556 3.56203 11.4953L7.05737 7.99999L3.56203 4.50466C3.30172 4.24435 3.30172 3.8223 3.56203 3.56199V3.56199C3.82234 3.30168 4.24439 3.30168 4.5047 3.56199L8.00003 7.05733Z" fill="currentColor"/>',
        viewBox: '0 0 16 16',
      },
    },
  },
  optionGroup: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  option: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    templates: {
      optionSelectedIcon: {
        name: 'optionSelectedIcon',
        content:
          '<path d="M8.89739 16.0237L19.3077 5.54269C19.6947 5.15247 20.3222 5.15246 20.7094 5.54253C21.0967 5.93278 21.0969 6.56588 20.7098 6.95627L9.60697 18.1355C9.21588 18.5293 8.57892 18.5293 8.18786 18.1355L3.29027 13.1964C2.90324 12.8061 2.90324 12.1735 3.29027 11.7832C3.67729 11.393 4.30478 11.393 4.6918 11.7832L8.89739 16.0237Z"/>',
        viewBox: '0 0 24 24',
      },
    },
  },
  select: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
    templates: {
      dropdownIcon: {
        name: 'dropdownIcon',
        content:
          '<path d="M12.6,15.7c-0.4,0.4-0.9,0.4-1.3,0L5.3,9.6c-0.4-0.4-0.4-0.9,0-1.3C5.6,8,6.2,8,6.6,8.3l5.4,5.4l5.4-5.4 c0.4-0.4,0.9-0.4,1.3,0c0.4,0.4,0.4,0.9,0,1.3L12.6,15.7z"/>',
        viewBox: '0 0 24 24',
      },
    },
  },
  formField: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: '',
    },
  },
  radioGroup: {
    type: {
      name: 'type',
      values: ['column', 'row'],
      default: 'column',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: '',
    },
  },
  radioButton: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: '',
    },
  },
  checkbox: {
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: '',
    },
    templates: {
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
      default: 'default',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'highlight', 'success', 'danger'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: '',
    },
  },
  button: {
    type: {
      name: 'type',
      values: ['default', 'secondary', 'ghost'],
      default: 'default',
      description: '',
    },
    color: {
      name: 'color',
      values: ['brand', 'highlight', 'success', 'danger'],
      default: 'brand',
      description: '',
    },
    size: {
      name: 'size',
      values: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: '',
    },
  },
  svgIcon: {
    color: {
      name: 'color',
      values: ['grey', 'brand', 'highlight', 'success', 'danger'],
      default: 'grey',
      description: '',
    },
    size: {
      name: 'size',
      values: ['xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      default: 'lg',
      description: '',
    },
  },
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

export const framesXThemeConfig: ThemeConfig = {
  components,
  cssSelectorPrefix: '',
};
