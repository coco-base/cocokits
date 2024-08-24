import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-prefix',
  templateUrl: './prefix.component.html',
  styleUrls: ['./prefix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classNames().host',
  },
})
export class PrefixComponent extends _UiBaseComponent<'prefix'> {
  protected readonly componentName = 'prefix';
  protected extraHostElementClassConditions = computed(() => []);
}
