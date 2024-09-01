import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class ToggleComponent extends _UiBaseComponent<'toggle'> {
  protected readonly componentName = 'toggle';
  protected extraHostElementClassConditions = computed(() => []);
}
