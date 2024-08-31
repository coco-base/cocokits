import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-menu-group',
  templateUrl: './menu-group.component.html',
  styleUrls: ['./menu-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class MenuGroupComponent extends _UiBaseComponent<'menuGroup'> {
  protected readonly componentName = 'menuGroup';
  protected extraHostElementClassConditions = computed(() => []);
}
