import { AsyncPipe, JsonPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Observable, tap } from 'rxjs';

import { HighlightComponent } from '@coco-kits/angular-highlight';
import { runInsideNgZone } from '@coco-kits/common-angular-utils';
import type { ThemeSvgIcon } from '@coco-kits/common-types';
import { skipNullish } from '@coco-kits/common-utils';
import { themeChanged$ } from '@coco-kits/storybook-theme-switcher';

import { filterIconsBySearchInput, getIconSourceCode } from './svg-icon-list.util';
import { SvgIconComponent } from '../../../src';

@Component({
  standalone: true,
  selector: 'story-svg-icon-list',
  imports: [AsyncPipe, KeyValuePipe, SvgIconComponent, FormsModule, HighlightComponent, JsonPipe],
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

  protected selectedIconName = signal<null | string>(null);

  private themeChanged = toSignal(themeChanged$);
  protected sourceCode = computed(() => getIconSourceCode(this.themeChanged(), this.selectedIconName()));

  protected onIconClick(icon: ThemeSvgIcon) {
    this.selectedIconName.set(icon.name);
  }

  private reset() {
    this.searchInput.set('');
    this.selectedIconName.set(null);
  }
}
