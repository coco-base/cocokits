import { addons } from '@storybook/manager-api';
import { GlobalEventBase } from './global-event.base';

export class GlobalEvent extends GlobalEventBase {
  constructor() {
    super(addons.getChannel());
  }
}
