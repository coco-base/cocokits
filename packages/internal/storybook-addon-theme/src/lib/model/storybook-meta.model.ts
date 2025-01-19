// 'status:deprecated' | // Sidenav label status
// 'status:beta' // Sidenav label status
export type CckStorybookSidenavItemStatus = '';

export type StorybookTags =
  | 'autodocs' // Generate DocPage Automatically
  | '!autodocs' // Don't Generate DocPage
  | CckStorybookSidenavItemStatus;
