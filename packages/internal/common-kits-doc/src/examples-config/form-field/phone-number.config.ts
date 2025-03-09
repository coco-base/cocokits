import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

export interface ExampleArgs {
  optionFlagSize: string;
  previewFlagSize: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    optionFlagSize: 'sm',
    previewFlagSize: 'md',
  },
  [ThemeId.CocoKits]: {
    optionFlagSize: 'xs',
    previewFlagSize: 'sm',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {
    '--prefix-color': 'var(--text-dark-tertiary)',
    '--prefix-font': 'var(--text-base-font-medium)',
  },
  [ThemeId.CocoKits]: {
    '--prefix-color': 'var(--color-font-alpha-7)',
    '--prefix-font': 'var(--text-xs-regular)',
  },
};
