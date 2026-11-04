import { Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { listenFirst, themeAttrs } from '@cocokits/angular-core';
import { buttonAnatomy, getButtonProps } from '@cocokits/machines/button';

/**
 * Shared base of `CckButton` and `CckButtonAnchor`; it is not exported from the entry point and
 * only exists so the two directives share code. It binds the root class from the machine props
 * (`[class]`, not `host.class`) and registers the click guard as a capture-phase listener (guide row "Guard that stops other listeners").
 */
@Directive({
  host: {
    '[class]': 'props().class',
    '[attr.data-disabled]': 'props()["data-disabled"] ?? null',
  },
})
export abstract class CckButtonBase {
  /**
   * Whether the button is disabled. A disabled button is skipped by Tab and fires no click;
   * a disabled link does not navigate.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** The element the directive sits on; it decides how the disabled state is expressed. */
  protected abstract readonly rootElementTag: 'button' | 'a';

  protected readonly props = computed(() =>
    getButtonProps({ element: this.rootElementTag, disabled: this.disabled() }),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    themeAttrs(buttonAnatomy); // applies the root part's theme attributes to the host

    // Not a host `(click)`: only a capture-phase listener runs before the consumer's handlers and RouterLink.
    // Full reason: row "Guard that stops other listeners" in
    // docs/style-guides/angular/host-bindings-and-data-attrs.md#exceptions.
    listenFirst(host, 'click', (event) => {
      this.props().onClick?.(event);
    });
  }
}
