import { Meta as NgStorybookMeta, StoryObj } from '@storybook/angular';

export type CckStorybookSidenavItemStatus = '';
// 'status:deprecated' | // Sidenav label status
// 'status:beta' // Sidenav label status

// Will be used in 'packages/internal/storybook-doc-page/src/lib/components/doc-page/AutoDocMain.tsx'
export type CckStoryTheme =
  | 'theme:default' // Story will this tag, will be rendered only if the 'Default' theme is selected.
  | 'theme:frame-x'; // Story will this tag, will be rendered only if the 'FrameX' theme is selected.

export type StorybookTags =
  | 'autodocs' // Generate DocPage Automatically
  | '!autodocs' // Don't Generate DocPage
  | CckStoryTheme
  | CckStorybookSidenavItemStatus;

export interface AngularStoriesMeta extends NgStorybookMeta {
  tags?: StorybookTags[];
}

export type AngularStoryObj<T> = StoryObj<T> & { tags?: CckStoryTheme[] };
