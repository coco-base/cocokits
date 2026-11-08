import { Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { listenFirst, themeAttrs } from '@cocokits/angular-core';
import { buttonAnatomy, getButtonProps } from '@cocokits/machines/button';

/**
 * Shared base of `CckButton` and `CckButtonAnchor`; it is not exported from the entry point and
 * only exists so the two directives share code. It binds the root class from the machine props
 * (`[class]`, not `host.class`) and registers the click guard as a capture-phase listener.
 */
@Directive({
  host: {
    '[class]': 'props().class',
    '[attr.data-disabled]': 'props()["data-disabled"] ?? null',
  },
})
export abstract class CckButtonBase {
  /**
   * Whether the user cannot use the button. Tab skips a disabled button, and it sends no click. A disabled link does not open its page.
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
    // A `host` listener cannot stop the others (they are one DOM listener) and `host` has no capture phase, so the
    // guard that stops the other listeners of a disabled link is a capture listener.
    listenFirst(host, 'click', (event) => {
      this.props().onClick?.(event);
    });
  }
}
