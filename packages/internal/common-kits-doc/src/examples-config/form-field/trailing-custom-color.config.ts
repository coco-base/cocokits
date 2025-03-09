import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExampleArgs {}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {
    '--trailing-bg': 'var(--state-brand-active)',
    '--trailing-bg-hover': 'var(--state-brand-hover)',
    '--trailing-bg-active': 'var(--state-brand-selected)',
    '--trailing-color': 'var(--text-light-primary)',
  },
  [ThemeId.CocoKits]: {
    '--trailing-bg': 'var(--color-brand-default)',
    '--trailing-bg-hover': 'var(--color-brand-default)',
    '--trailing-bg-active': 'var(--color-brand-default)',
    '--trailing-color': 'var(--color-font-inverse-default)',
  },
};
