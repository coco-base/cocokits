import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class MenuComponent extends _UiBaseComponent<'menu'> {
  protected readonly componentName = 'menu';
  protected extraHostElementClassConditions = computed(() => [{ if: true, classes: this.classNames().overlay }]);

  closeOnSelectItem = input(false);
}
