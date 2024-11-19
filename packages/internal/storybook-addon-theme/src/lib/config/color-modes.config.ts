import { create } from '@storybook/theming/create';
import { ColorMode } from '../model/theme.model';
import { ThemeVars } from '@storybook/theming';

const COLOR_MODE_DARK = create({
  base: 'dark',
  brandTitle: 'cocokits',

  brandUrl: 'https://github.com/coco-base/cocokits',
  brandImage: '/logos/cocokits-full-logo-light.svg',

  colorPrimary: '#1bbf82', // --cck-storybook-color-brand-default
  colorSecondary: '#1bbf82', // --cck-storybook-color-brand-default

  // UI
  appBg: '#05030d', // --cck-storybook-color-bg-body-alpha-10
  appContentBg: '#ffffff0a', // --cck-storybook-color-bg-body-inverse-alpha-2
  appBorderColor: '#ffffff1a', // --cck-storybook-color-border-alpha-default

  // Text colors
  textColor: '#ffffff', // --cck-storybook-color-font-contrast-4
  textInverseColor: '#ffffff', // --cck-storybook-color-font-contrast-4

  // Toolbar default and active colors
  barTextColor: '#ffffff99', // --cck-storybook-color-font-contrast-2
  barSelectedColor: '#1bbf82', // Selected controller tab / --cck-storybook-color-brand-default
  barBg: '#ffffff0a', // --cck-storybook-color-bg-body-inverse-alpha-2

  buttonBg: '#1bbf8233', // --cck-storybook-color-bg-button-primary
  buttonBorder: '#1bbf8266', // --cck-storybook-color-border-button-primary

  // BIZARRE
  booleanBg: '#ffffff',
  booleanSelectedBg: '#1bbf82', // --cck-storybook-color-brand-default

  // Form colors
  inputBg: '#ffffff05', // --cck-storybook-color-bg-body-inverse-alpha-1
  inputBorder: '#ffffff1a', // --cck-storybook-color-border-alpha-default
  inputTextColor: '#ffffff66', // --cck-storybook-color-font-contrast-1
  inputBorderRadius: 4,
  appPreviewBg: '#05030d', // --cck-storybook-color-bg-body-alpha-10 // The default value of the story background and will be overridden after the Theme has applied
  appBorderRadius: 4, // Toolbar menu overlay radius
  fontBase: 'Inter, sans-serif',
  fontCode: 'Inter, sans-serif',
  textMutedColor: '#ffffff99', // --cck-storybook-color-font-contrast-2 // Font color of sidenav title and search box text
  barHoverColor: '#ffffff33', // --cck-storybook-color-bg-body-inverse-alpha-6
});

const COLOR_MODE_LIGHT = create({
  base: 'light',
  brandTitle: 'cocokits',

  brandUrl: 'https://github.com/coco-base/cocokits',
  brandImage: '/logos/cocokits-full-logo-dark.svg',

  colorPrimary: '#129c69', // --cck-storybook-color-brand-default
  colorSecondary: '#129c69', // --cck-storybook-color-brand-default

  // UI
  appBg: '#ffffff', //
  appContentBg: '#000c1d0a', // --cck-storybook-color-bg-body-inverse-alpha-2
  appBorderColor: '#000c1d1a', // --cck-storybook-color-border-alpha-default

  // Text colors
  textColor: '#000c1d', // --cck-storybook-color-font-contrast-4
  textInverseColor: '#000c1d', // --cck-storybook-color-font-contrast-4

  // Toolbar default and active colors
  barTextColor: '#000c1d99', // --cck-storybook-color-font-contrast-2
  barSelectedColor: '#129c69', // --cck-storybook-color-brand-default // Selected controller tab
  barBg: '#000c1d0a', //

  buttonBg: '#129c6933', // --cck-storybook-color-bg-button-primary
  buttonBorder: '#129c6966', // --cck-storybook-color-border-button-primary

  // BIZARRE
  booleanBg: '#ffffff',
  booleanSelectedBg: '#129c69', // --cck-storybook-color-brand-default

  // Form colors
  inputBg: '#000c1d05', // --cck-storybook-color-bg-body-inverse-alpha-1
  inputBorder: '#000c1d1a', // --cck-storybook-color-border-alpha-default
  inputTextColor: '#000c1d66', // --cck-storybook-color-font-contrast-1
  inputBorderRadius: 4,
  appPreviewBg: '#ffffff', // --cck-storybook-color-bg-body-alpha-10  // The default value of the story background and will be overridden after the Theme has applied
  appBorderRadius: 4, // Toolbar menu overlay radius
  fontBase: 'Inter, sans-serif',
  fontCode: 'Inter, sans-serif',
  textMutedColor: '#000c1d99', // --cck-storybook-color-font-contrast-2 // Font color of sidenav title and search box text
  barHoverColor: '#000c1d33', // --cck-storybook-color-bg-body-inverse-alpha-6
});

export const COLOR_MODES: Record<ColorMode, ThemeVars> = {
  [ColorMode.Dark]: COLOR_MODE_DARK,
  [ColorMode.Light]: COLOR_MODE_LIGHT,
};
