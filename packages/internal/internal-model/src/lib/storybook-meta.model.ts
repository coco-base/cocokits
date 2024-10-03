import type { Meta as NgStorybookMeta, StoryObj } from '@storybook/angular';

import type { UIComponentsName, UIComponentsPropName } from '@cocokits/core';

// 'status:deprecated' | // Sidenav label status
// 'status:beta' // Sidenav label status
export type CckStorybookSidenavItemStatus = '';

// Will be used in 'packages/internal/storybook-theme-switcher/src/lib/components/doc-page/AutoDocMain.tsx'
export type CckStoryTheme =
  | 'theme:default' // Story will this tag, will be rendered only if the 'Default' theme is selected.
  | 'theme:frames-x'; // Story will this tag, will be rendered only if the 'Frames X' theme is selected.

export type CckStoryUiComponentName = `uiComponentName:${UIComponentsName}`;
export type CckStoryUiComponentPropName = `uiComponentPropName:${UIComponentsPropName}`;
export type StorybookTags =
  | 'autodocs' // Generate DocPage Automatically
  | '!autodocs' // Don't Generate DocPage
  | CckStoryTheme
  | CckStorybookSidenavItemStatus;

export type StoryTags = CckStoryTheme | CckStoryUiComponentName | CckStoryUiComponentPropName;

export interface AngularStoriesMeta extends NgStorybookMeta {
  tags?: StorybookTags[];
}

export type AngularStoryObj<T> = StoryObj<T> & { tags?: StoryTags[] };
