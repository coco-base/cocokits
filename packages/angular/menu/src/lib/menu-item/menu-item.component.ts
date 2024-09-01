import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { OverlayRef } from '@cocokits/angular-overlay';
import { toBooleanOrPresent } from '@cocokits/common-utils';

import { MenuComponent } from '../menu/menu.component';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
    '(click)': 'onHostClick()',
  },
})
export class MenuItemComponent extends _UiBaseComponent<'menuItem'> {
  protected readonly componentName = 'menuItem';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.disabled(), classes: this.classNames().disabled },
  ]);

  private menuComp = inject(MenuComponent, { optional: true });
  private overlayRef = inject(OverlayRef, { optional: true });

  override _effectedType = computed(() => this.type() ?? this.menuComp?.type());
  override _effectedSize = computed(() => this.size() ?? this.menuComp?.size());
  override _effectedColor = computed(() => this.color() ?? this.menuComp?.color());

  /**
   * Whether the menu item is disabled.
   */
  disabled = input(null, { transform: toBooleanOrPresent });

  protected onHostClick() {
    if (this.menuComp?.closeOnSelectItem()) {
      this.overlayRef?.close();
    }
  }
}
