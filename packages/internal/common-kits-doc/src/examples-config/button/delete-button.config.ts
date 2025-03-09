import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

export interface ExampleArgs {
  buttonType: string;
  buttonColor: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    buttonType: 'default',
    buttonColor: 'danger',
  },
  [ThemeId.CocoKits]: {
    buttonType: 'primary',
    buttonColor: 'error',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};
