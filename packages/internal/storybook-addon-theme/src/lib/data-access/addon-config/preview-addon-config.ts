import { addons } from '@storybook/preview-api';
import { filter, take } from 'rxjs';

import { lazyPromise } from '@cocokits/common-utils';

import { AddonConfigChange, AddonConfigRegister } from './addon-config.model';
import { EVENTS } from '../../config/events.config';
import { AddonThemeConfig } from '../../model/addon.model';
import { fromStorybookEvent } from '../../utils/rxjs.util';

export class AddonConfig {
  private channel = addons.getChannel();
  private id = crypto.randomUUID();
  private readyPromise: Promise<void>;

  private state: AddonThemeConfig | null = null;

  constructor() {
    const { promise, resolve } = lazyPromise<void>();
    this.readyPromise = promise;

    fromStorybookEvent<AddonConfigChange>(this.channel, EVENTS.MANAGER_CONFIG_CHANGE)
      .pipe(
        filter((event) => event.forId === this.id),
        take(1)
      )
      .subscribe((event) => {
        this.state = event.config;
        resolve();
      });
    this.channel.emit(EVENTS.PREVIEW_CONFIG_REGISTER, { id: this.id } satisfies AddonConfigRegister);

    // The reference of this method will past to the some utils function
    // (i.e. usePromise react hooks) and it will be called outside of the class.
    // So, we need to bind the method to the class instance, to make sure that the method will have the correct context
    // and react react component don't rerender unnecessarily.
    this.getAddonConfig = this.getAddonConfig.bind(this);
  }

  public async getAddonConfig(): Promise<AddonThemeConfig> {
    if (this.state) {
      return Promise.resolve(this.state);
    }

    await this.readyPromise;
    if (!this.state) {
      throw new Error('Preview Addon config is ready but it has no value.');
    }

    return this.state;
  }
}
