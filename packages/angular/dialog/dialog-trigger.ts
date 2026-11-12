import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { afterReplay, bindAttrs, listenLast } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * The button that opens the dialog, on a native `<button>`. Enter and Space work through the native click.
 *
 * To use it with another component, put both attributes on one element, like `<button cckButton cckDialogTrigger>`.
 *
 * @example
 * <ng-container cckDialog>
 *   <button cckDialogTrigger type="button">Delete project</button>
 * </ng-container>
 * @cckPart trigger
 * @cckSlot default - The label of the button. When not set, the button is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'button[cckDialogTrigger]',
  exportAs: 'cckDialogTrigger',
  host: {
    '[class]': 'props().class',
    '(click)': 'replayed($event)',
    '[id]': 'id() ?? props().id',
    '[attr.type]': 'props().type',
    '[attr.aria-haspopup]': 'props()["aria-haspopup"]',
    '[attr.aria-expanded]': 'props()["aria-expanded"]',
    '[attr.aria-controls]': 'props()["aria-controls"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
  },
})
export class CckDialogTrigger {
  private readonly root = injectCckDialogRoot('Trigger');
  protected readonly props = computed(() => this.root._parts().trigger);
  /**
   * The `id` of the trigger. When not set, the trigger gets a generated id.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | undefined>(undefined);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._trigger.set(element);
    inject(DestroyRef).onDestroy(() => {
      this.root._trigger.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().trigger);
    // After the consumer's own click listeners, so their `preventDefault()` vetoes the open.
    listenLast(element, 'click', this.activate);
  }

  private readonly activate = (event: Event): void => {
    this.props().onClick(event);
  };

  /** A click made before hydration reaches only a `host` listener; `listenLast` does not see it. */
  protected replayed(event: Event): void {
    afterReplay(event, this.activate);
  }
}
