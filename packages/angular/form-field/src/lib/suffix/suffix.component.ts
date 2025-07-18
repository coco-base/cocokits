import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  imports: [],
  selector: 'cck-suffix',
  templateUrl: './suffix.component.html',
  styleUrls: ['./suffix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classNames().host',
  },
})
export class SuffixComponent extends _UiBaseComponent<'suffix'> {
  protected readonly componentName = 'suffix';
  protected extraHostElementClassConditions = computed(() => []);
}
