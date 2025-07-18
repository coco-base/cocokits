import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  imports: [],
  selector: 'cck-avatar-group',
  templateUrl: './avatar-group.component.html',
  styleUrls: ['./avatar-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class AvatarGroupComponent extends _UiBaseComponent<'avatarGroup'> {
  protected readonly componentName = 'avatarGroup';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.direction() === 'left', classes: this.classNames().leftDirection },
    { if: this.direction() === 'right', classes: this.classNames().rightDirection },
  ]);

  public direction = input<'right' | 'left'>('right');
}
