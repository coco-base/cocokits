import events from '@storybook/core-events';
import { addons, API } from '@storybook/manager-api';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';

import { CCK_THEME_CHANGED_EVENT_NAME } from '../lib/config/cck-theme.config';
import { CckThemeChangedEvent } from '../lib/config/cck-themes.model';
import { CckStorybookConfig } from '../lib/config/storybook-config.model';
import { MixpanelEvents, StorybookPageCategories } from '../lib/mixpanel/mixpanel.model';
import { emitMixpanelEvent } from '../lib/mixpanel/mixpanel-emitter';
import { LocalStorage } from '../lib/utils/local-storage';

export function registerMixpanel(api: API, config: CckStorybookConfig) {
  if (!config.mixpanel.devToken && !config.mixpanel.prodToken) {
    console.warn('Mixpanel token is not provided. Skipping Mixpanel initialization.');
    return;
  }

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const token = isLocalhost ? config.mixpanel.devToken : config.mixpanel.prodToken;

  mixpanel.init(token, {
    debug: true,
    track_pageview: isLocalhost,
    persistence: 'localStorage',
  });

  // Emit start event
  emitMixpanelEvent(MixpanelEvents.Start, {
    theme: LocalStorage.getCckTheme(),
  });

  // Emit page change event
  // storyPageId example: ui-components-button--docs
  api.on(events.DOCS_RENDERED, (storyPageId: string) => {
    const category =
      (_.findKey(StorybookPageCategories, (value) =>
        storyPageId.startsWith(_.kebabCase(value))
      ) as StorybookPageCategories) ?? StorybookPageCategories.Unknown;

    emitMixpanelEvent(MixpanelEvents.PageChange, {
      pageName: storyPageId,
      category,
      theme: LocalStorage.getCckThemeOrDefault(),
    });
  });

  // Emit storybook theme change event
  const change = addons.getChannel();
  change.on(CCK_THEME_CHANGED_EVENT_NAME, (theme: CckThemeChangedEvent) => {
    const lastRenderedEvents: string[] = change.last(events.DOCS_RENDERED) ?? [];
    const currentPageId = lastRenderedEvents[0];

    if (!currentPageId) {
      return;
    }

    emitMixpanelEvent(MixpanelEvents.CckThemeChange, {
      pageName: currentPageId,
      theme: {
        id: theme.id,
        selectedModes: theme.selectedModes,
      },
    });
  });
}
