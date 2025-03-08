import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

export interface ExampleArgs {
  name: string;
  volumeIconSize: string;
  buttonSize: string;
  buttonColor: string;
  buttonType: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    name: 'FramesX',
    volumeIconSize: '2xl',
    buttonSize: 'sm',
    buttonColor: 'brand',
    buttonType: 'secondary',
  },
  [ThemeId.CocoKits]: {
    name: 'CocoKits',
    volumeIconSize: 'xl',
    buttonSize: 'md',
    buttonColor: 'h-contrast',
    buttonType: 'primary',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {
    '--volume-text-font': 'var(--text-base-font-regular)',
    '--volume-text-color': 'var(--text-dark-primary)',
  },
  [ThemeId.CocoKits]: {
    '--volume-text-font': 'var(--text-lg-regular)',
    '--volume-text-color': 'var(--color-font-default)',
  },
};
