import { create } from '@storybook/theming/create';

import { Token } from '@coco-kits/theme-default';

export const light = create({
  base: 'light',
  brandTitle: 'Coco-Kits',

  brandUrl: 'https://github.com/miladfm/elemix',
  // brandImage: logo,

  colorPrimary: '#8c40ef',
  colorSecondary: '#8c40ef',

  // UI
  appBg: Token.globalDefault.colorPalette.darkOrange['200'],
  appContentBg: '#ffffff',
  appBorderColor: '#e9eaeb',

  // Text colors
  textColor: '#3f4250',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#727683',
  barSelectedColor: '#8d40ee', // Selected controller tab
  barBg: '#f9f9fa',

  buttonBg: '#ffffff',
  buttonBorder: '#d9dadd',

  // BIZARRE
  booleanBg: '#ffffff',
  booleanSelectedBg: '#f1eefc',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#d9dadd',
  inputTextColor: '#3f4250',
  inputBorderRadius: 4,
  appPreviewBg: 'transparent', // The default value of the story background and will be overridden after the Theme has applied
  appBorderRadius: 4, // Toolbar menu overlay radius
  fontBase: 'Nunito Sans, sans-serif',
  fontCode: 'Nunito Sans, sans-serif',
  textMutedColor: '#798186', // Font color of sidenav title and search box text
  barHoverColor: '#8c40ef',
});
