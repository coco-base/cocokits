import { Directive, booleanAttribute, input } from '@angular/core';
import type { DialogLength } from '@cocokits/machines/dialog';
import type { DialogChangeDetails } from './dialog-types';
import type { CckDialogAutoFocus, CckDialogRestoreFocus, CckDialogRole } from './dialog-config';

/**
 * The options of a dialog root that the `CckDialogConfig` also has: the kind of the dialog, the focus, the
 * navigation and the size members. It has no behaviour of its own; `CckDialogRoot` reads the inputs.
 *
 * Not for direct use or extension outside CocoKits.
 * @internal
 */
@Directive()
export abstract class CckDialogOptions {
  /**
   * Whether Escape and a press on the backdrop leave the dialog open. The close button, a `<form method="dialog">`, the trigger and a change from the parent still close it.
   * @remarks It runs before `closePredicate`. Without Escape, a keyboard user can leave only with the controls inside the dialog, so keep a close button.
   * @defaultValue false
   * @cckSemantic dialog.disableClose
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * A function that decides whether a close that the dialog starts happens. Return `false` to keep it open. When not set, every close happens.
   * @remarks It runs for the close button, the trigger, a `<form method="dialog">`, Escape and a press on the backdrop, after `disableClose`. It does not run when the parent changes `open`. A refused `<form method="dialog">` shows the dialog again.
   * @example
   * <ng-container cckDialog [closePredicate]="canClose">
   *   <button cckDialogTrigger type="button">Edit</button>
   *   <ng-template cckDialogPortal>
   *     <dialog cckDialogContent aria-label="Edit">…</dialog>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: canClose = (details: DialogChangeDetails) => details.reason !== 'escape'; -->
   * @cckSemantic dialog.closePredicate
   */
  readonly closePredicate = input<((details: DialogChangeDetails) => boolean) | undefined>(undefined);

  /**
   * Whether the dialog is modal. `modal` adds the backdrop, makes the rest of the page inert and stops the page from scrolling.
   * @remarks A dialog that is not modal opens as a native non-modal `<dialog>`: no backdrop, no `aria-modal`, and the page stays usable. It closes on Escape, on a press outside and when the focus moves outside it. Its trigger opens and closes it. A change while the dialog is open applies at the next open.
   * @defaultValue true
   * @cckSemantic dialog.modal
   * @cckParity Not available in every framework.
   */
  readonly modal = input(true, { transform: booleanAttribute });

  /**
   * The role of the dialog. A native `<dialog>` has the role `dialog`, so only `'alertdialog'` is written. Use `'alertdialog'` for a message that needs an answer at once, and give it a `cck-dialog-description`.
   * @defaultValue 'dialog'
   * @cckSemantic dialog.role
   * @cckParity Not available in every framework.
   */
  readonly role = input<CckDialogRole>('dialog');

  /**
   * Which element gets the focus when the dialog opens. Any string other than the keywords is a selector, and the first element that matches it gets the focus.
   * @defaultValue 'first-tabbable'
   * @cckSemantic dialog.autoFocus
   * @cckParity Not available in every framework.
   */
  readonly autoFocus = input<CckDialogAutoFocus>('first-tabbable');

  /**
   * Where the focus goes when the dialog closes. A string is a selector, and an element gets the focus itself. It moves only when the focus is still inside the dialog or on the page body.
   * @defaultValue true
   * @cckSemantic dialog.restoreFocus
   * @cckParity Not available in every framework.
   */
  readonly restoreFocus = input<CckDialogRestoreFocus>(true);

  /**
   * When the dialog closes because the location changes. A close on navigation skips `disableClose` and `closePredicate`.
   * @cckValue true - The same as `'pop-state'`.
   * @cckValue 'pop-state' - The dialog closes when the user goes back or forward in the history, or the hash changes.
   * @cckValue 'url-change' - The dialog closes on any change of the URL that `Location` reports.
   * @cckValue false - The dialog never closes on navigation.
   * @remarks A dialog that the `CckDialog` service opens uses the config instead.
   * @defaultValue true
   * @cckSemantic dialog.closeOnNavigation
   * @cckParity Not available in every framework.
   */
  readonly closeOnNavigation = input<boolean | 'pop-state' | 'url-change'>(true);

  /**
   * The width of the dialog. A number is px, a string is any CSS length such as `'40rem'` or `'90vw'`. When not set, the theme decides the width.
   * @remarks The size members are the one inline style a part writes.
   * @cckSemantic dialog.width
   * @cckParity Not available in every framework.
   */
  readonly width = input<DialogLength | undefined>(undefined);

  /**
   * The height of the dialog. A number is px, a string is any CSS length. When not set, the height follows the content.
   * @cckSemantic dialog.height
   * @cckParity Not available in every framework.
   */
  readonly height = input<DialogLength | undefined>(undefined);

  /**
   * The smallest width of the dialog. A number is px, a string is any CSS length. When not set, the theme decides.
   * @cckSemantic dialog.minWidth
   * @cckParity Not available in every framework.
   */
  readonly minWidth = input<DialogLength | undefined>(undefined);

  /**
   * The smallest height of the dialog. A number is px, a string is any CSS length. When not set, the theme decides.
   * @cckSemantic dialog.minHeight
   * @cckParity Not available in every framework.
   */
  readonly minHeight = input<DialogLength | undefined>(undefined);

  /**
   * The largest width of the dialog. A number is px, a string is any CSS length. When not set, the theme decides.
   * @cckSemantic dialog.maxWidth
   * @cckParity Not available in every framework.
   */
  readonly maxWidth = input<DialogLength | undefined>(undefined);

  /**
   * The largest height of the dialog. A number is px, a string is any CSS length. When not set, the theme decides.
   * @cckSemantic dialog.maxHeight
   * @cckParity Not available in every framework.
   */
  readonly maxHeight = input<DialogLength | undefined>(undefined);
}
