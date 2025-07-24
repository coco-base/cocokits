import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

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
    '[style.--cck-badge-radius]': 'radius()',
  },
})
export class BadgeContainerComponent extends _UiBaseComponent<'badgeContainer'> {
  protected readonly componentName = 'badgeContainer';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.position() === 'top-left', classes: this.classNames().topLeft },
    { if: this.position() === 'top-right', classes: this.classNames().topRight },
    { if: this.position() === 'bottom-left', classes: this.classNames().bottomLeft },
    { if: this.position() === 'bottom-right', classes: this.classNames().bottomRight },
    { if: this.offset() && this.offset()?.[0] && this.offset()?.[1], classes: this.classNames().customOffset },
  ]);

  /** Position of the badge. */
  position = input<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-right');

  /**
   * [horizontal, vertical] pixel adjustment for badge position.
   * it's allow you to take control of badge positioning.
   * @example ['10px', '20px']
   */
  offset = input<[string, string]>();

  /**
   * Controls the corner rounding of the component. Accepts any valid CSS border-radius value
   * including pixels (e.g. "12px"), percentages (e.g. "50%").
   * Percentage values are relative to the component's dimensions.
   * useful for when the content is curved such as avatars.
   */
  radius = input<string>('0px');

  protected transformBadgeWrapper = computed(() => {
    const offset = this.offset();
    if (!offset || !offset[0] || !offset[1]) {
      return null;
    }
    return `translate(${offset[0]}, ${offset[1]})`;
  });
}
