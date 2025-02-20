import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

export interface ExampleArgs {
  buttonType: string;
  buttonColor: string;
  buttonSize: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    buttonType: 'default',
    buttonColor: 'brand',
    buttonSize: 'md',
  },
  [ThemeId.CocoKits]: {
    buttonType: 'primary ',
    buttonColor: 'brand',
    buttonSize: 'md',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};
