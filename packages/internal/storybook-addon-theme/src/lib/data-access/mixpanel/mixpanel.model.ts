import { StoryTab } from '../../features/story-doc-page/story-doc-page';
import { SelectedTheme } from '../../model/theme.model';

export enum StorybookPageCategories {
  GettingStarted = 'Getting Started',
  UIComponents = 'UI Components',
  ThemeConfig = 'Theme Config',
  CDK = 'CDK',
  Utils = 'Utils',
  Unknown = 'Unknown',
}

export enum MixpanelEvents {
  Start = 'Start',
  PageChange = 'Page Change',
  ThemeChange = 'Theme Changed',
  TabChange = 'Tab Change',
  ExampleToggle = 'Example Toggle',
  OverviewControlToggle = 'Overview Control Toggle',
  OverviewSourceToggle = 'Overview Source Toggle',
}

export type MixpanelEventData<T extends MixpanelEvents> = {
  [MixpanelEvents.Start]: {
    theme: SelectedTheme | null;
  };
  [MixpanelEvents.PageChange]: {
    pageName: string;
    category: StorybookPageCategories;
    theme: SelectedTheme;
  };
  [MixpanelEvents.ThemeChange]: {
    pageName: string;
    theme: SelectedTheme;
  };
  [MixpanelEvents.TabChange]: {
    pageName: string;
    tabName: StoryTab;
    theme: SelectedTheme;
  };
  [MixpanelEvents.ExampleToggle]: {
    pageName: string;
    storyName: string;
    isOpen: boolean;
    theme: SelectedTheme;
  };
  [MixpanelEvents.OverviewControlToggle]: {
    pageName: string;
    storyName: string;
    isOpen: boolean;
    theme: SelectedTheme;
  };
  [MixpanelEvents.OverviewSourceToggle]: {
    pageName: string;
    storyName: string;
    isOpen: boolean;
    theme: SelectedTheme;
  };
}[T];
