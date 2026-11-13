import {
  Component,
  DestroyRef,
  afterNextRender,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  type OnInit,
} from '@angular/core';
import { CckAttrs, IdGenerator, bindAttrs, listenLast, themeIcons } from '@cocokits/angular-core';
import { CckSvgIcon } from '@cocokits/angular/svg-icon';
import { selectAnatomy, type SelectItem } from '@cocokits/machines/select';
import { resolvePartIconName } from '@cocokits/shared';
import { hasInteractiveContent } from '@cocokits/utils';
import { injectCckSelect } from './select';
import { CckSelectOptionGroup } from './select-option-group';

/**
 * One choice in the list of a Select. Its `value` is the value that the Select holds when the user chooses it. You write the text of the option inside it.
 *
 * The content must not be interactive. A mark that shows the choice is made for you: a check, or a box with `multiple`. The trigger and type-to-find use the text of the option as its label.
 *
 * In a single Select, an option with the value `null` or `undefined` clears the value, unless `canSelectNullableOptions` is set. An option with the value `''` clears it and shows the placeholder.
 *
 * @example
 * <cck-select-option value="Cake">Cake</cck-select-option>
 * @typeParam T - The type of the value. The default is `string`.
 * @cckPart option
 * @cckPart optionIndicator
 * @cckPart optionContent
 * @cckSlot default - The text of the option. When not set, the option shows no text.
 */
@Component({
  selector: 'cck-select-option',
  exportAs: 'cckSelectOption',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, CckSvgIcon],
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.aria-selected]': 'props()["aria-selected"]',
    '[attr.aria-disabled]': 'props()["aria-disabled"]',
    '[attr.data-selected]': 'props()["data-selected"]',
    '[attr.data-highlighted]': 'props()["data-highlighted"]',
    '[attr.data-disabled]': 'props()["data-disabled"]',
    '(pointermove)': 'props().onPointerMove($event)',
  },
  template: `
    <span
      [class]="parts().optionIndicator.class"
      [attr.aria-hidden]="parts().optionIndicator['aria-hidden']"
      [cckAttrs]="_root._theme().optionIndicator"
    >
      @if (indicatorIconName && props()['data-selected'] !== undefined) {
        <cck-svg-icon [iconName]="indicatorIconName" />
      }
    </span>
    <span [class]="parts().optionContent.class" [cckAttrs]="_root._theme().optionContent"><ng-content /></span>
  `,
})
export class CckSelectOption<T = string> implements OnInit {
  /**
   * The value of the option. The Select holds it when the user chooses the option.
   * @cckSemantic select.option.value
   */
  readonly value = input.required<T | null | undefined>();

  /**
   * The `id` of the option element. The trigger uses it as `aria-activedescendant` while the option is highlighted. When not set, an id is made for you.
   * @cckSemantic select.option.id
   * @defaultValue generated
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * Whether the option is disabled. The user cannot choose it, and keys skip it. A disabled group also disables it.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @internal */
  readonly _root = injectCckSelect<unknown>('cck-select-option');
  private readonly group = inject(CckSelectOptionGroup, { optional: true });
  private readonly key = inject(IdGenerator).getId(selectAnatomy.classes.option);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isDisabled = computed(() => this.disabled() || this.group?.disabled() === true);
  private readonly item = computed<SelectItem<unknown>>(() => ({
    key: this.key,
    value: this.value(),
    disabled: this.isDisabled(),
    id: this.id(),
  }));
  protected readonly parts = this._root.parts;
  /** The icon the theme names for the option indicator; the part shows it while the option is selected. */
  protected readonly indicatorIconName = resolvePartIconName(
    themeIcons().partIconNames,
    selectAnatomy.block,
    'optionIndicator',
  );
  protected readonly props = computed(() => this._root.parts().option(this.item()));

  private unregister: (() => void) | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.unregister?.();
    });
    bindAttrs(this.element, () => this._root._theme().option);
    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (hasInteractiveContent(this.element)) {
        console.warn(
          'CocoKits: a SelectOption holds a focusable or interactive element. An option is not interactive: use plain text and markup.',
        );
      }
    });
    // After the author's own listeners, so a `preventDefault()` there vetoes the choice.
    listenLast(this.element, 'click', (event) => {
      this.props().onClick(event);
    });
  }

  /** Registers once the inputs are set: the Select reads the value of every registered option. */
  ngOnInit(): void {
    this.unregister = this._root._registerOption({
      key: this.key,
      element: this.element,
      option: this,
      value: this.value,
      id: this.id,
      disabled: this.isDisabled,
      label: () => this.element.querySelector(`.${selectAnatomy.classes.optionContent}`)?.textContent.trim() ?? '',
    });
  }
}
