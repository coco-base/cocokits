import { Directive, ElementRef, computed, inject, input } from '@angular/core';
import { afterReplay, bindAttrs, listenLast } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * A button that closes the Dialog. Place it in the content. It gives no label: write one, or an `aria-label`
 * for an icon-only button. With a value (`[cckDialogClose]="result"`) it closes a dialog opened by
 * `CckDialog` with that result; without one the result is `undefined`.
 *
 * @example
 * <button cckDialogClose>Cancel</button>
 * <button [cckDialogClose]="project">Save</button>
 * @cckPart close
 * @cckSlot default - The button label.
 */
@Directive({
  selector: 'button[cckDialogClose]',
  exportAs: 'cckDialogClose',
  host: {
    '[class]': 'props().class',
    '(click)': 'replayed($event)',
    '[attr.type]': 'props().type',
  },
})
export class CckDialogClose {
  /**
   * The result a dialog opened by `CckDialog` gives `beforeClosed()` and `afterClosed()`.
   * @remarks Angular only: the result of `CckDialog.open`; React and Vue pass results through parent state.
   * @cckSemantic none
   */
  readonly result = input<unknown>(undefined, { alias: 'cckDialogClose' });
  private readonly root = injectCckDialogRoot('Close');
  protected readonly props = computed(() => this.root._parts().close);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    bindAttrs(element, () => this.root._theme().close);
    // After the consumer's own click listeners, so their `preventDefault()` vetoes the close.
    listenLast(element, 'click', this.activate);
  }

  private readonly activate = (event: Event): void => {
    // The bare attribute (`cckDialogClose`) is the empty string: no value.
    if (!event.defaultPrevented) this.root._closeValue = this.result() === '' ? undefined : this.result();
    this.props().onClick(event);
  };

  /** A click made before hydration reaches only a `host` listener; `listenLast` does not see it. */
  protected replayed(event: Event): void {
    afterReplay(event, this.activate);
  }
}
