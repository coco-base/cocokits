import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

export interface ExampleArgs {
  buttonType: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    buttonType: 'ghost',
  },
  [ThemeId.CocoKits]: {
    buttonType: 'outline',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};
