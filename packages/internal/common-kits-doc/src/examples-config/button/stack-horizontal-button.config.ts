import { ExampleStoryCssVariables, ExampleStoryTemplateArgs, ThemeId } from '@cocokits/storybook-addon-theme';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExampleArgs {
  firstButtonType: string;
  firstButtonSize: string;
  firstButtonColor: string;

  secondButtonType: string;
  secondButtonSize: string;
  secondButtonColor: string;
}

export const TEMPLATE_ARGS: ExampleStoryTemplateArgs<ExampleArgs> = {
  [ThemeId.FramesX]: {
    firstButtonType: 'secondary',
    firstButtonSize: 'md',
    firstButtonColor: 'brand',

    secondButtonType: 'default',
    secondButtonSize: 'md',
    secondButtonColor: 'brand',
  },
  [ThemeId.CocoKits]: {
    firstButtonType: 'outline',
    firstButtonSize: 'md',
    firstButtonColor: 'brand',

    secondButtonType: 'primary',
    secondButtonSize: 'md',
    secondButtonColor: 'brand',
  },
};

export const CSS_VARIABLES: ExampleStoryCssVariables = {
  [ThemeId.FramesX]: {},
  [ThemeId.CocoKits]: {},
};
