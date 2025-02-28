import { Args, Meta, StoryObj as ReactStoryObj } from '@storybook/react';
import { ComponentProps } from 'react';

import { ThemeComponentConfig, ThemeSvgIcon } from '@cocokits/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AddonParametersMeta, AddonParametersStories, StorybookTags } from '@cocokits/storybook-addon-theme';

// will be used in index.stories.ts
export type StoriesMeta<T> = Meta<T> & {
  tags?: StorybookTags[];
  parameters: AddonParametersMeta;
};

// will be used in XXX.stories.ts
export type StoryObj<T extends keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>> = ReactStoryObj<
  ComponentProps<T> & {
    cckControl: Args & {
      themeComponentConfig: ThemeComponentConfig;
    };
    cckIcons: Record<string, ThemeSvgIcon>;
    cckExampleVariables: string;
    cckExampleCssVariables: string;
    cckExampleArgs: Args;
  }
> & {
  parameters: AddonParametersStories;
};
