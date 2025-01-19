import { ThemeVars } from '@storybook/theming';
import { create } from '@storybook/theming/create';

import { ColorMode } from '../model/theme.model';

const COLOR_MODE_DARK = create({
  base: 'dark',
  brandTitle: 'cocokits',

  brandUrl: 'https://github.com/coco-base/cocokits',
  brandImage: '/logos/cocokits-full-logo-light.svg',

  colorPrimary: '#1BBF82', // var(--cck-doc-color-brand-default)
  colorSecondary: '#1BBF82', // var(--cck-doc-color-brand-default)

  // UI
  appBg: '#0F1116', // Sidenav var(--cck-doc-color-bg-1)
  appContentBg: '#0F1116', // Toolbar & Controller var(--cck-doc-color-bg-1)
  appBorderColor: '#FFFFFF0F', // Border-bottom of toolbar var(--cck-doc-color-border-1)

  // Text colors
  textColor: '#FFFFFF', // All main text (Sidenav controller) var(--cck-doc-color-font-1)
  textInverseColor: '#FFFFFF', // ?? var(--cck-doc-color-font-1)

  // Toolbar default and active colors
  barTextColor: '#FFFFFF', // text at toolbar var(--cck-doc-color-font-1)
  barSelectedColor: '#1BBF82', // Selected controller tab, Selected text at toolbar var(--cck-doc-color-brand-default)
  barBg: '#0F1116', // Toolbar & Controller Toolbar var(--cck-doc-color-bg-1)

  buttonBg: '#012C1E', // var(--cck-doc-color-bg-selected-1)
  buttonBorder: '#012C1E', // var(--cck-doc-color-bg-selected-1)

  // BIZARRE
  booleanBg: '#222835', // var(--cck-doc-color-bg-4)
  booleanSelectedBg: '#1BBF82', // var(--cck-doc-color-brand-default)

  // Form colors
  inputBg: '#0F1116', // var(--cck-doc-color-bg-1)
  inputBorder: '#ffffff1a', // var(--cck-doc-color-border-2)
  inputTextColor: '#FFFFFF', // var(--cck-doc-color-font-1)
  inputBorderRadius: 4,
  appPreviewBg: '#0F1116', // The default value of the story background and will be overridden after the Theme has applied var(--cck-doc-color-bg-1)
  appBorderRadius: 4, // Toolbar menu overlay radius
  fontBase: 'Inter, sans-serif',
  fontCode: 'Inter, sans-serif',
  textMutedColor: '#FFFFFF', // Font color of sidenav title and search box text var(--cck-doc-color-font-1)
  barHoverColor: '#999', // var(--cck-doc-color-font-3)
});

const COLOR_MODE_LIGHT = create({
  base: 'light',
  brandTitle: 'cocokits',

  brandUrl: 'https://github.com/coco-base/cocokits',
  brandImage: '/logos/cocokits-full-logo-dark.svg',

  colorPrimary: '#008D5E', // var(--cck-doc-color-brand-default)
  colorSecondary: '#008D5E', // var(--cck-doc-color-brand-default)

  // UI
  appBg: '#FFFFFF', // Sidenav var(--cck-doc-color-bg-1)
  appContentBg: '#FFFFFF', // Toolbar & Controller var(--cck-doc-color-bg-1)
  appBorderColor: '#000C1D0F', // Border-bottom of toolbar var(--cck-doc-color-border-1)

  // Text colors
  textColor: '#00060F', // All main text (Sidenav controller) var(--cck-doc-color-font-1)
  textInverseColor: '#00060F', // ?? var(--cck-doc-color-font-1)

  // Toolbar default and active colors
  barTextColor: '#00060F', // text at toolbar var(--cck-doc-color-font-1)
  barSelectedColor: '#008D5E', // Selected controller tab, Selected text at toolbar var(--cck-doc-color-brand-default)
  barBg: '#FFFFFF', // Toolbar & Controller Toolbar var(--cck-doc-color-bg-1)

  buttonBg: '#D4FCEC', // var(--cck-doc-color-bg-selected-1)
  buttonBorder: '#D4FCEC', // var(--cck-doc-color-bg-selected-1)

  // BIZARRE
  booleanBg: '#E3E3E8', // var(--cck-doc-color-bg-4)
  booleanSelectedBg: '#008D5E', // var(--cck-doc-color-brand-default)

  // Form colors
  inputBg: '#FFFFFF', // var(--cck-doc-color-bg-1)
  inputBorder: '#000C1D1A', // var(--cck-doc-color-border-2)
  inputTextColor: '#00060F', // var(--cck-doc-color-font-1)
  inputBorderRadius: 4,
  appPreviewBg: '#FFFFFF', // The default value of the story background and will be overridden after the Theme has applied var(--cck-doc-color-bg-1)
  appBorderRadius: 4, // Toolbar menu overlay radius
  fontBase: 'Inter, sans-serif',
  fontCode: 'Inter, sans-serif',
  textMutedColor: '#00060F', // Font color of sidenav title and search box text var(--cck-doc-color-font-1)
  barHoverColor: '#999', // var(--cck-doc-color-font-3)
});

export const COLOR_MODES: Record<ColorMode, ThemeVars> = {
  [ColorMode.Dark]: COLOR_MODE_DARK,
  [ColorMode.Light]: COLOR_MODE_LIGHT,
};
