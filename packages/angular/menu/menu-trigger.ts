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
import { CckMenu } from './menu';

/**
 * The button that opens and closes the menu, on a native `<button>`. Enter and Space work through the native click. ArrowDown opens the menu on the first item and ArrowUp on the last.
 *
 * It applies the root: write the root's inputs and outputs, like `[(open)]`, on the same button. To use it with another component, put both attributes on one element, like `<button cckButton [cckMenuTriggerFor]="menu">`.
 *
 * @example
 * <button [cckMenuTriggerFor]="menu">Actions</button>
 * <ng-template #menu>
 *   <cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content>
 * </ng-template>
 * @cckPart trigger
 * @cckSlot default - The label of the button. When not set, the button is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'button[cckMenuTriggerFor]',
  exportAs: 'cckMenuTrigger',
  // The trigger owns the element's id and data-state, so a tooltip on the same button leaves them alone.
  providers: [{ provide: CCK_OVERLAY_TRIGGER, useExisting: forwardRef(() => CckMenuTrigger) }],
  hostDirectives: [
    {
      directive: CckMenu,
      inputs: ['open', 'disableClose', 'closePredicate'],
      outputs: ['openChange', 'opened', 'closed'],
    },
  ],
  host: {
    '[class]': 'props().class',
    '(click)': 'replayed($event)',
    '(keydown)': 'props().onKeyDown($event)',
    '[id]': 'props().id',
    '[attr.type]': 'props().type',
    '[attr.aria-haspopup]': 'props()["aria-haspopup"]',
    '[attr.aria-expanded]': 'props()["aria-expanded"]',
    '[attr.aria-controls]': 'props()["aria-controls"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
    // A root input written as a static attribute (`disableClose`) would also stay on the button.
    '[attr.open]': 'null',
    '[attr.disableclose]': 'null',
    '[attr.closepredicate]': 'null',
  },
})
export class CckMenuTrigger {
  private readonly root = inject(CckMenu);
  protected readonly props = computed(() => this.root._parts().trigger);

  /**
   * The template of the menu: an `ng-template` with the `cck-menu-content` inside.
   * @example
   * <button [cckMenuTriggerFor]="menu">Actions</button>
   * <ng-template #menu><cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content></ng-template>
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly cckMenuTriggerFor = input.required<TemplateRef<unknown>>();

  /**
   * The `id` of the trigger. When not set, the trigger gets a generated id.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | undefined>(undefined);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._trigger.set(element);
    this.root._triggerId.set(this.id);
    this.root._template = this.cckMenuTriggerFor;
    // The content is created next to the trigger, so it is checked with the trigger's view.
    this.root._portal.useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      this.root._triggerId.update((current) => (current === this.id ? null : current));
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
