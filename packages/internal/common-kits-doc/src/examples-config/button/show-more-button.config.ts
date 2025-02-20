import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

export interface ExampleArgs {
  buttonType: string;
  buttonColor: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    buttonType: 'secondary',
    buttonColor: 'brand',
  },
  [ThemeId.CocoKits]: {
    buttonType: 'outline',
    buttonColor: 'brand',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};
