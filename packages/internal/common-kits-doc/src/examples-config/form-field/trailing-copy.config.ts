import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExampleArgs {}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};
