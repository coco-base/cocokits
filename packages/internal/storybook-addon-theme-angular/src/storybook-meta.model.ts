import { Meta, StoryObj as NgStoryObj } from '@storybook/angular';

import { AddonParametersMeta, AddonParametersStories, StorybookTags } from '@cocokits/storybook-addon-theme';

// will be used in index.stories.ts
export interface StoriesMeta extends Meta {
  tags?: StorybookTags[];
  parameters: AddonParametersMeta;
}

// will be used in XXX.stories.ts
export type StoryObj<T> = NgStoryObj<T> & {
  parameters: AddonParametersStories;
};
