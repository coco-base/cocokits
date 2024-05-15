import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, NgZone, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { debounceTime, filter, map, Observable, OperatorFunction, pipe, switchMap, tap } from 'rxjs';

import { HighlightComponent } from '@coco-kits/angular-highlight';
import { SvgIconComponent } from '@coco-kits/angular-icon';
import { themeChanged$ } from '@coco-kits/storybook-theme-switcher';
import { SvgIcon } from '@coco-kits/theme-core';

export function runInsideNgZone<T>(zone = inject(NgZone)): OperatorFunction<T, T> {
  return (source) =>
    new Observable<T>((observer) =>
      source.subscribe({
        next: (x) => zone.run(() => observer.next(x)),
        error: (err) => zone.run(() => observer.error(err)),
        complete: () => zone.run(() => observer.complete()),
      })
    );
}

// ****************************************************************************************
// https://github.com/bevacqua/fuzzysearch
// The library has no typescript export, therefore we copy the source code into our project.
// ****************************************************************************************

export function fuzzysearch(needle: string, haystack: string) {
  const tlen = haystack.length;
  const qlen = needle.length;

  if (qlen > tlen) {
    return false;
  }
  if (qlen === tlen) {
    return needle === haystack;
  }
  outer: for (let i = 0, j = 0; i < qlen; i++) {
    const nch = needle.charCodeAt(i);
    while (j < tlen) {
      if (haystack.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}

export function skipNullish<T>(): (source: Observable<T>) => Observable<NonNullable<T>> {
  return pipe(filter((value: T): value is NonNullable<T> => value !== null && value !== undefined));
}

@Component({
  standalone: true,
  selector: 'story-icon-list',
  imports: [AsyncPipe, KeyValuePipe, SvgIconComponent, FormsModule, HighlightComponent],
  templateUrl: './icon-list.component.html',
  styleUrl: './icon-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconListComponent {
  protected searchInput = signal('');
  private themeChanged = toSignal(themeChanged$);

  private searchInput$ = toObservable(this.searchInput);
  protected iconsMap$: Observable<SvgIcon[]> = themeChanged$.pipe(
    tap(() => this.searchInput.set('')),
    tap(() => this.selectedIconName.set(null)),
    skipNullish(),
    switchMap((themeChangeEvent) =>
      this.searchInput$.pipe(
        debounceTime(300),
        map((inputSearch) =>
          Object.values(themeChangeEvent.iconList).filter((icon) =>
            fuzzysearch(inputSearch.toLowerCase().trim(), icon.name)
          )
        )
      )
    ),
    runInsideNgZone()
  );

  protected selectedIconName = signal<null | string>(null);

  protected sourceCode = computed(
    () => `
import { svgIconMap } from '@coco-kits/${this.themeChanged()?.name.toLowerCase()}';
import { SvgIconComponent } from '@coco-kits/angular-icon';

@Component({
  standalone: true,
  imports: [SvgIconComponent],
  template: \`
    <cck-svg-icon [icon]="svgIconMap['${this.selectedIconName()}']" />
  \`,
})
export class HighlightComponent {
  protected readonly svgIconMap = svgIconMap;
}
  `
  );

  protected onIconClick(icon: SvgIcon) {
    this.selectedIconName.set(icon.name);
  }
}
