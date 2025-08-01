import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  imports: [],
  selector: 'cck-avatar-label',
  templateUrl: './avatar-label.component.html',
  styleUrls: ['./avatar-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class AvatarLabelComponent extends _UiBaseComponent<'avatarLabel'> {
  protected readonly componentName = 'avatarLabel';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.avatarPosition() === 'left', classes: this.classNames().avatarPositionLeft },
    { if: this.avatarPosition() === 'right', classes: this.classNames().avatarPositionRight },
    { if: this.avatarPosition() === 'top', classes: this.classNames().avatarPositionTop },
    { if: this.avatarPosition() === 'bottom', classes: this.classNames().avatarPositionBottom },
    { if: this.labelAlignment() === 'horizontal', classes: this.classNames().labelAlignmentHorizontal },
    { if: this.labelAlignment() === 'vertical', classes: this.classNames().labelAlignmentVertical },
  ]);

  /**
   * The position of the avatar relative to the label.
   */
  public avatarPosition = input<'left' | 'right' | 'top' | 'bottom'>('left');

  /**
   * The alignment of the label
   */
  public labelAlignment = input<'horizontal' | 'vertical'>('vertical');

  /**
   * The title text of component.
   */
  public title = input<string>();

  /**
   * The description text of avatar
   */
  public description = input<string>();
}
