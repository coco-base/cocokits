import { Directive, booleanAttribute, forwardRef, input, model, output } from '@angular/core';
import { CckOverlayLayer, CckPortal } from '@cocokits/angular-core';
import type { MenuEvent, MenuTransition } from '@cocokits/machines/menu';
import { CckMenuBase, type MenuChangeDetails } from './menu-base';

export { injectCckMenu } from './menu-inject';
export type {
  MenuChangeDetails,
  MenuContentRegistration,
  MenuItemRegistration,
  MenuOpenChangeReason,
} from './menu-base';

/**
 * A button that opens a list of actions. Put the root on an `ng-container`; it makes no element. It holds the open state and links the trigger, the content and the items.
 *
 * You write the content in a `cckMenuPortal` template. It shows in the overlay container, not next to the trigger.
 *
 * On open, the focus moves to the first item. The arrow keys, Home, End and typing move between the items. Enter, Space or a click runs one. The menu then closes and the focus goes back to the trigger. Escape, a press outside and Tab also close it.
 *
 * @example
 * <ng-container cckMenu [(open)]="menuOpen">
 *   <button cckMenuTrigger>Actions</button>
 *   <ng-template cckMenuPortal>
 *     <cck-menu-content>
 *       <cck-menu-item (triggered)="rename()">Rename</cck-menu-item>
 *       <cck-menu-item [disabled]="true">Move</cck-menu-item>
 *       <cck-menu-item (triggered)="remove()">Delete</cck-menu-item>
 *     </cck-menu-content>
 *   </ng-template>
 * </ng-container>
 * @example
 * <ng-container cckMenu>
 *   <button cckMenuTrigger>View</button>
 *   <ng-template cckMenuPortal>
 *     <cck-menu-content>
 *       <cck-menu-group>
 *         <cck-menu-group-label>Layout</cck-menu-group-label>
 *         <cck-menu-checkbox-item [(checked)]="grid"><cck-menu-item-indicator></cck-menu-item-indicator> Grid</cck-menu-checkbox-item>
 *         <cck-menu-radio-group [(value)]="sort">
 *           <cck-menu-radio-item value="name"><cck-menu-item-indicator></cck-menu-item-indicator> Name</cck-menu-radio-item>
 *           <cck-menu-radio-item value="date"><cck-menu-item-indicator></cck-menu-item-indicator> Date</cck-menu-radio-item>
 *         </cck-menu-radio-group>
 *       </cck-menu-group>
 *       <cck-menu-item>
 *         <cck-menu-item-leading><cck-svg-icon iconName="copy"></cck-svg-icon></cck-menu-item-leading>
 *         Duplicate
 *         <cck-menu-item-supporting-text>Makes a copy.</cck-menu-item-supporting-text>
 *         <cck-menu-item-shortcut>Ctrl D</cck-menu-item-shortcut>
 *         <cck-menu-item-trailing><cck-svg-icon iconName="chevron-right"></cck-svg-icon></cck-menu-item-trailing>
 *       </cck-menu-item>
 *       <ng-container cckMenuSub>
 *         <cck-menu-sub-trigger>More</cck-menu-sub-trigger>
 *         <cck-menu-sub-content><cck-menu-item>Export</cck-menu-item></cck-menu-sub-content>
 *       </ng-container>
 *     </cck-menu-content>
 *   </ng-template>
 * </ng-container>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The trigger and the `cckMenuPortal` template. When not set, there is nothing to open.
 */
@Directive({
  selector: '[cckMenu]',
  exportAs: 'cckMenu',
  providers: [CckPortal, CckOverlayLayer, { provide: CckMenuBase, useExisting: forwardRef(() => CckMenu) }],
})
export class CckMenu extends CckMenuBase {
  /**
   * Whether the menu is open. Use `[(open)]` to read and change it.
   * @remarks `openChange` emits the new value when the menu opens or closes itself. `opened` and `closed` also send the reason.
   * @defaultValue false
   */
  readonly open = model(false);

  /**
   * Whether Escape and a press outside keep the menu open. The trigger, an item, a focus leave and a change from the parent still close it.
   * @remarks It runs before `closePredicate`. Keep a way to close the menu for keyboard users, such as the trigger.
   * @defaultValue false
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * A function that decides whether a close that the menu starts happens. Return `false` to keep it open. When not set, every close happens.
   * @remarks It runs for every close the menu starts, after `disableClose`. Those are the trigger, an item, Escape, a press outside and a focus leave. It does not run when the parent changes `open`.
   * @example
   * <ng-container cckMenu [closePredicate]="canClose">
   *   <button cckMenuTrigger>Actions</button>
   *   <ng-template cckMenuPortal>
   *     <cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: canClose = (details: MenuChangeDetails) => details.reason !== 'outside-press'; -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly closePredicate = input<((details: MenuChangeDetails) => boolean) | undefined>(undefined);

  /**
   * Emits after the user opens the menu with the trigger. It sends the `reason` and the `event`.
   * @remarks It never emits when the parent changes `open`.
   * @example
   * <ng-container cckMenu (opened)="onOpen($event)">
   *   <button cckMenuTrigger>Actions</button>
   *   <ng-template cckMenuPortal>
   *     <cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: onOpen(details: MenuChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly opened = output<MenuChangeDetails>();

  /**
   * Emits after the menu closes itself. It sends the `reason` and the `event`.
   * @remarks The trigger, an item, Escape, a press outside and a focus leave close it. It never emits when the parent changes `open`.
   * @example
   * <ng-container cckMenu (closed)="onClose($event)">
   *   <button cckMenuTrigger>Actions</button>
   *   <ng-template cckMenuPortal>
   *     <cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: onClose(details: MenuChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly closed = output<MenuChangeDetails>();

  protected setOpen(open: boolean): void {
    this.open.set(open);
  }

  protected announce(next: MenuTransition, details: MenuChangeDetails): void {
    (next.open ? this.opened : this.closed).emit(details);
  }

  protected refuses(reason: 'escape' | 'outside-press' | 'focus-out'): boolean {
    return this.disableClose() && (reason === 'escape' || reason === 'outside-press');
  }

  protected vetoes(details: MenuChangeDetails): boolean {
    return this.closePredicate()?.(details) === false;
  }

  protected handleSub(): boolean {
    return false;
  }

  protected dismissEvent(reason: 'escape' | 'outside-press' | 'focus-out', event: Event | null): MenuEvent {
    return { type: 'CONTENT.DISMISS', reason, event };
  }
}
