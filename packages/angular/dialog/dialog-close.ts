import { Directive, ElementRef, computed, inject, input } from '@angular/core';
import { afterReplay, bindAttrs, listenLast } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * A button that closes the dialog, on a native `<button>`. Put it inside the content. It gets no label of its own, so write one, or add `aria-label` to a button with only an icon.
 *
 * @example
 * <dialog cckDialogContent aria-label="Save project">
 *   <button cckDialogClose type="button">Cancel</button>
 *   <button [cckDialogClose]="project" type="button">Save</button>
 * </dialog>
 * @cckPart close
 * @cckSlot default - The label of the button. When not set, the button is empty, so name it with `aria-label`.
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
   * The result of a dialog that `CckDialog` opened. `beforeClosed()` and `afterClosed()` emit it. When not set, the result is `undefined`.
   * @cckParity Only this framework has this member.
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
