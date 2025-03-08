import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

export interface ExampleArgs {
  color: string;
  type: string;
  size: string;
  iconSize: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    color: 'brand',
    type: 'secondary',
    size: 'md',
    iconSize: '2xl',
  },
  [ThemeId.CocoKits]: {
    color: 'h-contrast',
    type: 'primary',
    size: 'lg',
    iconSize: '2xl',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};
