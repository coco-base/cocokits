import { Channel } from '@storybook/channels';
import { Observable, startWith } from 'rxjs';

import { getInstance } from '@cocokits/common-utils';

import { THEMES } from '../../config/addon-theme.config';
import { EVENTS } from '../../config/events.config';
import { ThemeChangeEvent } from '../../model/event.model';
import { SelectedTheme } from '../../model/theme.model';
import { fromStorybookEvent } from '../../utils/rxjs.util';
import { LocalStorage } from '../local-storage';

export abstract class ThemeEventBase {
  protected channel: Channel;
  protected localStorage = getInstance(LocalStorage);
  public themeChange$: Observable<ThemeChangeEvent>;

  public currentTheme = this.selectedThemeToThemeEvent(this.localStorage.getThemeOrDefault());

  constructor(channel: Channel) {
    this.channel = channel;
    // QuickFix: Don't move this line outside if `constructor`, otherwise the channel will be undefined, event if it's initialized in the constructor props.
    this.themeChange$ = fromStorybookEvent<ThemeChangeEvent>(this.channel, EVENTS.THEME_CHANGE).pipe(
      startWith(this.currentTheme)
    );

    /**
     * There are 2 reasons that we have to subscribe to the observable chain:
     * 1- We you need to ensure that the observable chain has always an active subscription.
     * Observables in RxJS are cold by default and won't emit values unless subscribed to.
     * Even if you don't subscribe to the source observable directly,
     * you should subscribe to the observable resulting from `withLatestFrom`.
     * This will initiate the data flow and allow you to receive values.
     *
     * 2- We need to save the selected theme and if any component need it send it immediately without any delays.
     */
    this.themeChange$.subscribe((theme) => {
      this.currentTheme = this.selectedThemeToThemeEvent(theme);
    });
  }

  public dispatchTheme(newSelectedTheme: SelectedTheme) {
    this.channel.emit(EVENTS.THEME_CHANGE, this.selectedThemeToThemeEvent(newSelectedTheme));
  }

  private selectedThemeToThemeEvent(selectedTheme: SelectedTheme): ThemeChangeEvent {
    return Object.freeze({
      ...THEMES[selectedTheme.id],
      selectedModes: { ...selectedTheme.selectedModes },
    });
  }
}
