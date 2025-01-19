import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

export interface ExampleArgs {
  name: string;
  volumeIconSize: string;
  volumeIconColor: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    name: 'FramesX',
    volumeIconSize: '2xl',
    volumeIconColor: 'brand',
  },
  [ThemeId.CocoKits]: {
    name: 'CocoKits',
    volumeIconSize: '2xl',
    volumeIconColor: 'h-contrast',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {
    '--volume-host-gap': '0px',
    '--volume-text-font': 'var(--text-xs-font-medium)',
    '--volume-text-color': 'var(--text-dark-primary)',
  },
  [ThemeId.CocoKits]: {
    '--volume-host-gap': '4px',
    '--volume-text-font': 'var(--display-xs-medium)',
    '--volume-text-color': 'var(--color-font-default)',
  },
};
