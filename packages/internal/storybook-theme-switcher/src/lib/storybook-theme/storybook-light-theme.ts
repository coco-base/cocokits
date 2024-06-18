import { create } from '@storybook/theming/create';

import { themeLight } from '../token/ts-variables';

export const light = create({
  base: 'light',
  brandTitle: 'Coco-Kits',

  brandUrl: 'https://github.com/coco-kits/coco-kits',
  // brandImage: logo,

  colorPrimary: themeLight.color.brand.default,
  colorSecondary: themeLight.color.brand.default,

  // UI
  appBg: themeLight.color.bg.body.alpha['10'],
  appContentBg: themeLight.color.bg.bodyInverse.alpha['2'],
  appBorderColor: themeLight.color.border.alpha.default,

  // Text colors
  textColor: themeLight.color.font.contrast4,
  textInverseColor: themeLight.color.font.contrast4,

  // Toolbar default and active colors
  barTextColor: themeLight.color.font.contrast2,
  barSelectedColor: themeLight.color.brand.default, // Selected controller tab
  barBg: themeLight.color.bg.bodyInverse.alpha['2'],

  buttonBg: themeLight.color.bg.button.primary,
  buttonBorder: themeLight.color.border.button.primary,

  // BIZARRE
  booleanBg: '#ffffff',
  booleanSelectedBg: themeLight.color.brand.default,

  // Form colors
  inputBg: themeLight.color.bg.bodyInverse.alpha['1'],
  inputBorder: themeLight.color.border.alpha.default,
  inputTextColor: themeLight.color.font.contrast1,
  inputBorderRadius: 4,
  appPreviewBg: themeLight.color.bg.body.alpha['10'], // The default value of the story background and will be overridden after the Theme has applied
  appBorderRadius: 4, // Toolbar menu overlay radius
  fontBase: 'Inter, sans-serif',
  fontCode: 'Inter, sans-serif',
  textMutedColor: themeLight.color.font.contrast2, // Font color of sidenav title and search box text
  barHoverColor: themeLight.color.bg.bodyInverse.alpha['6'],
});
