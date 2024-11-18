import { addons } from '@storybook/preview-api';
import { GlobalEventBase } from './global-event.base';

export class GlobalEvent extends GlobalEventBase {
  constructor() {
    super(addons.getChannel());
  }
}
