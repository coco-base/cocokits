import { StoryTab } from '../features/story-doc-page/story-doc-page';

export interface EventDocTabChange {
  tabName: StoryTab;
}

export interface EventDocExampleToggle {
  exampleName: string;
  isOpen: boolean;
}

export interface EventDocOverviewControlToggle {
  storyName: string;
  isOpen: boolean;
}

export interface EventDocOverviewSourceToggle {
  storyName: string;
  isOpen: boolean;
}

export const EVENTS = {
  // Theme
  THEME_CHANGE: 'cocokits_theme-changed',

  // Color Mode
  COLOR_MODE_CHANGE: 'cocokits_color-mode-changed',

  // Theme Selection
  OPEN_THEME_SELECTION: 'cocokits_open-theme-selection',
  THEME_SELECTION_CLOSED: 'cocokits_theme-selection-closed',

  // STORY
  NEW_STORY: 'cocokits_new-story',

  // Story Control
  OPEN_STORY_CONTROL: 'cocokits_open-story-control',
  CLOSE_STORY_CONTROL: 'cocokits_close-story-control',
  CHANGE_STORY_CONTROL: 'cocokits_change-story-control',

  // Token
  CHANGE_TOKEN_INFO: 'cocokits_change-token-info',
  CLOSE_TOKEN_INFO: 'cocokits_close-token-info',

  // Config
  PREVIEW_CONFIG_REGISTER: 'cocokits_preview-config-register',
  MANAGER_CONFIG_CHANGE: 'cocokits_manager-config-change',

  // Docs
  DOC_TAB_CHANGE: 'cocokits_doc-tab-change',
  DOC_EXAMPLE_TOGGLE: 'cocokits_doc-example-toggle',
  DOC_OVERVIEW_SOURCE_TOGGLE: 'cocokits_doc-overview-source-toggle',
};

export const THEME_HTML_ATTRIBUTE_MODE_NAME = 'data-cck-theme';
export const THEME_HTML_ATTRIBUTE_THEME_NAME = 'data-cck-theme-name';
