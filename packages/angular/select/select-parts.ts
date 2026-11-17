import { DestroyRef, Directive, ElementRef, computed, effect, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckSelect } from './select';
import { CckSelectOption } from './select-option';

/**
 * The area above the options of the list. It holds the search. Write it first in the `cck-select`.
 *
 * @example
 * <cck-select filter aria-label="Dish" [(value)]="dish">
 *   <cck-select-header><input cckSelectSearch /></cck-select-header>
 *   <cck-select-option value="Pizza">Pizza</cck-select-option>
 * </cck-select>
 * @cckPart header
 * @cckSlot default - The search input. When not set, the header is empty.
 */
@Directive({
  selector: 'cck-select-header',
  exportAs: 'cckSelectHeader',
  host: { '[class]': 'root.parts().header.class' },
})
export class CckSelectHeader {
  protected readonly root = injectCckSelect<unknown>('cck-select-header');

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().header);
  }
}

/**
 * The search input of the list. Typing narrows the options to those whose text contains the text, without regard to case. It needs `filter` on the `cck-select`.
 *
 * While the list is open, the focus is in the search input, which has `role="combobox"`. Its `aria-activedescendant` names the highlighted option. Down Arrow and Up Arrow move the highlight, and Enter chooses it. Escape closes the list and returns the focus to the trigger. Tab closes the list.
 *
 * @example
 * <cck-select-header><input cckSelectSearch /></cck-select-header>
 * @cckPart search
 */
@Directive({
  selector: 'input[cckSelectSearch]',
  exportAs: 'cckSelectSearch',
  host: {
    '[class]': 'props().class',
    '[attr.type]': 'props().type',
    '[attr.role]': 'props().role',
    '[attr.aria-expanded]': 'props()["aria-expanded"]',
    '[attr.aria-controls]': 'props()["aria-controls"]',
    '[attr.aria-autocomplete]': 'props()["aria-autocomplete"]',
    '[attr.aria-activedescendant]': 'props()["aria-activedescendant"] ?? null',
    '[attr.aria-label]': 'props()["aria-label"]',
    '[attr.placeholder]': 'placeholder() ?? null',
    '[attr.autocomplete]': 'props().autocomplete',
    '[value]': 'props().value',
    '(input)': 'props().onInput($event)',
    '(keydown)': 'props().onKeyDown($event)',
    // A press in the list keeps the focus on the trigger; the search is the one place that takes the focus.
    '(mousedown)': '$event.stopPropagation()',
  },
})
export class CckSelectSearch {
  /**
   * The accessible name of the search input. Change it to match your language.
   * @defaultValue 'Search'
   * @cckSemantic select.search.ariaLabel
   */
  readonly ariaLabel = input('Search', { alias: 'aria-label' });

  /**
   * The text that shows in the search input while it is empty. When not set, the input shows no text then.
   * @cckSemantic select.search.placeholder
   */
  readonly placeholder = input<string | undefined>(undefined);

  private readonly root = injectCckSelect<unknown>('cckSelectSearch');
  protected readonly props = computed(() => this.root.parts().search);

  constructor() {
    const element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    this.root._searchElement.set(element);
    inject(DestroyRef).onDestroy(() => {
      this.root._searchElement.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().search);
    effect(() => {
      this.root._searchLabel.set(this.ariaLabel());
    });
  }
}

/**
 * The text that shows while the search matches no option. It is a polite status, so a screen reader announces it when it appears. It shows only while nothing matches; write it in the `cck-select` after the options.
 *
 * @example
 * <cck-select-empty>No dish found</cck-select-empty>
 * @cckPart empty
 * @cckSlot default - The text. When not set, the part is empty.
 */
@Directive({
  selector: 'cck-select-empty',
  exportAs: 'cckSelectEmpty',
  host: {
    '[class]': 'root.parts().empty.class',
    '[attr.role]': 'root.parts().empty.role',
    '[attr.hidden]': 'shown() ? null : ""',
  },
})
export class CckSelectEmpty {
  protected readonly root = injectCckSelect<unknown>('cck-select-empty');
  protected readonly shown = computed(() => this.root.parts().content['data-empty'] !== undefined);

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().empty);
  }
}

/**
 * The area below the options of the list. It holds your own actions, such as a button that adds an option. A press in it does not close the list.
 *
 * @remarks Write it last in the `cck-select`.
 *
 * @example
 * <cck-select-footer><button type="button" (click)="add()">Add a dish</button></cck-select-footer>
 * @cckPart footer
 * @cckSlot default - Your actions. When not set, the footer is empty.
 */
@Directive({
  selector: 'cck-select-footer',
  exportAs: 'cckSelectFooter',
  host: { '[class]': 'root.parts().footer.class' },
})
export class CckSelectFooter {
  protected readonly root = injectCckSelect<unknown>('cck-select-footer');

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().footer);
  }
}

/**
 * A second line of text under the text of an option. The option is described by it: the option points at it with `aria-describedby`.
 *
 * @example
 * <cck-select-option value="pro">Pro<cck-select-option-description>For teams</cck-select-option-description></cck-select-option>
 * @cckPart optionDescription
 * @cckSlot default - The text. When not set, the part is empty.
 */
@Directive({
  selector: 'cck-select-option-description',
  exportAs: 'cckSelectOptionDescription',
  host: { '[class]': 'props().class', '[id]': 'props().id' },
})
export class CckSelectOptionDescription {
  private readonly option = inject(CckSelectOption);
  private readonly root = injectCckSelect<unknown>('cck-select-option-description');
  protected readonly props = computed(() => this.root.parts().optionDescription(this.option._item()));

  constructor() {
    const option = this.option;
    option._descriptions.update((count) => count + 1);
    inject(DestroyRef).onDestroy(() => {
      option._descriptions.update((count) => count - 1);
    });
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().optionDescription);
  }
}

/**
 * Content before the text of an option, such as an icon or an avatar. It is decorative, so it has `aria-hidden`: the text of the option names the option.
 *
 * @example
 * <cck-select-option value="pro"><cck-select-option-leading><svg /></cck-select-option-leading>Pro</cck-select-option>
 * @cckPart optionLeading
 * @cckSlot default - The icon or the avatar. When not set, the part is empty.
 */
@Directive({
  selector: 'cck-select-option-leading',
  exportAs: 'cckSelectOptionLeading',
  host: {
    '[class]': 'root.parts().optionLeading.class',
    '[attr.aria-hidden]': 'root.parts().optionLeading["aria-hidden"]',
  },
})
export class CckSelectOptionLeading {
  protected readonly root = injectCckSelect<unknown>('cck-select-option-leading');

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().optionLeading);
  }
}
