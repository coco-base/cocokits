import { Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { listenFirst, themeAttrs } from '@cocokits/angular-core';
import { buttonAnatomy, getButtonProps, type ButtonProps, type ButtonRootProps } from '@cocokits/machines/button';

/** The anatomy a button directive applies its theme attributes for: the Button's, or one with the same root. */
interface ButtonAnatomy {
  readonly block: string;
  readonly parts: { readonly root: unknown };
}

/**
 * The button contract that `CckButton`, `CckButtonAnchor` and the Icon button directives share: the `disabled`
 * input, the root class and disabled markers from the machine props (`[class]`, not `host.class`) and the click
 * guard, registered as a capture-phase listener. A subclass adds its selector, its host element
 * (`rootElementTag`) and the `type`/`disabled`/link bindings of that element; an Icon button also overrides
 * `themeAnatomy` and `machineProps`.
 *
 * Not for direct use or extension outside CocoKits: it is exported only because the Button and the Icon button
 * are separate entry points and cannot share a relative file. Its members are the members of both components,
 * so changing one weighs as the same change on both.
 * @internal
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

  /** The anatomy whose root part gets the theme attributes. A method, not a field: the constructor calls it. */
  protected themeAnatomy(): ButtonAnatomy {
    return buttonAnatomy;
  }

  /** The machine call that gives the root props. A method, so a subclass can swap the machine. */
  protected machineProps(props: ButtonProps): ButtonRootProps {
    return getButtonProps(props);
  }

  protected readonly props = computed(() =>
    this.machineProps({ element: this.rootElementTag, disabled: this.disabled() }),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    themeAttrs(this.themeAnatomy()); // applies the root part's theme attributes to the host

    // Not a host `(click)`: only a capture-phase listener runs before the consumer's handlers and RouterLink.
    // A `host` listener cannot stop the others (they are one DOM listener) and `host` has no capture phase, so the
    // guard that stops the other listeners of a disabled link is a capture listener.
    listenFirst(host, 'click', (event) => {
      this.props().onClick?.(event);
    });
  }
}
