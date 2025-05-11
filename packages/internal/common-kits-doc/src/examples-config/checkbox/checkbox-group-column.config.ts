import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExampleArgs {
  size: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    size: 'md',
  },
  [ThemeId.CocoKits]: {
    size: 'md',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {
    '--checkbox-group-column-color': 'var(--colors-gray-300)',
    '--checkbox-group-column-font-family': 'var(--font-family)',
  },
  [ThemeId.CocoKits]: {
    '--checkbox-group-column-color': 'var(--color-palette-gray-800)',
    '--checkbox-group-column-font-family': 'Inter',
  },
};
