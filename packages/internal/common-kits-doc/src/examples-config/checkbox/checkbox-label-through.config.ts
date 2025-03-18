import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

// eslint-disable-next-line @typescript-eslint/no-empty-interface

export interface ExampleArgs {
  name: string;
  size: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    name: 'FramesX',
    size: 'md',
  },
  [ThemeId.CocoKits]: {
    name: 'CocoKits',
    size: 'md',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};
