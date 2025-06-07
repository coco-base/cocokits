import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  InputSignal,
  output,
  TemplateRef,
  untracked,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { toArray } from '@cocokits/common-utils';

import { AccordionStore } from '../accordion.store';
import { AccordionHeaderIconTemplateDirective } from '../accordion-header-icon.tmpl-directive';
import { AccordionPanelComponent } from '../accordion-panel/accordion-panel.component';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [AccordionStore],
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class AccordionComponent<
  TValue extends string | number | unknown = unknown,
> extends _UiBaseComponent<'accordion'> {
  protected readonly componentName = 'accordion';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.instantAnimation(), classes: this.classNames().withoutAnimation },
    { if: this.multiMode(), classes: this.classNames().multiMode },
    { if: !this.multiMode(), classes: this.classNames().singleMode },
  ]);

  private accordionStore = inject(AccordionStore);

  /**
   * Whether to show the animation for the accordion expansion and collapse.
   */
  public instantAnimation: InputSignal<boolean> = input(false);

  /**
   * The duration of the animation in milliseconds when expanding or collapsing the accordion panels.
   */
  public animationDuration: InputSignal<number> = input(300);

  /**
   * Whether to allow multiple accordion panels to be expanded at the same time.
   * If set to true, multiple panels can be expanded simultaneously.
   */
  public multiMode: InputSignal<boolean> = input(false);

  /**
   * The position of the icon in the accordion header.
   * Can be either 'left' or 'right'.
   */
  public iconPosition = input<'left' | 'right'>('right');

  /**
   * The trigger for toggling the accordion header.
   * Can be either 'header' or 'icon'.
   */
  public toggleTrigger = input<'header' | 'icon'>('header');

  /**
   * The values of the expanded accordion panels or an array of values in multiple mode.
   */
  public expanded = input<TValue[] | TValue>();

  /**
   * Emitted when the expanded state of an accordion panel changes.
   * The emitted value contains the id and index of the expanded panel.
   */
  public expandedChange = output<TValue[] | TValue | null>();

  /** @internal */
  public _panelsRef = contentChildren(AccordionPanelComponent);

  /** @internal */
  public _customIconTemp = contentChild(AccordionHeaderIconTemplateDirective, { read: TemplateRef<HTMLElement> });

  private __onInputExpandedChange = effect(() => {
    const expanded = this.expanded();
    untracked(() => {
      const ids = toArray(expanded).map((value) => {
        const panel = this._panelsRef().find((_panel) => _panel.value() === value);
        if (!panel) {
          throw new Error(`Can not find accordion panel with value: ${value}`);
        }
        return panel._id;
      });
      this.accordionStore.setExpandedPanelIds(ids);
    });
  });

  private __onStoreExpandedChange = effect(() => {
    const expandedPanelIds = this.accordionStore.expandedPanelIds();
    untracked(() => {
      const expandedValues: TValue[] = expandedPanelIds.map((id) => {
        const value = this._panelsRef()
          .find((panel) => panel._id === id)
          ?.value() as TValue | undefined;
        if (!value) {
          throw new Error(`Can not find value for accordion panel with id: ${id}`);
        }

        return value;
      });

      this.expandedChange.emit(this.multiMode() ? expandedValues : (expandedValues[0] ?? null));
    });
  });

  private __onMultiModeChange = effect(() => {
    this.accordionStore.setMultiMode(this.multiMode());
  });
}
