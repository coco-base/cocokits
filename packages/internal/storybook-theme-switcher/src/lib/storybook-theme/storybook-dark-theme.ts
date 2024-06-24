import { create } from '@storybook/theming/create';

import { themeDark } from '../token/ts-variables';

export const dark = create({
  base: 'dark',
  brandTitle: 'cocokits',

  brandUrl: 'https://github.com/cocokits/cocokits',
  // brandImage: logo,

  colorPrimary: themeDark.color.brand.default,
  colorSecondary: themeDark.color.brand.default,

  // UI
  appBg: themeDark.color.bg.body.alpha['10'],
  appContentBg: themeDark.color.bg.bodyInverse.alpha['2'],
  appBorderColor: themeDark.color.border.alpha.default,

  // Text colors
  textColor: themeDark.color.font.contrast4,
  textInverseColor: themeDark.color.font.contrast4,

  // Toolbar default and active colors
  barTextColor: themeDark.color.font.contrast2,
  barSelectedColor: themeDark.color.brand.default, // Selected controller tab
  barBg: themeDark.color.bg.bodyInverse.alpha['2'],

  buttonBg: themeDark.color.bg.button.primary,
  buttonBorder: themeDark.color.border.button.primary,

  // BIZARRE
  booleanBg: '#ffffff',
  booleanSelectedBg: themeDark.color.brand.default,

  // Form colors
  inputBg: themeDark.color.bg.bodyInverse.alpha['1'],
  inputBorder: themeDark.color.border.alpha.default,
  inputTextColor: themeDark.color.font.contrast1,
  inputBorderRadius: 4,
  appPreviewBg: themeDark.color.bg.body.alpha['10'], // The default value of the story background and will be overridden after the Theme has applied
  appBorderRadius: 4, // Toolbar menu overlay radius
  fontBase: 'Inter, sans-serif',
  fontCode: 'Inter, sans-serif',
  textMutedColor: themeDark.color.font.contrast2, // Font color of sidenav title and search box text
  barHoverColor: themeDark.color.bg.bodyInverse.alpha['6'],
});
