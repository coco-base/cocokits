import { addons } from '@storybook/manager-api';

import { AddonConfigChange, AddonConfigRegister } from './addon-config.model';
import { EVENTS } from '../../config/events.config';
import { AddonThemeConfig } from '../../model/addon.model';
import { fromStorybookEvent } from '../../utils/rxjs.util';

export class AddonConfig {
  private channel = addons.getChannel();
  private state: AddonThemeConfig | null = null;

  constructor() {
    fromStorybookEvent<AddonConfigRegister>(this.channel, EVENTS.PREVIEW_CONFIG_REGISTER).subscribe((event) =>
      this.onPreviewConfigRegister(event)
    );
  }

  private onPreviewConfigRegister(events: AddonConfigRegister): void {
    if (!this.state) {
      throw new Error(
        'Manager Addon config is not ready yet. The preview addon cannot access the state before the Manager Config is ready.'
      );
    }
    const changes: AddonConfigChange = {
      forId: events.id,
      config: this.state,
    };
    this.channel.emit(EVENTS.MANAGER_CONFIG_CHANGE, changes);
  }

  public setAddonConfig(config: AddonThemeConfig): void {
    this.state = config;
  }
}
