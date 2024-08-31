import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class DividerComponent extends _UiBaseComponent<'divider'> {
  protected readonly componentName = 'divider';
  protected extraHostElementClassConditions = computed(() => []);
}
