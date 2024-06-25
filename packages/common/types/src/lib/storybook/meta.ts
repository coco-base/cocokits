import { Meta as NgStorybookMeta } from '@storybook/angular';

export type CckStorybookSidenavItemStatus = '';
// 'status:deprecated' | // Sidenav label status
// 'status:beta' // Sidenav label status

export type StorybookTags =
  | 'autodocs' // Generate DocPage Automatically
  | '!autodocs' // Don't Generate DocPage
  | 'docs' // Will add this tag for auto generated doc page
  | CckStorybookSidenavItemStatus;

export interface AngularStoriesMeta extends NgStorybookMeta {
  tags: StorybookTags[];
}
