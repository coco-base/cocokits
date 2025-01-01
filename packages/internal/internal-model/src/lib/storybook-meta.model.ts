import type { ArgTypes, Meta as NgStorybookMeta, StoryObj as NgStorybookStoryObj } from '@storybook/angular';
import type { Meta as ReactStorybookMeta, StoryObj as ReactStorybookStoryObj } from '@storybook/react';

import { AddonParametersMeta, AddonParametersStories } from '@cocokits/storybook-addon-theme';

// 'status:deprecated' | // Sidenav label status
// 'status:beta' // Sidenav label status
export type CckStorybookSidenavItemStatus = '';

export type StorybookTags =
  | 'autodocs' // Generate DocPage Automatically
  | '!autodocs' // Don't Generate DocPage
  | CckStorybookSidenavItemStatus;

// will be used in index.stories.ts
export interface AngularStoriesMeta extends NgStorybookMeta {
  tags?: StorybookTags[];
  parameters: AddonParametersMeta;
}

export type ReactStoriesMeta<T> = ReactStorybookMeta<T> & {
  tags?: StorybookTags[];
};

// will be used in XXX.stories.ts
export type AngularStoryObj<T> = NgStorybookStoryObj<T> & {
  parameters: AddonParametersStories;
};
export type ReactStoryObj<T> = ReactStorybookStoryObj<T>;
