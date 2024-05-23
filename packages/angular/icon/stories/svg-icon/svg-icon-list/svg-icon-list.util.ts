import { Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { debounceTime, map, Observable, pipe, startWith, switchMap } from 'rxjs';

import type { ThemeSvgIcon } from '@coco-kits/common-types';
import { fuzzysearch } from '@coco-kits/common-utils';
import { ThemeChangedEvent } from '@coco-kits/storybook-theme-switcher';

export function filterIconsBySearchInput(
  searchInput: Signal<string>
): (source: Observable<ThemeChangedEvent>) => Observable<ThemeSvgIcon[]> {
  const searchInput$ = toObservable(searchInput);
  return pipe(
    switchMap((themeChangeEvent) =>
      searchInput$.pipe(
        debounceTime(300),
        map((inputSearch) =>
          Object.values(themeChangeEvent.iconList).filter((icon) =>
            fuzzysearch(inputSearch.toLowerCase().trim(), icon.name)
          )
        ),
        startWith(Object.values(themeChangeEvent.iconList))
      )
    )
  );
}

export function getIconSourceCode(themeChangedEvent: ThemeChangedEvent | undefined, iconName: string | null) {
  if (!themeChangedEvent || !iconName) {
    return '';
  }

  return `
import { svgIconMap } from '@coco-kits/theme-${themeChangedEvent.name.toLowerCase()}';
import { SvgIconComponent } from '@coco-kits/angular-icon';

@Component({
  standalone: true,
  imports: [SvgIconComponent],
  template: \`
    <cck-svg-icon [icon]="svgIconMap['${iconName}']" />
  \`
})
export class HighlightComponent {
  protected readonly svgIconMap = svgIconMap;
}
  `;
}
