import { DestroyRef, Directive, ElementRef, Renderer2, afterNextRender, computed, effect, inject } from '@angular/core';
import { bindAttrs, mergeIds } from '@cocokits/angular-core';
import { hasAccessibleName } from '@cocokits/utils';
import { injectCckDialogRoot } from './dialog-root';

/**
 * The window of the dialog, on a native `<dialog>` that opens with `showModal()`. It shows in the overlay container, not next to the trigger. Its `::backdrop` is the backdrop.
 *
 * Name it with a `cckDialogTitle`, `aria-label` or `aria-labelledby`.
 *
 * @example
 * <ng-template cckDialogPortal>
 *   <dialog cckDialogContent>
 *     <h2 cckDialogTitle>Delete project</h2>
 *     <button cckDialogClose type="button">Cancel</button>
 *   </dialog>
 * </ng-template>
 * @cckPart content
 * @cckTemplate ng-template[cckDialogPortal]
 * @cckSlot default - The title, the description, the body and the close buttons. When not set, the dialog is empty.
 * @cckDataAttr data-state - `open` or `closed`
 */
@Directive({
  selector: 'dialog[cckDialogContent]',
  exportAs: 'cckDialogContent',
  host: {
    '[class]': 'props().class',
    '[id]': 'attrs()?.id ?? props().id',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.data-state]': 'props()["data-state"]',
    '(close)': 'props().onClose($event)',
  },
})
export class CckDialogContent {
  private readonly root = injectCckDialogRoot('Content');
  protected readonly props = computed(() => this.root._parts().content);
  /** What the dialog service adds; `null` for a declarative Dialog, whose own attributes stay as written. */
  protected readonly attrs = this.root._serviceAttrs;
  /** The ids of the service's `ariaLabelledBy`, then the Title's; none when `ariaLabel` names the dialog. */
  protected readonly labelledBy = computed(() => {
    const attrs = this.attrs();
    if (!attrs) return this.props()['aria-labelledby'] ?? null;
    return attrs.label ? null : mergeIds(attrs.labelledBy, this.props()['aria-labelledby']);
  });
  /** The ids of the service's `ariaDescribedBy`, then the Description's. */
  protected readonly describedBy = computed(() => {
    const attrs = this.attrs();
    if (!attrs) return this.props()['aria-describedby'] ?? null;
    return mergeIds(attrs.describedBy, this.props()['aria-describedby']);
  });

  constructor() {
    const element = inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;
    this.root._content.set(element);
    inject(DestroyRef).onDestroy(() => {
      this.root._content.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().content);
    // The service owns these attributes of its `<dialog>`; a declarative one keeps what the author wrote.
    const renderer = inject(Renderer2);
    effect(() => {
      const attrs = this.attrs();
      if (!attrs) return;
      const values: Record<string, string | null> = {
        role: attrs.role === 'alertdialog' ? 'alertdialog' : null,
        'aria-label': attrs.label ?? null,
        'aria-modal': attrs.modal ? 'true' : null,
        autofocus: attrs.autofocus ? '' : null,
      };
      for (const [name, value] of Object.entries(values)) {
        if (value === null) renderer.removeAttribute(element, name);
        else renderer.setAttribute(element, name, value);
      }
    });
    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (!hasAccessibleName(element)) {
        console.warn(
          'CocoKits: a DialogContent has no accessible name. Add a cckDialogTitle with text, or an aria-label, or an aria-labelledby that points to an element with text, to the element with cckDialogContent.',
        );
      }
    });
  }
}
