import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExampleArgs {}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {
    '--tag-bg': 'var(--base-surface-2)',
    '--tag-border': 'var(--base-border)',
    '--tag-font': 'var(--text-xs-font-medium)',
    '--tag-color': 'var(--text-dark-primary)',
    '--hint-color': 'var(--text-dark-tertiary)',
  },
  [ThemeId.CocoKits]: {
    '--tag-bg': 'var(--color-h-contrast-alpha-4)',
    '--tag-border': 'var(--color-border-default)',
    '--tag-font': 'var(--text-xs-regular)',
    '--tag-color': 'var(--color-font-alpha-7)',
    '--hint-color': 'var(--color-font-alpha-7)',
  },
};
