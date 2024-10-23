import mixpanel from 'mixpanel-browser';

import { MixpanelEventData, MixpanelEvents } from './mixpanel.model';

export function emitMixpanelEvent<T extends MixpanelEvents>(event: T, data: MixpanelEventData<T>) {
  mixpanel.track(event, data);
}
