import {
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { CCK_OVERLAY_TRIGGER, bindAttrs, themeAttrs } from '@cocokits/angular-core';
import { getMenuSubTriggerProps, menuAnatomy, type MenuEvent, type MenuItemEntry } from '@cocokits/machines/menu';
import { CckMenuSub } from './menu-sub';

/**
 * The item of a menu that opens a submenu. It has `role="menuitem"`, `aria-haspopup="menu"` and `aria-expanded`. Its content is yours: text, and an icon if you like.
 *
 * @remarks It applies the submenu: write its `[(open)]` on the sub-trigger. A disabled sub-trigger stays in the menu and can have focus, but it opens nothing.
 *
 * @example
 * <button type="button" [cckMenuTriggerFor]="menu">Actions</button>
 * <ng-template #menu>
 *   <cck-menu-content>
 *     <cck-menu-item>Rename</cck-menu-item>
 *     <cck-menu-sub-trigger [cckMenuTriggerFor]="share">Share</cck-menu-sub-trigger>
 *     <ng-template #share>
 *       <cck-menu-sub-content><cck-menu-item>Email</cck-menu-item></cck-menu-sub-content>
 *     </ng-template>
 *   </cck-menu-content>
 * </ng-template>
 * @cckPart subTrigger
 * @cckSlot default - The label of the item. When not set, the item is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'cck-menu-sub-trigger',
  exportAs: 'cckMenuSubTrigger',
  // The sub-trigger owns the element's id and data-state, so a tooltip on it leaves them alone.
  providers: [{ provide: CCK_OVERLAY_TRIGGER, useExisting: forwardRef(() => CckMenuSubTrigger) }],
  hostDirectives: [{ directive: CckMenuSub, inputs: ['open'], outputs: ['openChange'] }],
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.tabindex]': 'props().tabIndex',
    '[attr.aria-haspopup]': 'props()["aria-haspopup"]',
    '[attr.aria-expanded]': 'props()["aria-expanded"]',
    '[attr.aria-controls]': 'props()["aria-controls"] ?? null',
    '[attr.aria-disabled]': 'props()["aria-disabled"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
    '[attr.data-disabled]': 'props()["data-disabled"] ?? null',
    '[attr.data-highlighted]': 'props()["data-highlighted"] ?? null',
    '[attr.disabled]': 'null',
    // The root input `open` written as a static attribute would also stay on the item.
    '[attr.open]': 'null',
    '(click)': 'props().onClick($event)',
    '(pointermove)': 'props().onPointerMove($event)',
    '(focus)': 'props().onFocus($event)',
    '(keydown)': 'props().onKeyDown($event)',
  },
})
export class CckMenuSubTrigger {
  /**
   * Whether the sub-trigger is disabled. It stays focusable and opens nothing.
   * @cckSemantic menu.item.disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * The `id` of the sub-trigger. When not set, the sub-trigger gets a generated id.
   * @remarks The sub-content is named by the id the sub-trigger renders.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * The template of the submenu: an `ng-template` with the `cck-menu-sub-content` inside.
   * @example
   * <button type="button" [cckMenuTriggerFor]="menu">Actions</button>
   * <ng-template #menu>
   *   <cck-menu-content>
   *     <cck-menu-item>Rename</cck-menu-item>
   *     <cck-menu-sub-trigger [cckMenuTriggerFor]="share">Share</cck-menu-sub-trigger>
   *     <ng-template #share>
   *       <cck-menu-sub-content><cck-menu-item>Email</cck-menu-item></cck-menu-sub-content>
   *     </ng-template>
   *   </cck-menu-content>
   * </ng-template>
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly cckMenuTriggerFor = input.required<TemplateRef<unknown>>();

  private readonly sub = inject(CckMenuSub);
  private readonly parent = this.sub._parent;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly registration = this.parent._addItem({
    element: this.element,
    disabled: this.disabled,
    kind: computed(() => 'item' as const),
    checked: computed(() => false),
    value: computed(() => undefined),
    hasDescription: computed(() => false),
    apply: () => undefined,
  });

  private readonly entry = computed<MenuItemEntry>(() => ({
    key: this.registration.key,
    disabled: this.disabled(),
    text: '',
  }));

  protected readonly props = computed(() =>
    getMenuSubTriggerProps(
      this.parent._state(),
      this.entry(),
      { id: this.sub._id, open: this.sub.open(), mounted: this.sub._mounted(), triggerId: this.id() },
      (event) => {
        this.send(event);
      },
    ),
  );

  constructor() {
    const sub = this.sub;
    sub._trigger.set(this.element);
    sub._triggerId.set(this.id);
    sub._template = this.cckMenuTriggerFor;
    // The sub-content is created next to the sub-trigger, so it is checked with the sub-trigger's view.
    sub._portal.useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      sub._triggerId.update((current) => (current === this.id ? null : current));
      sub._trigger.update((current) => (current === this.element ? null : current));
      this.registration.remove();
    });
    // The theme options of the sub-trigger's own element (a theme directive on it), else the ones of the menu around it.
    const theme = themeAttrs(menuAnatomy);
    bindAttrs(this.element, () => theme().subTrigger);
    // A disabled sub-trigger opens nothing; the submenu reads it through the sub-trigger.
    sub._disabled = this.disabled;
  }

  /** The submenu answers its own events; the parent menu answers the rest. */
  private send(event: MenuEvent): void {
    if (!event.type.startsWith('SUB.')) {
      this.parent._send(event);
      return;
    }
    // The pointer on this sub-trigger closes the other submenus of the parent menu, as on any other item.
    if (event.type === 'SUB.TRIGGER.POINTER_MOVE')
      for (const sub of this.parent._subs()) if (sub !== this.sub) sub._pointerLeft(event.event);
    this.sub._send(event);
  }
}
