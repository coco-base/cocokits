import events from '@storybook/core-events';
import { API } from '@storybook/manager-api';
import { StoryId, ViewMode } from '@storybook/types';

export function registerHideToolbar(api: API) {
  document.documentElement.classList.add('cck-storybook-theme--remove-toolbar');

  // The toolbar will be hidden for all `Doc` page, So listen to story change event and add a custom class
  // to the html tag. In our custom style, if the html tag has a specific class name, then it will hide the toolbar
  api.on(events.SET_CURRENT_STORY, ({ viewMode }: { storyId: StoryId; viewMode?: ViewMode }) => {
    if (viewMode === 'story') {
      document.documentElement.classList.remove('cck-storybook-theme--remove-toolbar');
      return;
    }

    // By default, the toolbar will be hidden
    document.documentElement.classList.add('cck-storybook-theme--remove-toolbar');
  });
}
