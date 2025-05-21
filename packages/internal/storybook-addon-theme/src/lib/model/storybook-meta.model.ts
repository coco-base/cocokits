/**
 * The order of the tags is important.
 * If multiple tags are used, the sidebar will be take only the first one.
 */
export enum CckStorybookSidenavItemStatus {
  new = 'status:new',
  // deprecated = 'status:deprecated',
  // beta = 'status:beta',
}

export type StorybookTags =
  | 'autodocs' // Generate DocPage Automatically
  | '!autodocs' // Don't Generate DocPage
  | `${CckStorybookSidenavItemStatus}`;
