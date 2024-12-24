import type { Meta as NgStorybookMeta, StoryObj as NgStorybookStoryObj } from '@storybook/angular';
import type { Meta as ReactStorybookMeta, StoryObj as ReactStorybookStoryObj } from '@storybook/react';

import type { UIBaseComponentsName, UIBaseComponentsPropName } from '@cocokits/core';
import { AddonParameters } from '@cocokits/storybook-addon-theme';

// 'status:deprecated' | // Sidenav label status
// 'status:beta' // Sidenav label status
export type CckStorybookSidenavItemStatus = '';

// Will be used in 'packages/internal/storybook-theme-switcher/src/lib/components/doc-page/AutoDocMain.tsx'
export type CckStoryTheme =
  | 'theme:cocokits' // Story will this tag, will be rendered only if the 'Default' theme is selected.
  | 'theme:frames-x'; // Story will this tag, will be rendered only if the 'Frames X' theme is selected.

export type CckStoryUiBaseComponentName = `uiBaseComponentName:${UIBaseComponentsName}`;
export type CckStoryUiBaseComponentPropName = `uiBaseComponentPropName:${UIBaseComponentsPropName}`;
export type StorybookTags =
  | 'autodocs' // Generate DocPage Automatically
  | '!autodocs' // Don't Generate DocPage
  | CckStoryTheme
  | CckStorybookSidenavItemStatus;

export type StoryTags = CckStoryTheme | CckStoryUiBaseComponentName | CckStoryUiBaseComponentPropName;

export interface AngularStoriesMeta extends NgStorybookMeta {
  tags?: StorybookTags[];
  parameters?: AddonParameters;
}

export type ReactStoriesMeta<T> = ReactStorybookMeta<T> & {
  tags?: StorybookTags[];
};

export type AngularStoryObj<T> = NgStorybookStoryObj<T> & {
  tags?: StoryTags[];
  parameters?: AddonParameters;
};
export type ReactStoryObj<T> = ReactStorybookStoryObj<T> & { tags?: StoryTags[] };
