import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { Animation, toBooleanOrPresent } from '@cocokits/common-utils';

import { AccordionStore } from '../accordion.store';
import { getOriginalHeight } from '../accordion.util';
import { AccordionComponent } from '../accordion/accordion.component';

let NEXT_ID = 1;

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-accordion-panel',
  templateUrl: './accordion-panel.component.html',
  styleUrls: ['./accordion-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
/* cspell:ignore  */
export class AccordionPanelComponent<TValue extends string | number> extends _UiBaseComponent<'accordionPanel'> {
  public readonly _id = `cck-accordion-panel-${NEXT_ID++}`;
  protected readonly componentName = 'accordionPanel';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.isExpanded(), classes: this.classNames().expanded },
    { if: !this.isExpanded(), classes: this.classNames().collapsed },
    { if: this.disabled(), classes: this.classNames().disabled },
  ]);

  protected hasExpandedOnce = false;

  protected animation!: Animation;
  private store = inject(AccordionStore);
  private accordionRef = inject(AccordionComponent);
  private cd = inject(ChangeDetectorRef);
  protected isExpanded = this.store.isExpanded(this._id);

  /**
   * The unique identifier for the accordion panel.
   * @storybook argType will be overridden by storybook
   */
  public value = input<TValue>(this._id as TValue);

  /**
   * Whether the panel is disabled.
   * @storybook argType will be overridden by storybook
   */
  public disabled = input(undefined, { transform: toBooleanOrPresent });

  private content = viewChild.required<ElementRef<HTMLElement>>('content');

  private __onIsExpandedChange = effect(async () => {
    const isExpanded = this.isExpanded();
    const height = isExpanded ? getOriginalHeight(this.content().nativeElement) : 0;
    this.animation.setDimension({ height });

    this.accordionRef.instantAnimation()
      ? await this.animation.apply()
      : await this.animation.animate({ easing: cubicBezierEasing, duration: this.accordionRef.animationDuration() });

    if (isExpanded) {
      this.hasExpandedOnce = true;
      this.content().nativeElement.style.height = `auto`;
      this.cd.markForCheck(); // For lazy loading to trigger change detection
    }
  });

  private __setInitSize = afterNextRender(() => {
    this.animation = new Animation(this.content().nativeElement);
    this.animation.setDimension({ height: 0 }).applyImmediately();
  });
}

// eslint-disable-next-line no-mixed-operators
const cubicBezierEasing = (x: number) => 1 - (1 - x) * (1 - x);
