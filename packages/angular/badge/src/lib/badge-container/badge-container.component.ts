import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  imports: [],
  selector: 'cck-badge-container',
  templateUrl: './badge-container.component.html',
  styleUrls: ['./badge-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class BadgeContainerComponent extends _UiBaseComponent<'badgeContainer'> {
  protected readonly componentName = 'badgeContainer';
  protected extraHostElementClassConditions = computed(() => []);
}
