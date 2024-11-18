import { getInstance } from '@cocokits/common-utils';
import { GlobalEvent } from '../../data-access/global-event/manager-global-event';

export class ThemeSelectionService {
  private globalEvent = getInstance(GlobalEvent);

  constructor() {
    this.globalEvent.openThemeSelection$.subscribe(() => {
      console.log('TODO: Open theme selection modal');
    });
  }
}
