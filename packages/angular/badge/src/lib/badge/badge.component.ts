import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { isNotNullish, isNullish } from '@cocokits/common-utils';

@Component({
  imports: [],
  selector: 'cck-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class BadgeComponent extends _UiBaseComponent<'badge'> {
  protected readonly componentName = 'badge';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.withMaxIndicator(), classes: this.classNames().maxIndicator },
    { if: this.truncationContent(), classes: this.classNames().withContent },
    { if: !this.truncationContent(), classes: this.classNames().withoutContent },
    { if: this.hide(), classes: this.classNames().hidden },
  ]);

  /** Max value before truncation. */
  max = input<number>();

  /** Content to display in the badge. When "", null, or undefined, shows a dot. */
  content = input<number | string | undefined | null>();

  /** Whether to hide the badge completely. Default is false. */
  hide = input<boolean>(false);

  protected withMaxIndicator = computed(() => {
    const max = this.max();
    const content = this.content();

    if (isNullish(max) || isNullish(content)) {
      return false;
    }
    const numberContent = typeof content === 'number' ? content : parseInt(content);

    if (isNaN(numberContent) || max <= 0) {
      return false;
    }
    return max < numberContent;
  });

  protected truncationContent = computed(() => {
    const withMaxIndicator = this.withMaxIndicator();
    const content = this.content();
    const max = this.max();

    if (isNullish(content)) {
      return '';
    }

    const contentAsNumber = parseInt(content as string);
    if (withMaxIndicator && !isNaN(contentAsNumber) && isNotNullish(max)) {
      return Math.min(contentAsNumber, max);
    }

    return content;
  });
}
