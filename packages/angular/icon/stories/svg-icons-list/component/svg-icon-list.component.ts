import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { runInsideNgZone } from 'packages/common/angular-utils/src';
import { ThemeSvgIcon } from 'packages/common/types/src';
import { debounceTime, map, Observable, pipe, startWith, switchMap, tap } from 'rxjs';

import { fuzzysearch, skipNullish } from '@cocokits/common-utils';
import { CckThemeChangedEvent, themeChanged$ } from '@cocokits/storybook-theme-switcher';

import { SvgIconComponent } from '../../../src';

@Component({
  standalone: true,
  imports: [AsyncPipe, SvgIconComponent, FormsModule],
  templateUrl: './svg-icon-list.component.html',
  styleUrl: './svg-icon-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgIconListComponent {
  protected searchInput = signal('');

  protected iconsMap$: Observable<ThemeSvgIcon[]> = themeChanged$.pipe(
    tap(() => this.reset()),
    skipNullish(),
    filterIconsBySearchInput(this.searchInput),
    runInsideNgZone()
  );

  private reset() {
    this.searchInput.set('');
  }
}

function filterIconsBySearchInput(
  searchInput: Signal<string>
): (source: Observable<CckThemeChangedEvent>) => Observable<ThemeSvgIcon[]> {
  const searchInput$ = toObservable(searchInput);
  return pipe(
    switchMap((themeChangeEvent) =>
      searchInput$.pipe(
        debounceTime(300),
        map((inputSearch) =>
          Object.values(themeChangeEvent.svgIconMap).filter((icon) =>
            fuzzysearch(inputSearch.toLowerCase().trim(), icon.name.toLowerCase())
          )
        ),
        startWith(Object.values(themeChangeEvent.svgIconMap))
      )
    )
  );
}
