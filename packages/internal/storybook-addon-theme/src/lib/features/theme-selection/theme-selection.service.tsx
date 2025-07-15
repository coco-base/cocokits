// Don't remove `React` import, without this we get an error on opening overlay in react doc page
import React from 'react';
import { filter, switchMap } from 'rxjs';

import { getInstance } from '@cocokits/common-utils';
import { ThemeConfigContext } from '@cocokits/react-core';
import { openStandaloneOverlay, OverlayAnimationType } from '@cocokits/react-overlay';

import { ThemeSelectionDialog } from './theme-selection-dialog';
import { storybookAddonThemeConfig } from '../../../theme/theme-config';
import { GlobalEvent } from '../../data-access/global-event/manager-global-event';
import { ThemeEvent } from '../../data-access/theme-event/manager-theme-event';

export class ThemeSelectionService {
  private globalEvent = getInstance(GlobalEvent);
  private themeEvent = getInstance(ThemeEvent);

  constructor() {
    this.globalEvent.openThemeSelection$
      .pipe(
        switchMap(() => this.openThemeSelection()),
        filter((selectedTheme) => !!selectedTheme)
      )
      .subscribe((selectedTheme) => {
        this.themeEvent.dispatchTheme(selectedTheme);
      });
  }

  private openThemeSelection() {
    const overlayRef = openStandaloneOverlay(ThemeSelectionDialog, {
      positionStrategy: {
        type: 'auto',
        animationType: OverlayAnimationType.TopToCenter,
      },
      decorator: (children) => (
        <ThemeConfigContext.Provider value={storybookAddonThemeConfig}>{children}</ThemeConfigContext.Provider>
      ),
    });

    return overlayRef.closed;
  }
}
