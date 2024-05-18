import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { debounceTime, map, Observable, switchMap, tap } from 'rxjs';

import { HighlightComponent } from '@coco-kits/angular-highlight';
import { runInsideNgZone } from '@coco-kits/common-angular-utils';
import { fuzzysearch, skipNullish } from '@coco-kits/common-utils';
import { themeChanged$ } from '@coco-kits/storybook-theme-switcher';
import { SvgIcon } from '@coco-kits/theme-core';

import { SvgIconComponent } from '../../../src';

@Component({
  standalone: true,
  selector: 'story-svg-icon-list',
  imports: [AsyncPipe, KeyValuePipe, SvgIconComponent, FormsModule, HighlightComponent],
  templateUrl: './svg-icon-list.component.html',
  styleUrl: './svg-icon-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgIconListComponent {
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
