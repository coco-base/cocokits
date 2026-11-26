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
import { CckPopover } from './popover';
import { CckPopoverAnchor } from './popover-anchor';

/**
 * The button that opens and closes the popover, on a native `<button>`. Enter and Space work through the native click.
 *
 * It applies the root: write the root's inputs and outputs, like `[(open)]`, on the same button. To use it with another component, put both attributes on one element, like `<button cckButton [cckPopoverTriggerFor]="share">`.
 *
 * @example
 * <button type="button" [cckPopoverTriggerFor]="share">Share</button>
 * <ng-template #share>
 *   <cck-popover-content aria-label="Share this page">Anyone with the link can view it.</cck-popover-content>
 * </ng-template>
 * @cckPart trigger
 * @cckSlot default - The label of the button. When not set, the button is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'button[cckPopoverTriggerFor]',
  exportAs: 'cckPopoverTrigger',
  // The trigger owns the element's id and data-state, so a tooltip on the same button leaves them alone.
  providers: [{ provide: CCK_OVERLAY_TRIGGER, useExisting: forwardRef(() => CckPopoverTrigger) }],
  hostDirectives: [
    {
      directive: CckPopover,
      inputs: ['open', 'disableClose', 'closePredicate', 'restoreFocus'],
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
    // A root input written as a static attribute (`disableClose`) would also stay on the button.
    '[attr.open]': 'null',
    '[attr.disableclose]': 'null',
    '[attr.closepredicate]': 'null',
    '[attr.restorefocus]': 'null',
  },
})
export class CckPopoverTrigger {
  private readonly root = inject(CckPopover);
  protected readonly props = computed(() => this.root._parts().trigger);

  /**
   * The template of the popover: an `ng-template` with the `cck-popover-content` inside.
   * @example
   * <button type="button" [cckPopoverTriggerFor]="share">Share</button>
   * <ng-template #share><cck-popover-content aria-label="Share this page">Text</cck-popover-content></ng-template>
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly cckPopoverTriggerFor = input.required<TemplateRef<unknown>>();

  /**
   * The `id` of the trigger. When not set, the trigger gets a generated id.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | undefined>(undefined);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._trigger.set(element);
    this.root._template = this.cckPopoverTriggerFor;
    // The content is created next to the trigger, so it is checked with the trigger's view.
    this.root._portal.useContainer(inject(ViewContainerRef));
    // The nearest anchor around the trigger. The content of a popover provides none, so an outer one is never taken.
    const anchor = inject(CckPopoverAnchor, { optional: true });
    const link = {
      props: computed(() => this.root._parts().anchor),
      theme: computed(() => this.root._theme().anchor),
    };
    if (anchor) {
      anchor._link.set(link);
      this.root._anchor.set(anchor._element);
    }
    inject(DestroyRef).onDestroy(() => {
      anchor?._link.update((current) => (current === link ? null : current));
      this.root._trigger.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().trigger);
    // After the consumer's own click listeners, so their `preventDefault()` vetoes the toggle.
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
