import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  imports: [],
  selector: 'cck-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class TableComponent extends _UiBaseComponent<'table'> {
  protected readonly componentName = 'table';
  protected extraHostElementClassConditions = computed(() => []);
}
