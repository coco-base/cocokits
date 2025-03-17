import mixpanel from 'mixpanel-browser';
import { merge } from 'rxjs';

import { emitMixpanelEvent } from './mixpanel-emitter';
import { getMixpanelEvents } from './mixpanel-listener';
import { AddonThemeConfig } from '../../model/addon.model';

export function registerMixpanel(config: AddonThemeConfig) {
  if (!config?.mixpanel?.devToken && !config?.mixpanel?.prodToken) {
    console.warn('Mixpanel token is not provided. Skipping Mixpanel initialization.');
    return;
  }

  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('test.cocokits.com');
  const token = isDev ? config.mixpanel.devToken : config.mixpanel.prodToken;

  mixpanel.init(token, {
    debug: isDev,
    track_pageview: isDev, // eslint-disable-line camelcase
    persistence: 'localStorage',
  });

  const mixpanelEvents = getMixpanelEvents();

  merge(...mixpanelEvents).subscribe(([event, data]) => {
    emitMixpanelEvent(event, data);
  });
}
