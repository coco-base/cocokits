import {
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { CCK_OVERLAY_TRIGGER, afterReplay, bindAttrs, listenLast } from '@cocokits/angular-core';
import { CckDialogRoot } from './dialog-root';

/**
 * The button that opens the dialog, on a native `<button>`. Enter and Space work through the native click.
 *
 * It applies the root: write the root's inputs and outputs, like `[(open)]`, `role` or `width`, on the same button. They set the dialog, never the button. To use it with another component, put both attributes on one element, like `<button cckButton [cckDialogTriggerFor]="deleteProject">`.
 *
 * @remarks `autoFocus` is a root input, so the button drops a native `autofocus` attribute. To focus the button when the page opens, call its `focus()` in `afterNextRender`.
 *
 * @example
 * <button type="button" [cckDialogTriggerFor]="deleteProject">Delete project</button>
 * <ng-template #deleteProject>
 *   <dialog cckDialogContent>
 *     <h2 cckDialogTitle>Delete project</h2>
 *     <button cckDialogClose type="button">Cancel</button>
 *   </dialog>
 * </ng-template>
 * @cckPart trigger
 * @cckSlot default - The label of the button. When not set, the button is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'button[cckDialogTriggerFor]',
  exportAs: 'cckDialogTrigger',
  // The trigger owns the element's id and data-state, so a tooltip on the same button leaves them alone.
  providers: [{ provide: CCK_OVERLAY_TRIGGER, useExisting: forwardRef(() => CckDialogTrigger) }],
  hostDirectives: [
    {
      directive: CckDialogRoot,
      inputs: [
        'open',
        'disableClose',
        'closePredicate',
        'modal',
        'role',
        'autoFocus',
        'restoreFocus',
        'closeOnNavigation',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
      ],
      outputs: ['openChange', 'opened', 'closed'],
    },
  ],
  host: {
    '[class]': 'props().class',
    '(click)': 'replayed($event)',
    '[id]': 'id() ?? props().id',
    '[attr.type]': 'props().type',
    '[attr.aria-haspopup]': 'props()["aria-haspopup"]',
    '[attr.aria-expanded]': 'props()["aria-expanded"]',
    '[attr.aria-controls]': 'props()["aria-controls"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
    // A root input written as a static attribute (`role="alertdialog"`, `width="40rem"`) would also stay on the button.
    '[attr.open]': 'null',
    '[attr.disableclose]': 'null',
    '[attr.closepredicate]': 'null',
    '[attr.modal]': 'null',
    '[attr.role]': 'null',
    '[attr.autofocus]': 'null',
    '[attr.restorefocus]': 'null',
    '[attr.closeonnavigation]': 'null',
    '[attr.width]': 'null',
    '[attr.height]': 'null',
    '[attr.minwidth]': 'null',
    '[attr.minheight]': 'null',
    '[attr.maxwidth]': 'null',
    '[attr.maxheight]': 'null',
  },
})
export class CckDialogTrigger {
  private readonly root = inject(CckDialogRoot);
  protected readonly props = computed(() => this.root._parts().trigger);

  /**
   * The template of the dialog: an `ng-template` with the `<dialog cckDialogContent>` inside.
   * @example
   * <button type="button" [cckDialogTriggerFor]="deleteProject">Delete project</button>
   * <ng-template #deleteProject>
   *   <dialog cckDialogContent aria-label="Delete project"><button cckDialogClose type="button">Cancel</button></dialog>
   * </ng-template>
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly cckDialogTriggerFor = input.required<TemplateRef<unknown>>();

  /**
   * The `id` of the trigger. When not set, the trigger gets a generated id.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | undefined>(undefined);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._trigger.set(element);
    this.root._template = this.cckDialogTriggerFor;
    // The content is created next to the trigger, so it is checked with the trigger's view.
    this.root._portal.useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      this.root._trigger.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().trigger);
    // After the consumer's own click listeners, so their `preventDefault()` vetoes the open.
    listenLast(element, 'click', this.activate);
  }

  private readonly activate = (event: Event): void => {
    // A dialog that is not modal leaves the trigger usable while it is open: a press closes it.
    if (!this.root._modalNow() && this.root.open()) this.root._parts().close.onClick(event);
    else this.props().onClick(event);
  };

  /** A click made before hydration reaches only a `host` listener; `listenLast` does not see it. */
  protected replayed(event: Event): void {
    afterReplay(event, this.activate);
  }
}
