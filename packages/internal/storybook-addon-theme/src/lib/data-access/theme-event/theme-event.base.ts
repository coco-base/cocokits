import { Channel } from '@storybook/channels';
import { ThemeChangeEvent } from '../../model/event.model';
import { EVENTS } from '../../config/events.config';
import { SelectedTheme } from '../../model/theme.model';
import { THEMES } from '../../config/theme.config';
import { fromStorybookEvent } from '../../utils/rxjs.util';
import { Observable, startWith } from 'rxjs';
import { LocalStorage } from '../local-storage';
import { getInstance } from '@cocokits/common-utils';

export abstract class ThemeEventBase {
  protected channel: Channel;
  protected localStorage = getInstance(LocalStorage);
  public themeChange$: Observable<ThemeChangeEvent>;

  constructor(channel: Channel) {
    this.channel = channel;
    // Don't move this line outside if `constructor`, otherwise the channel will be undefined, event if it's initialized in the constructor props.
    this.themeChange$ = fromStorybookEvent<ThemeChangeEvent>(this.channel, EVENTS.THEME_CHANGE).pipe(
      startWith(this.getCurrentTheme())
    );

    /**
     * We you need to ensure that the observable chain has always an active subscription.
     * Observables in RxJS are cold by default and won't emit values unless subscribed to.
     * Even if you don't subscribe to the source observable directly,
     * you should subscribe to the observable resulting from `withLatestFrom`.
     * This will initiate the data flow and allow you to receive values.
     */
    this.themeChange$.subscribe(() => {});
  }

  public getCurrentTheme() {
    return this.selectedThemeToThemeEvent(this.localStorage.getThemeOrDefault());
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
