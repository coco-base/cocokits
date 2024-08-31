import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-menu-trigger',
  templateUrl: './menu-trigger.component.html',
  styleUrls: ['./menu-trigger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class MenuTriggerComponent extends _UiBaseComponent<'menuTrigger'> {
  protected readonly componentName = 'menuTrigger';
  protected extraHostElementClassConditions = computed(() => []);
}
